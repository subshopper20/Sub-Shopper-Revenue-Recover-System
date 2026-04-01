const supabase = require('./supabase');

/**
 * Get base price from pricing_rules table
 * @param {string} businessId - UUID of the business
 * @param {string} serviceCategory - e.g., "Lawn Mowing", "Tree Trimming"
 * @param {string} serviceDetail - e.g., "Standard (up to 1/4 acre)", "Small Tree"
 * @returns {Promise<number|null>} - base price or null if not found
 */
async function getPriceFromMatrix(businessId, serviceCategory, serviceDetail) {
  try {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('base_price')
      .eq('business_id', businessId)
      .eq('service_category', serviceCategory)
      .eq('service_detail', serviceDetail)
      .maybeSingle();

    if (error) throw error;
    return data?.base_price || null;
  } catch (err) {
    console.error('Error in getPriceFromMatrix:', err);
    return null;
  }
}

module.exports = { getPriceFromMatrix };