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
  const [progress, setProgress] = useState(null);

  const renderMessageBody = (text) => {
    if (!text) return null;
    const parts = text.split(/```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const code = part.replace(/^[\w-]*\n/, '');
        return (
          <pre key={index} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', overflowX: 'auto', margin: '8px 0', fontSize: '13px', fontFamily: 'monospace', border: '1px solid #334155' }}>
            <code style={{ color: '#e2e8f0' }}>{code}</code>
          </pre>
        );
      }
      const bParts = part.split(/\*\*(.*?)\*\*/g);
      return <span key={index}>{bParts.map((bp, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'white' }}>{bp}</strong> : bp)}</span>;
    });
  };

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
      if (data.progress) setProgress(data.progress);
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
      if (data.progress) setProgress(data.progress);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
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
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * i }} className="progress-item">
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '13px' }}>{m.title}</span>
              </motion.div>
            ))}
            {selectedCandidate.signals && selectedCandidate.signals.missionsCompleted > 5 && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>+ {selectedCandidate.signals.missionsCompleted - 5} more</span>
            )}

            {/* Show skipped topics if any */}
            {selectedCandidate.missions.some(m => m.skipped) && (
              <div style={{ marginTop: '20px' }}>
                <h3 className="progress-title" style={{ color: '#f87171' }}>Skipped Topics</h3>
                {selectedCandidate.missions.filter(m => m.skipped).map((m, i) => (
                  <div key={i} className="progress-item" style={{ color: '#f87171', borderLeft: '2px solid #ef4444', paddingLeft: '8px' }}>
                    <span style={{ fontSize: '13px' }}>{m.title}</span>
                  </div>
                ))}
              </div>
            )}
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
          {progress && !feedback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                Questions Build: <strong>{progress.turn}/{progress.total}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                Days Covered: <strong>{Math.min(progress.turn, 4) + (progress.turn > 4 ? Math.floor((progress.turn - 4) / 2) : 0)} / 7</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                <div className="ai-indicator" style={{ backgroundColor: '#10b981' }} />
                Active
              </div>
            </div>
          )}
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
                {renderMessageBody(msg.text)}
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

        <form onSubmit={sendMessage} className="input-area" style={{ alignItems: 'flex-end', padding: '16px' }}>
          <textarea
            className="chat-input"
            style={{ resize: 'none', height: '60px', borderRadius: '12px', lineHeight: '1.5', padding: '12px', flexGrow: 1 }}
            placeholder={feedback ? "Interview concluded." : "Type response or paste code... (Shift + Enter for new line)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping || !!feedback || !session}
          />
          <button
            type="submit"
            className="send-button"
            style={{ marginBottom: '6px' }}
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
