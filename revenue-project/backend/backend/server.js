const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/subshopper')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ------------------- Models -------------------
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  fullName: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  isDemo: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const businessSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  planTier: { type: String, default: 'starter' },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  customerName: String,
  customerPhone: String,
  serviceRequested: String,
  serviceCategory: String,
  urgency: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  status: { type: String, enum: ['new', 'contacted', 'booked', 'completed', 'lost'], default: 'new' },
  estimatedValue: Number,
  notes: String,
  address: String,
  transcription: String,
  voicemailUrl: String,
  contactedAt: Date,
  bookedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Business = mongoose.model('Business', businessSchema);
const Lead = mongoose.model('Lead', leadSchema);

// ------------------- Auth helpers -------------------
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);
const createToken = (userId, businessId) => jwt.sign({ userId, businessId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ------------------- Seed demo data -------------------
async function seedDemoData() {
  const existing = await Business.findOne({ name: 'Demo Lawn Care' });
  if (existing) return;

  const business = new Business({ name: 'Demo Lawn Care', phoneNumber: '+17573679042', planTier: 'growth' });
  await business.save();

  const demoUser = new User({
    email: 'demo@subshopper.com',
    password: await hashPassword('demo123'),
    fullName: 'Demo Receptionist',
    businessId: business._id,
    isDemo: true
  });
  await demoUser.save();

  const services = ['Lawn Mowing', 'Tree Trimming', 'Fertilizing', 'Sprinkler Repair', 'Landscaping', 'Leaf Removal', 'Hedge Trimming', 'Aeration'];
  const categories = ['lawn_maintenance', 'tree_service', 'irrigation', 'landscaping'];
  const names = ['John Smith', 'Mary Johnson', 'Robert Davis', 'Sarah Wilson', 'Michael Brown', 'Emily Taylor', 'James Anderson', 'Jennifer Martinez', 'David Garcia', 'Lisa Rodriguez', 'Chris Lee', 'Amanda White', 'Kevin Thomas', 'Rachel Moore', 'Brian Jackson'];
  const statuses = ['new', 'contacted', 'booked', 'completed', 'lost'];
  const urgencies = ['low', 'normal', 'high'];

  const leads = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = i * 2;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (i % 12) * 60 * 60 * 1000);
    const status = statuses[i % 5];
    const lead = new Lead({
      businessId: business._id,
      customerName: names[i % names.length],
      customerPhone: `+1555${100 + i}${1000 + i}`,
      serviceRequested: services[i % services.length],
      serviceCategory: categories[i % categories.length],
      urgency: urgencies[i % 3],
      status: status,
      estimatedValue: 50 + (i * 15) + (i % 5) * 25,
      notes: `Customer called about ${services[i % services.length].toLowerCase()}. Needs service soon.`,
      address: `${100 + i} Oak Street`,
      transcription: `Hi, this is ${names[i % names.length]}. I need ${services[i % services.length].toLowerCase()} service. Please call me back.`,
      createdAt: createdAt,
      updatedAt: createdAt
    });
    if (status !== 'new') lead.contactedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
    if (status === 'booked' || status === 'completed') lead.bookedAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    if (status === 'completed') lead.completedAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
    leads.push(lead);
  }
  await Lead.insertMany(leads);
  console.log('Demo data seeded');
}

// ------------------- API Routes -------------------
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, business_name, full_name } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ detail: 'Email already registered' });

  const existingBiz = await Business.findOne({ name: business_name });
  if (existingBiz) return res.status(400).json({ detail: 'Business name already taken' });

  const business = new Business({ name: business_name });
  await business.save();

  const hashed = await hashPassword(password);
  const user = new User({ email, password: hashed, fullName: full_name, businessId: business._id });
  await user.save();

  const token = createToken(user._id, business._id);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      full_name: user.fullName,
      business_id: business._id,
      business_name: business.name,
      plan_tier: business.planTier,
      is_demo: false
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ detail: 'Invalid email or password' });
  const valid = await verifyPassword(password, user.password);
  if (!valid) return res.status(401).json({ detail: 'Invalid email or password' });

  const business = await Business.findById(user.businessId);
  if (!business) return res.status(404).json({ detail: 'Business not found' });

  const token = createToken(user._id, business._id);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      full_name: user.fullName,
      business_id: business._id,
      business_name: business.name,
      plan_tier: business.planTier,
      is_demo: user.isDemo || false
    }
  });
});

app.post('/api/auth/demo', async (req, res) => {
  await seedDemoData();
  const user = await User.findOne({ email: 'demo@subshopper.com' });
  if (!user) return res.status(500).json({ detail: 'Demo user not found' });
  const business = await Business.findById(user.businessId);
  const token = createToken(user._id, business._id);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      full_name: user.fullName,
      business_id: business._id,
      business_name: business.name,
      plan_tier: business.planTier,
      is_demo: true
    }
  });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const business = await Business.findById(req.user.businessId);
  res.json({
    id: req.user._id,
    email: req.user.email,
    full_name: req.user.fullName,
    business_id: business._id,
    business_name: business.name,
    plan_tier: business.planTier,
    is_demo: req.user.isDemo || false
  });
});

// Leads CRUD
app.get('/api/leads', authenticate, async (req, res) => {
  const { search, status, urgency, category, date_from, date_to, sort_by = 'createdAt', sort_order = 'desc', limit = 50, skip = 0 } = req.query;
  const filter = { businessId: req.user.businessId };
  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { serviceRequested: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) filter.status = status;
  if (urgency) filter.urgency = urgency;
  if (category) filter.serviceCategory = category;
  if (date_from) filter.createdAt = { $gte: new Date(date_from) };
  if (date_to) filter.createdAt = { ...filter.createdAt, $lte: new Date(date_to) };

  const sortDir = sort_order === 'desc' ? -1 : 1;
  const leads = await Lead.find(filter).sort({ [sort_by]: sortDir }).skip(parseInt(skip)).limit(parseInt(limit));
  const total = await Lead.countDocuments(filter);
  res.json({ leads, total });
});

app.get('/api/leads/:id', authenticate, async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

app.post('/api/leads', authenticate, async (req, res) => {
  const lead = new Lead({ ...req.body, businessId: req.user.businessId });
  await lead.save();
  res.status(201).json(lead);
});

app.patch('/api/leads/:id', authenticate, async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const update = { ...req.body, updatedAt: new Date() };
  if (req.body.status) {
    if (req.body.status === 'contacted' && lead.status === 'new') update.contactedAt = new Date();
    if (req.body.status === 'booked' && ['new','contacted'].includes(lead.status)) update.bookedAt = new Date();
    if (req.body.status === 'completed') update.completedAt = new Date();
  }
  Object.assign(lead, update);
  await lead.save();
  res.json(lead);
});

app.delete('/api/leads/:id', authenticate, async (req, res) => {
  const result = await Lead.deleteOne({ _id: req.params.id, businessId: req.user.businessId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true });
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
  const leads = await Lead.find({ businessId: req.user.businessId });
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const hotLeads = leads.filter(l => l.urgency === 'high').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const booked = leads.filter(l => l.status === 'booked').length;
  const completed = leads.filter(l => l.status === 'completed').length;
  const potentialRevenue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const actualRevenue = leads.filter(l => l.status === 'completed').reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const conversionRate = total ? (completed / total) * 100 : 0;

  res.json({
    total_leads: total,
    new_leads: newLeads,
    hot_leads: hotLeads,
    contacted,
    booked,
    completed,
    total_revenue: actualRevenue,
    potential_revenue: potentialRevenue,
    conversion_rate: conversionRate
  });
});

// Revenue analytics
app.get('/api/analytics/revenue', authenticate, async (req, res) => {
  const { period = 'month', date_from, date_to } = req.query;
  let startDate, endDate = new Date();
  if (date_from && date_to) {
    startDate = new Date(date_from);
    endDate = new Date(date_to);
  } else {
    switch (period) {
      case 'day': startDate = new Date(Date.now() - 24*60*60*1000); break;
      case 'week': startDate = new Date(Date.now() - 7*24*60*60*1000); break;
      case 'month': startDate = new Date(Date.now() - 30*24*60*60*1000); break;
      case 'year': startDate = new Date(Date.now() - 365*24*60*60*1000); break;
      default: startDate = new Date(Date.now() - 30*24*60*60*1000);
    }
  }

  const leads = await Lead.find({
    businessId: req.user.businessId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const revenueByDate = {};
  leads.forEach(lead => {
    const dateKey = lead.createdAt.toISOString().split('T')[0];
    if (!revenueByDate[dateKey]) revenueByDate[dateKey] = { potential: 0, actual: 0, count: 0 };
    revenueByDate[dateKey].potential += lead.estimatedValue || 0;
    revenueByDate[dateKey].count++;
    if (lead.status === 'completed') revenueByDate[dateKey].actual += lead.estimatedValue || 0;
  });

  const data = Object.entries(revenueByDate).map(([date, vals]) => ({
    date,
    potential: vals.potential,
    actual: vals.actual,
    leads_count: vals.count
  })).sort((a,b) => a.date.localeCompare(b.date));

  const totalPotential = data.reduce((s,d) => s + d.potential, 0);
  const totalActual = data.reduce((s,d) => s + d.actual, 0);
  const totalLeads = data.reduce((s,d) => s + d.leads_count, 0);

  res.json({
    data,
    summary: {
      total_potential: totalPotential,
      total_actual: totalActual,
      total_leads: totalLeads,
      period,
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString()
    }
  });
});

// Pricing plans (static)
app.get('/api/plans', (req, res) => {
  res.json([
    { id: 'starter', name: 'Starter', monthly_price: 349, annual_price: 3769.2, tier: 'starter', is_popular: false,
      features: ['Call Capture System', 'Missed Call Automation', 'Lead Dashboard Basics', '30-Minute Training', 'Tech Support'] },
    { id: 'growth', name: 'Growth', monthly_price: 649, annual_price: 7009.2, tier: 'growth', is_popular: true,
      features: ['Transcription Engine', 'Categorization', 'Revenue Loss Estimation', 'Missed Call Automation', '1 Optimization Call'] },
    { id: 'professional', name: 'Professional', monthly_price: 1299, annual_price: 14029.2, tier: 'professional', is_popular: false,
      features: ['Website Integration', 'CRM Sync Auto-Fill', 'Custom Reporting Dash', '2 Strategy Calls mo.', 'Priority Support'] }
  ]);
});

// Demo actions
app.post('/api/demo/add-lead', authenticate, async (req, res) => {
  if (!req.user.isDemo) return res.status(403).json({ error: 'Only available in demo mode' });
  const services = ['Lawn Mowing', 'Tree Trimming', 'Fertilizing', 'Sprinkler Repair'];
  const names = ['John Smith', 'Mary Johnson', 'Robert Davis', 'Sarah Wilson'];
  const urgencies = ['low', 'normal', 'high'];
  const randomIndex = Math.floor(Math.random() * 100);
  const lead = new Lead({
    businessId: req.user.businessId,
    customerName: names[randomIndex % names.length],
    customerPhone: `+1555${randomIndex}${1000+randomIndex}`,
    serviceRequested: services[randomIndex % services.length],
    serviceCategory: services[randomIndex % services.length].toLowerCase().replace(' ', '_'),
    urgency: urgencies[randomIndex % 3],
    status: 'new',
    estimatedValue: 50 + Math.random() * 450,
    notes: 'New demo lead added'
  });
  await lead.save();
  res.json({ success: true, lead });
});

app.post('/api/demo/reset', authenticate, async (req, res) => {
  if (!req.user.isDemo) return res.status(403).json({ error: 'Only available in demo mode' });
  await Lead.deleteMany({ businessId: req.user.businessId });
  await seedDemoData();
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));