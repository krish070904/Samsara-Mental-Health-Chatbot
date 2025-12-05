import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wifi, WifiOff, Settings, X, User } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5001';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    gender: ''
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let storedId = localStorage.getItem('samsara_user_id');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('samsara_user_id', storedId);
    }
    setUserId(storedId);

    const savedProfile = JSON.parse(localStorage.getItem('samsara_profile') || '{}');
    if (savedProfile.name) {
      setUserProfile(savedProfile);
    }

    setMessages([{
      sender: 'bot',
      text: `Hello ${savedProfile.name || 'Friend'}, I'm Ai Guru. I'm here to support you.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    const checkHealth = async () => {
      try {
        await axios.get(`${API_BASE}/`);
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem('samsara_profile', JSON.stringify(userProfile));
    setShowSettings(false);
    
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `Thanks ${userProfile.name}. I've updated your profile to help me understand you better.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        userId: userId,
        message: userMsg.text,
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender
      });

      const botReply = response.data.reply || "I'm listening...";

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Connection error. Please check the backend.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="brand">
          {/*bot icon */}
          <img 
            src="/ai-guru.jpg" 
            alt="AI Guru" 
            style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover' }} 
            onError={(e) => {e.target.style.display='none'}} 
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Samsara Mental Health Bot</h1>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Always here for you</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={`status-badge ${!isOnline ? 'offline' : ''}`}>
            <div className="status-dot" />
            {/* ✅ UPDATED: Now using Wifi/WifiOff to fix the warning */}
            {isOnline ? (
              <>Online <Wifi size={14} style={{ marginLeft: 5 }} /></>
            ) : (
              <>Offline <WifiOff size={14} style={{ marginLeft: 5 }} /></>
            )}
          </div>
          
          <button 
            onClick={() => setShowSettings(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-container">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-group ${msg.sender}`}
            >
              <div className="message-bubble">{msg.text}</div>
              <span className="timestamp">{msg.time}</span>
            </motion.div>
          ))}
          {isLoading && (
            <div className="message-group bot">
              <div className="message-bubble">...</div>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="input-area" onSubmit={handleSend}>
        <div className="input-wrapper">
          <input
            className="chat-input"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button className="send-btn" type="submit" disabled={!input.trim() || isLoading}>
          <Send size={24} />
        </button>
      </form>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-content"
          >
            <div className="modal-header">
              <h2>User Profile</h2>
              <button onClick={() => setShowSettings(false)} className="close-btn"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleProfileSave} className="settings-form">
              <div className="form-group">
                <label>Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    placeholder="How should I call you?"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    value={userProfile.age}
                    onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                    placeholder="25"
                  />
                </div>
                
                <div className="form-group">
                  <label>Gender</label>
                  <select 
                    value={userProfile.gender}
                    onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="save-btn">Save Profile</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;