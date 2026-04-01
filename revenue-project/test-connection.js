const supabase = require('./supabase');
const { getClientConfig } = require('./ai-prompt-builder');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can query businesses
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('*');
    
    if (bizError) {
      console.error('❌ Businesses table error:', bizError.message);
    } else {
      console.log(`✅ Found ${businesses.length} businesses`);
      console.log('Businesses:', businesses);
    }
    
    // Test 2: Check client_configs table
    const { data: configs, error: configError } = await supabase
      .from('client_configs')
      .select('*');
    
    if (configError) {
      console.error('❌ Client configs table error:', configError.message);
      console.log('⚠️ You need to run the SQL to create the client_configs table');
    } else {
      console.log(`✅ Found ${configs.length} client configurations`);
    }
    
    // Test 3: Try to get config for first business
    if (businesses && businesses.length > 0) {
      const config = await getClientConfig(businesses[0].id);
      console.log('✅ Successfully loaded config for business');
      console.log('Niche:', config.niche);
      console.log('Base rate:', config.value_calculation?.base_rate);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testConnection();