require('dotenv').config();
const express = require('express');
const { transcribeAudio, extractLeadInfo } = require('./ai');
const supabase = require('./supabase'); // regular client for normal queries
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // enable cookie parsing

// ---------- Admin Supabase client (bypasses RLS) ----------
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Must be set in Render environment
);

// ---------- Authentication Middleware ----------
async function authMiddleware(req, res, next) {
  // Try to get token from Authorization header or from cookie
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    token = req.cookies.token;
  }
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('business_id, is_demo')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(403).json({ error: 'No business associated' });

  req.user = user;
  req.businessId = profile.business_id;
  req.isDemo = profile.is_demo || false;
  next();
}

// ---------- Public Routes ----------
app.get('/', (req, res) => res.render('index'));

app.get('/privacy-policy', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - Revenue Recovery System</title>
        <style>...</style>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        <h2>Mobile Information (SMS)</h2>
        <p><strong>Mobile Information:</strong> We do not share mobile information with third parties or affiliates for marketing or promotional purposes. All information collected via SMS is used solely for lead recovery and customer service. Text messaging originator opt-in data and consent are not shared with any third parties.</p>
        <h2>Opt-Out Instructions</h2>
        <p>You may opt out of receiving text messages at any time by replying <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong>. Message and data rates may apply.</p>
        <p><a href="/">← Back to Home</a></p>
      </body>
    </html>
  `);
});

app.get('/terms-and-conditions', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Terms and Conditions - Revenue Recovery System</title>
        <style>...</style>
      </head>
      <body>
        <h1>Terms and Conditions</h1>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        <h2>SMS Terms</h2>
        <p>By providing your phone number, you consent to receive SMS messages regarding your service request. Message frequency varies. Message and data rates may apply.</p>
        <p>To opt out, reply STOP. For help, reply HELP.</p>
        <p>Carriers are not liable for any delayed or undelivered messages.</p>
        <p><a href="/">← Back to Home</a></p>
      </body>
    </html>
  `);
});

app.get('/terms', (req, res) => res.redirect('/terms-and-conditions'));

app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/pricing', async (req, res) => res.render('pricing'));

app.get('/test-call-form', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Call Form</title>
      </head>
      <body>
        <h1>Test Call Form</h1>
        <form action="/test-call" method="POST">
          <input type="text" name="customer_phone" placeholder="Phone number" value="+15551234567">
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

// ---------- API endpoints ----------
app.get('/api/plans', async (req, res) => {
  const { data } = await supabaseAdmin.from('plans').select('*');
  res.json(data);
});

app.post('/api/signup', express.json(), async (req, res) => {
  const { email, password, businessName, fullName } = req.body;

  // Check if business name already exists
  const { data: existing } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('name', businessName)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: 'Business name already taken' });
  }

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

app.post('/api/login', express.json(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }

    // Set HTTP‑only cookie
    res.cookie('token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/create-checkout-session', authMiddleware, async (req, res) => {
  // Prevent demo users from creating real subscriptions
  if (req.isDemo) {
    return res.status(403).json({ error: 'Demo users cannot subscribe. Please sign up for a real account.' });
  }
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

// ---------- Stripe Webhook ----------
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
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
});

// ---------- Protected Dashboard ----------
// ---------- Protected Dashboard ----------
app.get('/dashboard', authMiddleware, async (req, res) => {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', req.businessId)
    .single();

  if (!business) {
    return res.status(404).send('Business not found. Please contact support.');
  }

  // Fetch recent calls for this business
  const { data: recentCalls } = await supabaseAdmin
    .from('calls')
    .select('*')
    .eq('business_id', req.businessId)
    .order('created_at', { ascending: false })
    .limit(10);

  res.render('dashboard', { 
    business, 
    isDemo: req.isDemo, 
    recentCalls: recentCalls || [] 
  });
});

// ---------- Test call endpoint (simulate) ----------
app.post('/test-call', express.json(), async (req, res) => {
  try {
    const business_id = 'a88b0145-72a7-4576-8540-a15fca089d50'; // your test business
    const customer_phone = req.body.customer_phone || '+15551234567';
    const voicemail_url = req.body.voicemail_url || 'https://example.com/test-audio.mp3';

    const transcription = await transcribeAudio(voicemail_url);
    const aiData = await extractLeadInfo(transcription, business_id);

    const { data, error } = await supabase
      .from('calls')
      .insert([{ business_id, customer_phone, voicemail_url, transcription, ai_extracted: aiData, estimated_value: aiData.estimated_value || 0, status: 'new' }])
      .select();
    if (error) throw error;
    res.json({ success: true, call: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Incoming Twilio endpoints (placeholders) ----------
app.post('/incoming-call', express.urlencoded({ extended: true }), (req, res) => {
  res.type('text/xml').send('<Response><Say>Thank you for calling.</Say></Response>');
});

app.post('/voicemail-recording', express.urlencoded({ extended: true }), (req, res) => {
  res.type('text/xml').send('<Response><Say>Message received.</Say></Response>');
});

// ---------- Demo auto-login ----------
app.get('/demo', async (req, res) => {
  try {
    const demoEmail = process.env.DEMO_EMAIL;
    const demoPassword = process.env.DEMO_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Demo credentials not configured');
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error) throw error;

    // Set HTTP‑only cookie
    res.cookie('token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send a page that also sets localStorage token (optional, for existing client‑side code)
    res.send(`
      <html>
        <head><title>Redirecting to Demo...</title></head>
        <body>
          <script>
            localStorage.setItem('token', '${data.session.access_token}');
            window.location.href = '/dashboard';
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Demo login failed:', err);
    res.status(500).send('Demo unavailable. Please try again later.');
  }
});

// ---------- Forgot password ----------
app.get('/forgot-password', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password - Revenue Recovery System</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 40px; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { text-align: center; color: #333; }
          input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          button { background: #4361ee; color: white; padding: 14px; width: 100%; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
          .message { color: green; text-align: center; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Password</h1>
          <form id="resetForm">
            <input type="email" id="email" placeholder="Your email" required>
            <button type="submit">Send Reset Link</button>
          </form>
          <div id="message" class="message"></div>
        </div>
        <script>
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const res = await fetch('/api/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            document.getElementById('message').textContent = data.message || 'Check your email for reset link.';
          });
        </script>
      </body>
    </html>
  `);
});

app.post('/api/forgot-password', express.json(), async (req, res) => {
  const { email } = req.body;
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://subshopper.online/reset-password', // create this page later
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Password reset email sent.' });
});

// ---------- Logout ----------
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('<script>localStorage.removeItem("token"); window.location.href="/";</script>');
});

// ---------- Start Server ----------
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
  console.log(`Public URL: https://subshopper.online`);
});