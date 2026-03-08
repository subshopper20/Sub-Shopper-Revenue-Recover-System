require('dotenv').config();
const express = require('express');
const { transcribeAudio, extractLeadInfo } = require('./ai');
const supabase = require('./supabase');

const app = express();
const port = 3000;

const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Privacy Policy page (Twilio compliant)
app.get('/privacy-policy', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Privacy Policy - SubShopper Recovery Services</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2c3e50; }
          .container { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Privacy Policy</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

          <h2>Our Commitment to Privacy</h2>
          <p>SubShopper Recovery Services ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our missed call recovery service.</p>

          <h2>Information We Collect</h2>
          <p>When you call a business that uses our service and leave a voicemail, we may collect:</p>
          <ul>
            <li>Your phone number</li>
            <li>Voicemail recording and transcription</li>
            <li>Information you provide in your message (name, address, service requested, etc.)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use this information solely to:</p>
          <ul>
            <li>Transcribe and analyze your message using AI</li>
            <li>Forward lead details to the business you contacted</li>
            <li>Improve our services through aggregated analytics</li>
          </ul>

          <h2>Mobile Information (SMS)</h2>
          <p><strong>Mobile Information:</strong> We do not share mobile information with third parties or affiliates for marketing or promotional purposes. All information collected via SMS is used solely for lead recovery and customer service. Text messaging originator opt-in data and consent are not shared with any third parties.</p>

          <h2>Opt-Out Instructions</h2>
          <p>You may opt out of receiving text messages at any time by replying <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong>. Message and data rates may apply.</p>

          <h2>Data Security</h2>
          <p>We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The latest version will always be posted here.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:subshopper20@gmail.com">subshopper20@gmail.com</a>.</p>

          <p><a href="/">← Back to Home</a></p>
        </div>
      </body>
    </html>
  `);
});

// Terms and Conditions (Twilio compliant)
app.get('/terms-and-conditions', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Terms and Conditions - SubShopper Recovery Services</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2c3e50; }
          .container { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Terms and Conditions</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

          <h2>Acceptance of Terms</h2>
          <p>By using the SubShopper Recovery Services, you agree to these Terms and Conditions. If you do not agree, please do not use our service.</p>

          <h2>Service Description</h2>
          <p>Our service captures missed calls, transcribes voicemails, and uses artificial intelligence to extract lead information. This information is then provided to the business you contacted to facilitate a timely response.</p>

          <h2>SMS Terms and Conditions</h2>
          <p>By providing your phone number and opting into our text messaging program, you consent to receive SMS messages regarding your service request from SubShopper Recovery Services. Message frequency varies based on your interaction with our service. <strong>Message and data rates may apply.</strong></p>

          <h3>Opt-Out Instructions</h3>
          <p>To opt out, reply <strong>STOP</strong> to any message at any time. You will receive a confirmation message that you have been unsubscribed.</p>

          <h3>Help Instructions</h3>
          <p>For help, reply <strong>HELP</strong> to any message or contact us at <a href="mailto:subshopper20@gmail.com">subshopper20@gmail.com</a>.</p>

          <h3>Carrier Disclaimer</h3>
          <p><strong>Carriers are not liable for any delayed or undelivered messages.</strong></p>

          <h2>Program Description</h2>
          <p>This service captures missed calls, transcribes voicemails, and uses AI to extract lead information so service businesses can respond faster to potential customers. By using this service, you acknowledge that your voicemail will be processed by automated systems.</p>

          <h2>Limitation of Liability</h2>
          <p>SubShopper Recovery Services shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our service.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>

          <h2>Contact Information</h2>
          <p>For any questions regarding these Terms, please contact us at <a href="mailto:subshopper20@gmail.com">subshopper20@gmail.com</a>.</p>

          <p><a href="/">← Back to Home</a></p>
        </div>
      </body>
    </html>
  `);
});

// Optional: Keep /terms route for backward compatibility (redirect to /terms-and-conditions)
app.get('/terms', (req, res) => {
  res.redirect('/terms-and-conditions');
});

// Optional: Keep /terms route for backward compatibility (redirect or separate page)
app.get('/terms', (req, res) => {
  res.redirect('/terms-and-conditions');
});

// Test endpoint to simulate a missed call
app.post('/test-call', async (req, res) => {
  try {
    // Get the test business ID (your specific business)
    const business_id = 'a88b0145-72a7-4576-8540-a15fca089d50';
    
    const customer_phone = req.body.customer_phone || '+15551234567';
    const voicemail_url = req.body.voicemail_url || 'https://example.com/test-audio.mp3';

    // Step 1: Transcribe (simulated for now)
    const transcription = await transcribeAudio(voicemail_url);
    console.log('Transcription:', transcription);

    // Step 2: Extract lead info with AI
    const aiData = await extractLeadInfo(transcription, business_id);
    console.log('AI Data:', aiData);

    // Step 3: Save to database
    const { data, error } = await supabase
      .from('calls')
      .insert([
        {
          business_id,
          customer_phone,
          voicemail_url,
          transcription,
          ai_extracted: aiData,
          estimated_value: aiData.estimated_value || 0,
          status: 'new'
        }
      ])
      .select();

    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Call processed successfully',
      call: data[0]
    });

  } catch (err) {
    console.error('Error processing call:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simple form to trigger test calls
app.get('/test-call-form', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Add Test Call</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          input { padding: 8px; margin: 5px 0; width: 300px; }
          button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Add Test Missed Call</h1>
        <form action="/test-call" method="POST">
          <label>Customer Phone:</label><br>
          <input type="text" name="customer_phone" value="+15551234567"><br><br>
          <label>Voicemail URL (optional):</label><br>
          <input type="text" name="voicemail_url" value="https://example.com/test.mp3"><br><br>
          <button type="submit">Process Test Call</button>
        </form>
        <p><a href="/dashboard">View Dashboard</a></p>
      </body>
    </html>
  `);
});

// Dashboard to view leads
app.get('/dashboard', async (req, res) => {
  try {
    // Fetch calls with business info
    const { data: calls, error } = await supabase
      .from('calls')
      .select(`
        *,
        businesses (
          name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate total missed revenue
    const totalMissedRevenue = calls.reduce((sum, call) => sum + (parseFloat(call.estimated_value) || 0), 0);

    // Generate HTML dashboard
    let html = `
      <html>
      <head>
        <title>Lead Dashboard - SubShopper</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          h1 { color: #333; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .revenue { font-size: 24px; color: #2c3e50; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #34495e; color: white; }
          tr:hover { background: #f9f9f9; }
          .status-new { color: #e67e22; font-weight: bold; }
          .status-contacted { color: #3498db; }
          .status-booked { color: #27ae60; }
          .status-lost { color: #e74c3c; }
          pre { margin: 0; font-size: 12px; }
          .nav { margin-bottom: 20px; }
          .nav a { color: #3498db; text-decoration: none; margin-right: 15px; }
        </style>
      </head>
      <body>
        <div class="nav">
          <a href="/">Home</a>
          <a href="/test-call-form">Add Test Call</a>
        </div>
        <h1>Missed Call Recovery Dashboard</h1>
        
        <div class="stats">
          <h2>Revenue Protection</h2>
          <div class="revenue">Total Missed Revenue: $${totalMissedRevenue.toFixed(2)}</div>
          <div>Total Missed Calls: ${calls.length}</div>
        </div>
        
        <table>
          <tr>
            <th>Date</th>
            <th>Business</th>
            <th>Customer</th>
            <th>Service</th>
            <th>Est. Value</th>
            <th>Status</th>
            <th>AI Summary</th>
          </tr>
    `;

    calls.forEach(call => {
      const aiData = call.ai_extracted || {};
      const statusClass = `status-${call.status}`;
      
      html += `
        <tr>
          <td>${new Date(call.created_at).toLocaleString()}</td>
          <td>${call.businesses?.name || 'Unknown'}</td>
          <td>
            ${aiData.customer_name || 'Unknown'}<br>
            <small>${call.customer_phone}</small>
          </td>
          <td>${aiData.service_requested || 'Not specified'}</td>
          <td>$${parseFloat(call.estimated_value || 0).toFixed(2)}</td>
          <td class="${statusClass}">${call.status}</td>
          <td>
            <pre>${JSON.stringify({
              name: aiData.customer_name,
              address: aiData.address,
              urgency: aiData.urgency,
              size: aiData.property_size
            }, null, 2)}</pre>
          </td>
        </tr>
      `;
    });

    html += `
        </table>
      </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Error loading dashboard');
  }
});

// Twilio webhook for incoming calls (ready for when Twilio approves)
app.post('/incoming-call', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('📞 Incoming call webhook received:', req.body);
  
  const twilioData = req.body;
  const businessPhone = twilioData.To;
  const customerPhone = twilioData.From;
  const callSid = twilioData.CallSid;
  
  // Find which business this number belongs to
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('phone_number', businessPhone)
    .single();
  
  if (!business) {
    res.type('text/xml');
    return res.send(`
      <Response>
        <Say>This phone number is not configured. Goodbye.</Say>
        <Hangup/>
      </Response>
    `);
  }
  
  // Store the call in database
  await supabase
    .from('calls')
    .insert([
      {
        business_id: business.id,
        customer_phone: customerPhone,
        twilio_call_sid: callSid,
        status: 'missed'
      }
    ]);
  
  // Tell Twilio to record a voicemail
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>We're sorry we missed your call. Please leave a message after the beep.</Say>
      <Record 
        action="/voicemail-recording" 
        method="POST" 
        maxLength="60"
        finishOnKey="#"
      />
      <Say>We didn't receive a recording. Goodbye.</Say>
      <Hangup/>
    </Response>
  `);
});

// Handle the recorded voicemail
app.post('/voicemail-recording', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('🎙️ Voicemail recording received:', req.body);
  
  const recordingUrl = req.body.RecordingUrl;
  const callSid = req.body.CallSid;
  
  // Update the call with recording URL
  await supabase
    .from('calls')
    .update({ voicemail_url: recordingUrl })
    .eq('twilio_call_sid', callSid);
  
  // Respond to Twilio
  res.type('text/xml');
  res.send('<Response><Say>Thank you for your message. We will call you back soon.</Say></Response>');
});

// Start the server
app.listen(port, () => {
  const port = process.env.PORT || 3000;
  console.log(`App running at http://localhost:${port}`);
  console.log(`Public URL: https://subshopper.online`);
});
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  // Get the business_id from profiles
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
app.post('/api/signup', express.json(), async (req, res) => {
  const { email, password, businessName, fullName } = req.body;

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    // 2. Create business record with NO plan (plan_id will be NULL)
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessName,
        phone_number: 'pending',
        // Do NOT set plan_id – it will default to NULL
      })
      .select()
      .single();
    if (bizError) throw bizError;

    // 3. Create profile linking user to business
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        business_id: business.id,
        full_name: fullName,
      });
    if (profileError) throw profileError;

    // Return success (include the user object with token)
    res.json({ success: true, user: authData.user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/dashboard', authMiddleware, async (req, res) => {
  // Fetch business info using req.businessId
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', req.businessId)
    .single();

  res.json({ message: 'Welcome to your dashboard', business });
});
app.get('/login', (req, res) => {
  res.render('login');
});
// Login Route 
app.post('/api/login', express.json(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json({ session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
});
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', authMiddleware, async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;

  try {
    // Get business record to find or create Stripe customer
  // Inside the signup endpoint, when inserting the business:
const { data: business, error: bizError } = await supabaseAdmin
  .from('businesses')
  .insert({
    name: businessName,
    phone_number: null,   // ← change from 'pending' to null
  })
  .select()
  .single();
    if (bizError) throw bizError;

    let customerId = business.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: business.name,
        metadata: { business_id: req.businessId }
      });
      customerId = customer.id;
      // Save to database
      await supabaseAdmin
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.businessId);
    }

    // Create checkout session
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
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0].price.id;

      // Find plan by stripe_price_id
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

      // Find business by stripe_customer_id
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (business && plan) {
        // Upsert subscription record
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            business_id: business.id,
            plan_id: plan.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        // Update business plan_id
        await supabaseAdmin
          .from('businesses')
          .update({ plan_id: plan.id })
          .eq('id', business.id);
      }
      break;

    case 'customer.subscription.deleted':
      // Handle cancellation
      const deletedSub = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', deletedSub.id);

      // Optionally revert to Free plan
      const freePlan = await supabaseAdmin.from('plans').select('id').eq('name', 'Free').single();
      await supabaseAdmin
        .from('businesses')
        .update({ plan_id: freePlan.data.id })
        .eq('stripe_customer_id', deletedSub.customer);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0].price.id;

      // Find plan by stripe_price_id
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

      // Find business by stripe_customer_id
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (business && plan) {
        // Upsert subscription record
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            business_id: business.id,
            plan_id: plan.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        // Update business plan_id
        await supabaseAdmin
          .from('businesses')
          .update({ plan_id: plan.id })
          .eq('id', business.id);
      }
      break;

    case 'customer.subscription.deleted':
      // Handle cancellation
      const deletedSub = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', deletedSub.id);

      // Optionally revert to Free plan
      const freePlan = await supabaseAdmin.from('plans').select('id').eq('name', 'Free').single();
      await supabaseAdmin
        .from('businesses')
        .update({ plan_id: freePlan.data.id })
        .eq('stripe_customer_id', deletedSub.customer);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
// Serve signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Serve pricing page
app.get('/pricing', async (req, res) => {
  res.render('pricing');
});

// API endpoint to get plans (used by pricing page)
app.get('/api/plans', async (req, res) => {
  const { data } = await supabaseAdmin.from('plans').select('*');
  res.json(data);
});