/**
 * AI Chat page: chat with the Appah Farm AI assistant.
 * Supports text messages and voice input (record → transcribe → AI reply). Uses the last 10 messages
 * as context. Can play assistant replies with text-to-speech.
 */
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiMic, FiSquare, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '../services/api';
import './AIChat.css';

const AIChat = ({ user }) => {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  // Refs: MediaRecorder for voice, chunks of audio, scroll anchor, and current TTS utterance
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);

  /** Scroll the message list so the latest message is visible */
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // When the component unmounts, stop any playing text-to-speech
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /** Send the current input as a user message, call AI with context, and append the reply (or error) */
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

  /** Start recording from the microphone; when stopped, audio is sent to transcribe then to AI chat */
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

  /** Stop the current recording; the onstop handler will transcribe and send to AI */
  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  /** Convert an audio Blob to base64 string so it can be sent to the transcribe API */
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

  /** Use the browser's speech synthesis to read the assistant message aloud; click again to stop */
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
      <h1 className="ai-chat-page__title">Appah Farms AI</h1>

      <div className="ai-chat-card">
        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="ai-chat-welcome">
              <div className="ai-chat-welcome__icon-wrap">
                <FiMessageCircle size={40} className="ai-chat-welcome__icon" />
              </div>
              <h2 className="ai-chat-welcome__title">Hello, {user?.name || 'there'}!</h2>
              <p className="ai-chat-welcome__lead">I'm Appah Farms AI — here to help with poultry farming.</p>
              <p className="ai-chat-welcome__hint">Ask about health, feeding, housing, or best practices.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={`${idx}-${msg.role}`}
              className={`ai-chat-msg ai-chat-msg--${msg.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="ai-chat-msg__header">
                <span className="ai-chat-msg__label">{msg.role === 'user' ? 'You' : 'Appah Farms AI'}</span>
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className="ai-chat-btn ai-chat-btn--voice"
                    onClick={() => playAudio(msg.content, idx)}
                    title={playingIndex === idx ? 'Stop playback' : 'Play audio'}
                    aria-label={playingIndex === idx ? 'Stop playback' : 'Play audio'}
                  >
                    {playingIndex === idx ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                  </button>
                )}
              </div>
              <div className="ai-chat-msg__content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="ai-chat-msg ai-chat-msg--assistant ai-chat-msg--typing">
              <div className="ai-chat-msg__header">
                <span className="ai-chat-msg__label">Appah Farms AI</span>
              </div>
              <div className="ai-chat-typing">
                <span className="ai-chat-typing__dot" />
                <span className="ai-chat-typing__dot" />
                <span className="ai-chat-typing__dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ai-chat-form">
          <div className={`ai-chat-input-wrap ${recording ? 'ai-chat-input-wrap--recording' : ''}`}>
            <input
              type="text"
              className="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about poultry farming"
              disabled={loading}
              aria-label="Message"
            />
            <button
              type="button"
              className={`ai-chat-btn ai-chat-btn--voice ${recording ? 'ai-chat-btn--recording' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              title={recording ? 'Stop recording' : 'Voice input'}
              aria-label={recording ? 'Stop recording' : 'Voice input'}
            >
              {recording ? <FiSquare size={18} /> : <FiMic size={18} />}
            </button>
            <button
              type="submit"
              className="ai-chat-btn ai-chat-btn--send"
              disabled={loading || !input.trim()}
              title="Send message"
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </form>
        <p className="ai-chat-powered">Powered by OpenAI</p>
      </div>
    </div>
  );
};

export default AIChat;

