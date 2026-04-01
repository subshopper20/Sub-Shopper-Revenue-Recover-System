const axios = require('axios');
const FormData = require('form-data');

// ... other code (classifyCall, extractLeadInfo, etc.)

async function transcribeAudio(audioUrl) {
  try {
    // Download the audio file from SignalWire (or any URL)
    const response = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream',
    });

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', response.data, {
      filename: 'recording.mp3',
      contentType: 'audio/mpeg',
    });
    formData.append('model', 'whisper-1');

    // Call OpenAI Whisper
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return openaiResponse.data.text;
  } catch (err) {
    console.error('Error transcribing audio:', err);
    // Fallback for testing (or when audio cannot be processed)
    return "This is a simulated transcription for testing. The actual audio could not be transcribed.";
  }
}