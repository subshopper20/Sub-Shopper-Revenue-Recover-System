// Add this to app.js as a new route
app.get('/admin/clients', async (req, res) => {
  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      *,
      client_configs (*)
    `);
  
  let html = `
    <html>
    <head>
      <title>Client Configuration</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        .client-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        select, textarea, input { width: 100%; padding: 8px; margin: 5px 0; }
        .niche-presets { margin: 20px 0; }
        .preset-btn { padding: 10px; margin: 5px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Client Configuration</h1>
  `;

  businesses.forEach(biz => {
    const config = biz.client_configs || {};
    html += `
      <div class="client-card">
        <h2>${biz.name} (${biz.phone_number})</h2>
        
        <div class="niche-presets">
          <strong>Quick Presets:</strong><br>
          <button class="preset-btn" onclick="setNiche('${biz.id}', 'lawn_care')">Lawn Care</button>
          <button class="preset-btn" onclick="setNiche('${biz.id}', 'plumbing')">Plumbing</button>
          <button class="preset-btn" onclick="setNiche('${biz.id}', 'hvac')">HVAC</button>
          <button class="preset-btn" onclick="setNiche('${biz.id}', 'roofing')">Roofing</button>
          <button class="preset-btn" onclick="setNiche('${biz.id}', 'cleaning')">Cleaning</button>
        </div>
        
        <form action="/admin/update-config" method="POST">
          <input type="hidden" name="business_id" value="${biz.id}">
          
          <label>Niche:</label>
          <select name="niche">
            <option value="lawn_care" ${config.niche === 'lawn_care' ? 'selected' : ''}>Lawn Care</option>
            <option value="plumbing" ${config.niche === 'plumbing' ? 'selected' : ''}>Plumbing</option>
            <option value="hvac" ${config.niche === 'hvac' ? 'selected' : ''}>HVAC</option>
            <option value="roofing" ${config.niche === 'roofing' ? 'selected' : ''}>Roofing</option>
            <option value="cleaning" ${config.niche === 'cleaning' ? 'selected' : ''}>Cleaning</option>
            <option value="custom" ${!['lawn_care','plumbing','hvac','roofing','cleaning'].includes(config.niche) ? 'selected' : ''}>Custom</option>
          </select>
          
          <label>Base Rate ($):</label>
          <input type="number" name="base_rate" value="${config.value_calculation?.base_rate || 50}">
          
          <label>Custom Instructions:</label>
          <textarea name="ai_instructions" rows="4">${config.ai_instructions || ''}</textarea>
          
          <button type="submit">Save Configuration</button>
        </form>
      </div>
    `;
  });

  html += `
      <script>
        function setNiche(businessId, niche) {
          // This would set the form values via JavaScript
          alert('Niche preset selected: ' + niche + ' for business ' + businessId);
          // In a real implementation, you'd populate the form fields with preset values
        }
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Handle config updates
app.post('/admin/update-config', express.urlencoded({ extended: true }), async (req, res) => {
  const { business_id, niche, base_rate, ai_instructions } = req.body;
  
  // Build config object
  const config = {
    business_id,
    niche,
    extraction_fields: getDefaultFieldsForNiche(niche),
    ai_instructions,
    value_calculation: {
      base_rate: parseFloat(base_rate)
    }
  };
  
  // Upsert config
  const { error } = await supabase
    .from('client_configs')
    .upsert(config, { onConflict: 'business_id' });
  
  if (error) {
    res.status(500).send('Error saving config');
  } else {
    res.redirect('/admin/clients');
  }
});

function getDefaultFieldsForNiche(niche) {
  const fields = {
    lawn_care: {
      required: ['customer_name', 'address', 'property_size', 'service_type'],
      optional: ['frequency', 'gate_code', 'dog_info'],
      service_types: ['mowing', 'trimming', 'fertilizing', 'weed_control', 'aeration']
    },
    plumbing: {
      required: ['customer_name', 'address', 'issue_type'],
      optional: ['emergency', 'access_info', 'property_age'],
      issue_types: ['leak', 'clog', 'installation', 'repair', 'inspection'],
      emergency_types: ['burst_pipe', 'sewer_backup', 'no_water']
    },
    hvac: {
      required: ['customer_name', 'address', 'system_type', 'issue_description'],
      optional: ['error_codes', 'system_age', 'maintenance_history'],
      system_types: ['furnace', 'ac', 'heat_pump', 'thermostat']
    },
    roofing: {
      required: ['customer_name', 'address', 'issue_type'],
      optional: ['roof_age', 'material', 'insurance_claim'],
      issue_types: ['leak', 'storm_damage', 'missing_shingles', 'inspection']
    },
    cleaning: {
      required: ['customer_name', 'address', 'service_type'],
      optional: ['square_footage', 'bedrooms', 'bathrooms', 'frequency'],
      service_types: ['deep_clean', 'move_in_out', 'regular', 'commercial']
    }
  };
  
  return fields[niche] || fields.lawn_care;
}