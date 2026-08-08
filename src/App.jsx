import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, CheckCircle2, BrainCircuit, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCandidates, startInterview as mockStart, chatInterview } from './mockBackend';
import './index.css';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch candidates on load bypassing backend to work on GitHub Pages
    fetchCandidates()
      .then(data => setCandidates(data))
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startInterview = async (candidate) => {
    setSelectedCandidate(candidate);
    setIsTyping(true);
    try {
      const sessionId = 'session_' + Math.random().toString(36).substring(7);
      const data = await mockStart(sessionId, candidate);
      setSession(sessionId);
      setMessages([{ role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'ai', text: "Error connecting to the interview server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !session || feedback) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const data = await chatInterview(session, userText);

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);

      if (data.done && data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "Network error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <div className="glass-panel sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
          <div className="profile-img-container">
            <div className="profile-img">
              <User size={36} />
            </div>
          </div>
          <h2 className="profile-name">{selectedCandidate ? selectedCandidate.member.name : "Select Candidate"}</h2>
          <span className="profile-role">{selectedCandidate ? selectedCandidate.member.jobRole : "Pending Selection..."}</span>
        </div>

        {selectedCandidate && (
          <div className="progress-section" style={{ flexGrow: 1, overflowY: 'auto' }}>
            <h3 className="progress-title">Completed Missions</h3>
            {selectedCandidate.missions.filter(m => m.passed).slice(0, 5).map((m, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className="progress-item"
              >
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '13px' }}>{m.title}</span>
              </motion.div>
            ))}
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>+ {selectedCandidate.signals.missionsCompleted - 5} more</span>
          </div>
        )}
      </div>

      <div className="glass-panel chat-area">
        {!session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="start-overlay"
          >
            <BrainCircuit size={64} style={{ color: '#3b82f6', marginBottom: '24px' }} />
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Technical Interview</h1>
            <p style={{ color: '#94a3b8', marginBottom: '16px', maxWidth: '450px', textAlign: 'center', lineHeight: '1.5' }}>
              Please select a candidate to begin the dynamically generated AI interview session.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px' }}>
              {candidates.map((cand) => (
                <button
                  key={cand.member.id}
                  onClick={() => startInterview(cand)}
                  className="start-btn"
                  style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Users size={16} /> {cand.member.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="chat-header">
          <div className="chat-header-title">
            <Bot size={24} style={{ color: '#60a5fa' }} />
            <span>AI Technical Interviewer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8' }}>
            <div className="ai-indicator" />
            Active Mode
          </div>
        </div>

        <div className="messages-container">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-bubble ${msg.role === 'ai' ? 'message-ai' : 'message-user'}`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="message-bubble message-ai typing-indicator"
            >
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </motion.div>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="feedback-panel"
            >
              <h3 className="feedback-title">
                <CheckCircle2 size={24} />
                Interview Complete
              </h3>

              <div className="feedback-section">
                <h4>Strengths</h4>
                <ul className="feedback-list">
                  {feedback.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="feedback-section">
                <h4>Gaps Identified</h4>
                <ul className="feedback-list" style={{ color: '#f87171' }}>
                  {feedback.gaps.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="feedback-section">
                <h4>Next Steps</h4>
                <ul className="feedback-list" style={{ color: '#fbbf24' }}>
                  {feedback.next.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold' }}>
                Summary: {feedback.summary}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-area">
          <input
            type="text"
            className="chat-input"
            placeholder={feedback ? "Interview concluded." : "Type your response..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || !!feedback || !session}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isTyping || !!feedback || !session}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
