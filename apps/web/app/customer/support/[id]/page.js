'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/StatusBadge';
import { apiRequest } from '../../../../services/api';
import { Send, Paperclip, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CustomerTicketDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadTicketData(id);
    }
  }, [id]);

  const loadTicketData = async (ticketId) => {
    try {
      const data = await apiRequest(`/api/support/tickets/${ticketId}`);
      setTicket(data.ticket);
      setMessages(data.messages || []);
      setEvidence(data.evidence || []);
    } catch (err) {
      setError(err.message || 'Support ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const data = await apiRequest(`/api/support/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage, visibility: 'customer_visible' })
      });
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiRequest(`/api/support/tickets/${id}/evidence`, {
        method: 'POST',
        body: formData
      });
      setEvidence(prev => [...prev, data.evidence]);
    } catch (err) {
      setError(err.message || 'Evidence upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="customer" />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading support thread...
          </main>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="customer" />
          <main style={{ flex: 1, padding: '2rem' }}>
            <div className="alert alert-error">{error || 'Ticket not found.'}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '900px' }}>
          {/* Ticket Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {ticket.subject}
                </h1>
                <StatusBadge status={ticket.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ticket #{ticket.ticketNumber} • Device: <strong>{ticket.warrantyId?.product?.brand} {ticket.warrantyId?.product?.name}</strong> ({ticket.warrantyId?.warrantyNumber})
              </p>
            </div>
          </div>

          {/* Messages & Discussion Thread */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">Conversation History</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>
              {messages.map((m, idx) => {
                const isCustomer = m.senderRole === 'customer';
                return (
                  <div key={idx} style={{
                    alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backgroundColor: isCustomer ? 'var(--feature-primary)' : 'var(--feature-secondary)',
                    color: 'var(--bg)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 600 }}>
                      {isCustomer ? 'You' : `${m.senderId?.fullName || 'Retailer Staff'}`}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.message}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.35rem', textAlign: 'right' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type your message or update to the retailer..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Evidence Attachments Box */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Supporting Evidence & Photos</h2>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  disabled={uploading}
                >
                  <Paperclip size={14} /> {uploading ? 'Uploading...' : 'Upload Attachment'}
                </button>
              </div>
            </div>

            {evidence.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No diagnostic photos or receipts attached yet. Upload photos showing device fault and serial number to expedite claims assessment.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {evidence.map((ev, idx) => (
                  <div key={idx} style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg)'
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                      {ev.originalFilename}
                    </span>
                    <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

