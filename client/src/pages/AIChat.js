import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiMic, FiSquare } from 'react-icons/fi';
import api from '../services/api';

const AIChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const response = await api.post('/ai/chat', {
        message: userMessage,
        context
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
          // Transcribe
          const t = await api.post('/ai/transcribe', { audioBase64: base64, mimeType: 'audio/webm' });
          const text = (t.data?.text || '').trim();
          if (text) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            const context = messages
              .filter(m => m.role !== 'system')
              .slice(-10)
              .map(m => ({ role: m.role, content: m.content }));
            const resp = await api.post('/ai/chat', { message: text, context });
            setMessages(prev => [...prev, { role: 'assistant', content: resp.data.response }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'I could not understand the audio clearly. Please try again.' }]);
          }
        } catch (err) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Voice processing failed. Please try again.' }]);
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

  return (
    <div className="container">
      <h1>AI Farming Assistant</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ask me anything about poultry farming - health, feeding, housing, management, and more!
      </p>

      <div className="card" style={chatContainerStyle}>
        <div style={messagesContainerStyle}>
          {messages.length === 0 && (
            <div style={welcomeMessageStyle}>
              <FiMessageCircle size={48} color="#4CAF50" />
              <h2>Hello, {user.name}!</h2>
              <p>I'm your AI farming assistant. I can help you with:</p>
              <ul style={helpListStyle}>
                <li>Poultry health and disease prevention</li>
                <li>Feeding and nutrition advice</li>
                <li>Housing and management tips</li>
                <li>Egg production optimization</li>
                <li>General farming best practices</li>
              </ul>
              <p>Ask me anything!</p>
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
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
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

        <form onSubmit={handleSend} style={inputFormStyle}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about poultry farming..."
            style={inputStyle}
            disabled={loading}
          />
          <button type="button" className="btn" onClick={recording ? stopRecording : startRecording} disabled={loading}>
            {recording ? <><FiSquare /> Stop</> : <><FiMic /> Voice</>}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            <FiSend /> Send
          </button>
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

const messagesContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  marginBottom: '20px'
};

const welcomeMessageStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#666'
};

const helpListStyle = {
  textAlign: 'left',
  display: 'inline-block',
  margin: '20px 0'
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
  gap: '10px'
};

const inputStyle = {
  flex: 1,
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '16px'
};

export default AIChat;

