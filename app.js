require('dotenv').config();
const express = require('express');
const { transcribeAudio, extractLeadInfo } = require('./ai');
const supabase = require('./supabase'); // regular client for normal queries
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Admin Supabase client (bypasses RLS) ----------
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Must be set in Render environment
);

// ---------- Authentication Middleware ----------
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(403).json({ error: 'No business associated' });

  req.user = user;
  req.businessId = profile.business_id;
  next();
}

// ---------- Public Routes ----------
app.get('/', (req, res) => res.render('index'));
app.get('/privacy-policy', (req, res) => { /* your HTML */ });
app.get('/terms-and-conditions', (req, res) => { /* your HTML */ });
app.get('/terms', (req, res) => res.redirect('/terms-and-conditions'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/pricing', async (req, res) => res.render('pricing'));
app.get('/test-call-form', (req, res) => { /* your form */ });

// API endpoints
app.get('/api/plans', async (req, res) => {
  const { data } = await supabaseAdmin.from('plans').select('*');
  res.json(data);
});

// ---------- Signup ----------
app.post('/api/signup', express.json(), async (req, res) => {
  const { email, password, businessName, fullName } = req.body;
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({ email, password });
    if (authError) throw authError;

    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .insert({ name: businessName, phone_number: null })
      .select()
      .single();
    if (bizError) throw bizError;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: authData.user.id, business_id: business.id, full_name: fullName });
    if (profileError) throw profileError;

    res.json({ success: true, user: authData.user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

// ---------- Login ----------
app.post('/api/login', express.json(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json({ session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
});

// ---------- Checkout ----------
app.post('/api/create-checkout-session', authMiddleware, async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;
  try {
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('stripe_customer_id, name')
      .eq('id', req.businessId)
      .single();
    if (bizError) throw bizError;

    let customerId = business.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: business.name,
        metadata: { business_id: req.businessId }
      });
      customerId = customer.id;
      await supabaseAdmin
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.businessId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Stripe Webhook (single copy) ----------
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0].price.id;

      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (business && plan) {
        await supabaseAdmin.from('subscriptions').upsert({
          business_id: business.id,
          plan_id: plan.id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        await supabaseAdmin
          .from('businesses')
          .update({ plan_id: plan.id })
          .eq('id', business.id);
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', deletedSub.id);
      // Optionally set business plan to null or a default
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
});

// ---------- Protected Dashboard ----------
app.get('/dashboard', authMiddleware, async (req, res) => {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', req.businessId)
    .single();
  res.json({ message: 'Welcome to your dashboard', business });
});

// ---------- Test call endpoints (unchanged) ----------
app.post('/test-call', async (req, res) => { /* your existing code */ });
app.get('/test-call-form', (req, res) => { /* your existing form */ });

// ---------- Incoming Twilio endpoints ----------
app.post('/incoming-call', express.urlencoded({ extended: true }), async (req, res) => { /* your code */ });
app.post('/voicemail-recording', express.urlencoded({ extended: true }), async (req, res) => { /* your code */ });

// ---------- Start Server ----------
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
  console.log(`Public URL: https://subshopper.online`);
});