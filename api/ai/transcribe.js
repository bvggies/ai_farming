module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { audioBase64, mimeType } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ message: 'audioBase64 is required' });
    }
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ message: 'Missing GROQ_API_KEY' });
    }

    const buffer = Buffer.from(audioBase64, 'base64');
    const file = new Blob([buffer], { type: mimeType || 'audio/webm' });

    const form = new FormData();
    form.append('file', file, 'audio.webm');
    form.append('model', 'whisper-large-v3');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ message: 'Transcription failed', error: errText });
    }

    const data = await response.json();
    // OpenAI compatible returns { text: "..." }
    return res.json({ text: data.text || '' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


