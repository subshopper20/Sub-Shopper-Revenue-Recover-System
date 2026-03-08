const supabase = require('./supabase');

async function getClientConfig(businessId) {
  try {
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (error || !data) {
      console.log('No config found, using default lawn care config');
      // Return default lawn care config if none found
      return {
        niche: 'lawn_care',
        extraction_fields: {
          required: ['customer_name', 'address', 'service_type'],
          optional: ['property_size', 'frequency', 'gate_code'],
          service_types: ['mowing', 'trimming', 'fertilizing']
        },
        ai_instructions: 'Extract lawn care service details.',
        value_calculation: {
          base_rate: 50,
          per_acre_rate: 100
        }
      };
    }
    
    return data;
  } catch (err) {
    console.error('Error in getClientConfig:', err);
    // Return default on error
    return {
      niche: 'lawn_care',
      extraction_fields: {
        required: ['customer_name', 'address', 'service_type'],
        optional: ['property_size', 'frequency', 'gate_code'],
        service_types: ['mowing', 'trimming', 'fertilizing']
      },
      ai_instructions: 'Extract lawn care service details.',
      value_calculation: {
        base_rate: 50,
        per_acre_rate: 100
      }
    };
  }
}

function buildPrompt(transcription, config) {
  // Safely access nested properties with defaults
  const extractionFields = config.extraction_fields || {
    required: ['customer_name', 'address'],
    optional: []
  };
  
  const requiredFields = extractionFields.required || [];
  const optionalFields = extractionFields.optional || [];
  
  // Build the extraction fields description dynamically
  const requiredFieldsText = requiredFields.length > 0 
    ? requiredFields.join(', ') 
    : 'customer_name, address';
    
  const optionalFieldsText = optionalFields.length > 0 
    ? optionalFields.join(', ') 
    : 'additional details';
  
  // Add service type options if they exist
  let serviceTypesSection = '';
  if (extractionFields.service_types && extractionFields.service_types.length > 0) {
    serviceTypesSection = `Service types should be one of: ${extractionFields.service_types.join(', ')}`;
  }
  
  // Add emergency types if they exist (for plumbing, HVAC, etc.)
  let emergencySection = '';
  if (extractionFields.emergency_types && extractionFields.emergency_types.length > 0) {
    emergencySection = `If this is an emergency, categorize as: ${extractionFields.emergency_types.join(', ')}`;
  }
  
  // Add niche-specific instructions
  let nicheInstructions = '';
  const niche = config.niche || 'lawn_care';
  
  switch(niche) {
    case 'lawn_care':
      nicheInstructions = 'Look for property size (acres or sq ft), frequency of service, and any special instructions like gates, dogs, or specific areas to avoid.';
      break;
    case 'plumbing':
      nicheInstructions = 'Determine if this is an emergency (burst pipe, no water, sewage backup). Note the location of the issue (bathroom, kitchen, basement).';
      break;
    case 'hvac':
      nicheInstructions = 'Identify if it\'s heating or cooling issue, how long it\'s been out, and any error codes or strange noises mentioned.';
      break;
    case 'roofing':
      nicheInstructions = 'Look for storm damage, leaks, age of roof, and type of roofing material mentioned.';
      break;
    case 'cleaning':
      nicheInstructions = 'Note type of cleaning (move-in, deep clean, regular), number of rooms/bathrooms, and any special requirements.';
      break;
    default:
      nicheInstructions = config.ai_instructions || 'Extract standard customer service information.';
  }

  // Safely access value_calculation
  const valueCalc = config.value_calculation || { base_rate: 50 };
  const baseRate = valueCalc.base_rate || 50;
  const emergencyMultiplier = valueCalc.emergency_multiplier || 1.2;

  return `
    You are an AI assistant for a ${niche.replace('_', ' ')} business.
    
    Extract the following information from this voicemail transcription:
    
    REQUIRED FIELDS (must extract if present):
    ${requiredFieldsText}
    
    OPTIONAL FIELDS (extract if mentioned):
    ${optionalFieldsText}
    
    ${serviceTypesSection}
    ${emergencySection}
    
    ${nicheInstructions}
    
    Also estimate the job value in dollars based on:
    - Base rate: $${baseRate}
    - Additional factors mentioned
    - Urgency level (low/medium/high) - if high, multiply by ${emergencyMultiplier}
    
    Return ONLY valid JSON with these exact keys (use null if not found):
    - All required fields
    - All optional fields (if found)
    - urgency (low/medium/high)
    - estimated_value (number)
    - confidence_score (0-100)
    - suggested_action (text)

    Transcription: "${transcription}"
  `;
}

async function calculateEstimatedValue(aiData, config, transcription) {
  try {
    // Safely access nested properties
    const valueCalc = config.value_calculation || { base_rate: 50 };
    const baseRate = valueCalc.base_rate || 50;
    let estimatedValue = baseRate;
    
    // Add niche-specific calculations
    const niche = config.niche || 'lawn_care';
    
    switch(niche) {
      case 'lawn_care':
        // If property size mentioned, adjust price
        if (aiData && aiData.property_size) {
          const size = parseFloat(aiData.property_size) || 0;
          estimatedValue += (size * (valueCalc.per_acre_rate || 100));
        }
        break;
        
      case 'plumbing':
        if (aiData && aiData.urgency === 'high') {
          estimatedValue *= (valueCalc.emergency_multiplier || 1.5);
        }
        if (aiData && aiData.issue_type && valueCalc.issue_multipliers) {
          estimatedValue *= (valueCalc.issue_multipliers[aiData.issue_type] || 1);
        }
        break;
        
      // Add more niches as needed
    }
    
    return Math.round(estimatedValue * 100) / 100; // Round to 2 decimals
  } catch (err) {
    console.error('Error calculating estimated value:', err);
    return 50; // Default fallback value
  }
}

module.exports = { getClientConfig, buildPrompt, calculateEstimatedValue };