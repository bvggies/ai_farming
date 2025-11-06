const express = require('express');
const Groq = require('groq-sdk');
const KnowledgeBase = require('../models/KnowledgeBase');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...(context || []),
        { role: 'user', content: fullMessage }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

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
    console.error('Groq API error:', error);
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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes and translates agricultural content in simple, clear language.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 512
    });

    const result = completion.choices[0]?.message?.content || 'Unable to process request.';

    res.json({
      result,
      action
    });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ 
      message: 'Error processing text', 
      error: error.message 
    });
  }
});

module.exports = router;

