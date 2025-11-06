module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { audioBase64, mimeType, language } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ message: 'audioBase64 is required' });
    }
    
    // Map language codes: 'tw' for Twi, 'en' for English, or 'auto' for auto-detect
    const langCode = language === 'tw' ? 'tw' : (language === 'en' ? 'en' : null);
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ message: 'Missing GROQ_API_KEY' });
    }

    const buffer = Buffer.from(audioBase64, 'base64');
    
    // Create multipart form data manually for Node.js
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const formParts = [];
    
    // Add file field
    formParts.push(
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n`,
      `Content-Type: ${mimeType || 'audio/webm'}\r\n\r\n`
    );
    formParts.push(buffer);
    formParts.push(`\r\n--${boundary}\r\n`);
    
    // Add model field
    formParts.push(
      `Content-Disposition: form-data; name="model"\r\n\r\n`,
      `whisper-large-v3\r\n`,
      `--${boundary}\r\n`
    );
    
    // Add language field if specified (Twi: 'tw', English: 'en', or omit for auto-detect)
    if (langCode) {
      formParts.push(
        `Content-Disposition: form-data; name="language"\r\n\r\n`,
        `${langCode}\r\n`,
        `--${boundary}--\r\n`
      );
    } else {
      formParts.push(`--${boundary}--\r\n`);
    }
    
    const formData = Buffer.concat(formParts.map(part => 
      Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf8')
    ));

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq transcription error:', errText);
      return res.status(500).json({ 
        message: 'Transcription failed', 
        error: errText,
        status: response.status 
      });
    }

    const data = await response.json();
    // OpenAI compatible returns { text: "..." }
    return res.json({ text: data.text || '' });
  } catch (err) {
    console.error('Transcription error:', err);
    return res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


