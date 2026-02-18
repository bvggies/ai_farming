import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiMic, FiSquare, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '../services/api';
import './AIChat.css';

const AIChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = messages
        .filter(m => m.role !== 'system')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const userLang = user?.preferredLanguage || 'en';
      const response = await api.post('/ai/chat', {
        message: userMessage,
        context,
        language: userLang
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your internet connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mr.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const base64 = await blobToBase64(blob);
          setMessages(prev => [...prev, { role: 'user', content: '[Voice message]' }]);
          setLoading(true);
          // Transcribe with user's preferred language
          const userLang = user?.preferredLanguage || 'en';
          const t = await api.post('/ai/transcribe', { 
            audioBase64: base64, 
            mimeType: 'audio/webm',
            language: userLang 
          });
          const text = (t.data?.text || '').trim();
          if (text) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            const context = messages
              .filter(m => m.role !== 'system')
              .slice(-10)
              .map(m => ({ role: m.role, content: m.content }));
            const resp = await api.post('/ai/chat', { 
              message: text, 
              context,
              language: userLang 
            });
            setMessages(prev => [...prev, { role: 'assistant', content: resp.data.response }]);
          } else {
            const errorMsg = userLang === 'tw' 
              ? 'Mentumi nte asɛm no yiye. Mesrɛ wo, san gye bio.'
              : 'I could not understand the audio clearly. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
          }
        } catch (err) {
          console.error('Voice processing error:', err);
          const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Voice processing failed: ${errorMsg}. Please try again or use text input.` 
          }]);
        } finally {
          setLoading(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or unsupported browser.');
    }
  };

  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || '';
      const idx = typeof result === 'string' ? result.indexOf(',') : -1;
      resolve(idx >= 0 ? result.slice(idx + 1) : '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const playAudio = (text, index) => {
    // Stop any currently playing audio
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
    }

    if (playingIndex === index) {
      // If clicking the same message, stop playback
      setPlayingIndex(null);
      return;
    }

    // Get user's preferred language for TTS
    const userLang = user?.preferredLanguage || 'en';
    const langCode = userLang === 'tw' ? 'ak-GH' : 'en-US'; // Twi uses Akan-Ghana locale

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setPlayingIndex(null);
      speechSynthRef.current = null;
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setPlayingIndex(null);
      speechSynthRef.current = null;
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlayingIndex(index);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div className={`container ai-chat-page ${isMobile ? 'ai-chat-mobile' : ''}`} style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      <h1 className="page-title">Appah Farms AI</h1>

      <div className="card ai-chat-card">
        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="ai-chat-welcome">
              <FiMessageCircle size={48} />
              <h2>Hello, {user?.name || 'there'}!</h2>
              <p>I'm Appah Farm AI. I'm here to help with poultry farming questions.</p>
              <p>Ask me about health, feeding, housing, or best practices.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-chat-msg ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="ai-chat-msg-header">
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className="ai-chat-btn voice"
                    onClick={() => playAudio(msg.content, idx)}
                    title={playingIndex === idx ? 'Stop playback' : 'Play audio'}
                  >
                    {playingIndex === idx ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                  </button>
                )}
              </div>
              <div className="ai-chat-msg-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="ai-chat-msg assistant">
              <div className="ai-chat-msg-header"><strong>AI Assistant</strong></div>
              <div className="ai-chat-msg-content">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ai-chat-form">
          <div className="ai-chat-input-wrap">
            <input
              type="text"
              className="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about poultry farming"
              disabled={loading}
            />
            <button
              type="button"
              className={`ai-chat-btn voice ${recording ? 'recording' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              title={recording ? 'Stop recording' : 'Voice input'}
            >
              {recording ? <FiSquare size={20} /> : <FiMic size={20} />}
            </button>
            <button
              type="submit"
              className="ai-chat-btn send"
              disabled={loading || !input.trim()}
              title="Send message"
            >
              <FiSend size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;

