import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiMic, FiSquare, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '../services/api';

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
    <div className="container" style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      <h1>Appah Farms AI</h1>

      <div className="card" style={{ ...chatContainerStyle, ...(isMobile ? chatContainerMobileStyle : {}) }}>
        <div style={{ ...messagesContainerStyle, ...(isMobile ? messagesContainerMobileStyle : {}) }}>
          {messages.length === 0 && (
            <div style={welcomeMessageStyle}>
              <FiMessageCircle size={48} color="#4CAF50" />
              <h2>Hello, {user.name}!</h2>
              <p>I'm Appah Farm AI, I'm here to assist you with Poultry farming related questions</p>
              <p>Is there anything i can help you with now?</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...messageStyle,
                ...(msg.role === 'user' ? userMessageStyle : aiMessageStyle)
              }}
            >
              <div style={messageContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => playAudio(msg.content, idx)}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                      style={audioButtonStyle}
                      title={playingIndex === idx ? 'Stop playback' : 'Play audio'}
                    >
                      {playingIndex === idx ? <FiVolumeX /> : <FiVolume2 />}
                    </button>
                  )}
                </div>
                <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...messageStyle, ...aiMessageStyle }}>
              <div style={messageContentStyle}>
                <strong>AI Assistant:</strong>
                <p style={{ marginTop: '8px' }}>Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ ...inputFormStyle, ...(isMobile ? inputFormMobileStyle : {}) }}>
          <div style={getInputContainerStyle(inputFocused)}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about poultry farming"
              style={{ ...modernInputStyle, ...(isMobile ? modernInputMobileStyle : {}) }}
              disabled={loading}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <div style={inputButtonsContainerStyle}>
              <button 
                type="button" 
                onClick={recording ? stopRecording : startRecording} 
                disabled={loading} 
                style={{ 
                  ...inputButtonStyle, 
                  ...(recording ? recordingButtonStyle : {}),
                  ...(loading ? disabledButtonStyle : {})
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={recording ? 'Stop recording' : 'Voice input'}
              >
                {recording ? <FiSquare size={20} /> : <FiMic size={20} />}
              </button>
              <button 
                type="submit" 
                disabled={loading || !input.trim()} 
                style={{ 
                  ...inputButtonStyle, 
                  ...sendButtonStyle, 
                  ...(!input.trim() ? disabledButtonStyle : {})
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Send message"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const chatContainerStyle = {
  height: '600px',
  display: 'flex',
  flexDirection: 'column'
};

const chatContainerMobileStyle = {
  height: 'calc(100vh - 180px)'
};

const messagesContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  marginBottom: '20px'
};

const messagesContainerMobileStyle = {
  padding: '12px',
  marginBottom: '0'
};

const welcomeMessageStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#666'
};

const messageStyle = {
  marginBottom: '15px',
  padding: '12px 16px',
  borderRadius: '8px',
  maxWidth: '80%'
};

const userMessageStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  marginLeft: 'auto',
  textAlign: 'right'
};

const aiMessageStyle = {
  backgroundColor: 'white',
  color: '#333',
  border: '1px solid #ddd'
};

const messageContentStyle = {
  lineHeight: '1.6'
};

const inputFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const modernInputContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  border: '2px solid #e5e7eb',
  borderRadius: '24px',
  padding: '4px 4px 4px 16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  gap: '8px'
};

// Add hover effect via inline style with onFocus/onBlur
const getInputContainerStyle = (isFocused) => ({
  ...modernInputContainerStyle,
  borderColor: isFocused ? '#4CAF50' : '#e5e7eb',
  boxShadow: isFocused ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
});

const modernInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '16px',
  padding: '12px 8px',
  backgroundColor: 'transparent',
  color: '#1f2937'
};

const modernInputMobileStyle = {
  fontSize: '16px',
  padding: '10px 6px'
};

const inputButtonsContainerStyle = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center'
};

const inputButtonStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: '#f3f4f6',
  color: '#6b7280'
};


const recordingButtonStyle = {
  backgroundColor: '#fee2e2',
  color: '#dc2626'
};

const sendButtonStyle = {
  backgroundColor: '#4CAF50',
  color: 'white'
};

const disabledButtonStyle = {
  opacity: 0.5,
  cursor: 'not-allowed'
};

const inputFormMobileStyle = {
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '10px',
  gap: '8px',
  background: '#fff',
  borderTop: '1px solid #eee',
  marginTop: '8px',
  paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
  zIndex: 2
};

const audioButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#4CAF50',
  fontSize: '18px',
  padding: '4px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.2s',
  opacity: 0.8
};


export default AIChat;

