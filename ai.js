const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'your-openai-api-key', // replace with your key
});

async function transcribeAudio(audioUrl) {
  // For now, you can use a placeholder; later you'll download the file from Twilio
  // For testing, we'll simulate a transcription
  return "This is a sample voicemail: Hi, I need my lawn mowed, my name is John, address is 123 Main St, it's urgent.";
}

async function extractLeadInfo(transcription) {
  const prompt = `
    Extract the following from this voicemail transcription:
    - customer_name
    - service_requested
    - address
    - property_size (if mentioned)
    - urgency (low/medium/high)
    - estimated_value (in dollars)
    Return JSON only.

    Transcription: "${transcription}"
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

module.exports = { transcribeAudio, extractLeadInfo };