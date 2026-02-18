const express = require('express');
const KnowledgeBase = require('../models/KnowledgeBase');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function openaiChat(messages, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      messages
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'OpenAI request failed');
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// AI Chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Build system prompt for poultry farming assistance
    const systemPrompt = `You are a helpful AI assistant specialized in poultry farming. You provide practical, easy-to-understand advice on:
- Poultry health and disease prevention
- Feeding and nutrition
- Housing and management
- Egg production optimization
- Broiler and layer care
- Best practices for small-scale and commercial farming

Always respond in simple, clear language that farmers with limited technical knowledge can understand. Be encouraging and supportive. If you're unsure about something, recommend consulting a veterinarian or agricultural expert.`;

    // Search knowledge base for relevant context
    let relevantContent = '';
    if (message) {
      const searchResults = await KnowledgeBase.find({
        $text: { $search: message }
      }).limit(3);

      if (searchResults.length > 0) {
        relevantContent = '\n\nRelevant information from our knowledge base:\n';
        searchResults.forEach((item, index) => {
          relevantContent += `${index + 1}. ${item.title}: ${item.content.substring(0, 200)}...\n`;
        });
      }
    }

    const fullMessage = relevantContent ? `${message}\n\n${relevantContent}` : message;

    const aiResponse = await openaiChat([
      { role: 'system', content: systemPrompt },
      ...(context || []),
      { role: 'user', content: fullMessage }
    ], { temperature: 0.7, max_tokens: 1024 }) || 'I apologize, but I could not generate a response.';

    // Create notification for AI suggestion
    await Notification.create({
      user: req.user._id,
      type: 'ai_suggestion',
      title: 'AI Assistant Response',
      message: `New AI response available for your question`,
      link: '/ai-chat'
    });

    res.json({
      response: aiResponse,
      relevantContent: relevantContent ? true : false
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      message: 'Error communicating with AI assistant', 
      error: error.message 
    });
  }
});

// Summarize/Translate text
router.post('/summarize', auth, async (req, res) => {
  try {
    const { text, action = 'summarize', targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    let prompt = '';
    if (action === 'summarize') {
      prompt = `Please provide a clear and concise summary of the following text about poultry farming:\n\n${text}`;
    } else if (action === 'translate' && targetLanguage) {
      prompt = `Please translate the following text about poultry farming to ${targetLanguage}. Keep the translation simple and easy to understand:\n\n${text}`;
    } else {
      return res.status(400).json({ message: 'Invalid action or missing target language' });
    }

    const result = await openaiChat([
      { role: 'system', content: 'You are a helpful assistant that summarizes and translates agricultural content in simple, clear language.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.5, max_tokens: 512 }) || 'Unable to process request.';

    res.json({
      result,
      action
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      message: 'Error processing text', 
      error: error.message 
    });
  }
});

module.exports = router;

