module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, context = [] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = `You are a helpful AI assistant specialized in poultry farming. You provide practical, easy-to-understand advice on:
- Poultry health and disease prevention
- Feeding and nutrition
- Housing and management
- Egg production optimization
- Broiler and layer care
- Best practices for small-scale and commercial farming

Always respond in simple, clear language that farmers with limited technical knowledge can understand. Be encouraging and supportive. If you're unsure about something, recommend consulting a veterinarian or agricultural expert.`;

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ message: 'Missing GROQ_API_KEY' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...context,
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ message: 'AI request failed', error: errText });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return res.json({ response: aiResponse });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


