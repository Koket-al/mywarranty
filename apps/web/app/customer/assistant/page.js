'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';
import { Bot, Send, User } from 'lucide-react';

export default function CustomerAiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your MW (My Warranty) Assistant. I can answer questions about your device's coverage, expiration dates, exclusions, or how to submit a service request. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const data = await apiRequest('/api/ai/customer-assistant', {
        method: 'POST',
        body: JSON.stringify({ query: userText })
      });

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.response?.answer || 'I could not find an answer in your registered warranty terms.'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving your warranty records. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.5rem'
            }}>
              <Bot size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              Warranty Assistant AI
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Answers questions grounded strictly in your registered warranties and policy clauses
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  {m.sender === 'ai' && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={18} />
                    </div>
                  )}

                  <div style={{
                    backgroundColor: m.sender === 'user' ? 'var(--primary)' : '#f8fafc',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '2.5rem' }}>
                  Consulting your registered policy clauses...
                </div>
              )}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ask about expiration, coverage, screen replacement..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

