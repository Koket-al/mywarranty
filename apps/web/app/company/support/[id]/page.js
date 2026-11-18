'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/StatusBadge';
import { apiRequest } from '../../../../services/api';
import { 
  Bot, 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  Paperclip,
  Lock
} from 'lucide-react';

export default function CompanyCaseReviewPage() {
  const params = useParams();
  const id = params?.id;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reply message state
  const [replyText, setReplyText] = useState('');
  const [visibility, setVisibility] = useState('customer_visible');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Human decision state
  const [decision, setDecision] = useState('approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaseData(id);
    }
  }, [id]);

  const loadCaseData = async (ticketId) => {
    try {
      const data = await apiRequest(`/api/support/tickets/${ticketId}`);
      setTicket(data.ticket);
      setMessages(data.messages || []);
      setEvidence(data.evidence || []);
      setAiReport(data.aiReport);
    } catch (err) {
      setError(err.message || 'Support case not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiInvestigation = async () => {
    setInvestigating(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest(`/api/ai/investigate/${id}`, { method: 'POST' });
      setAiReport(data.recommendation);
      setSuccess('AI investigation generated structured recommendation based on issued policy terms.');
      loadCaseData(id);
    } catch (err) {
      setError(err.message || 'AI investigation failed.');
    } finally {
      setInvestigating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingMsg(true);
    try {
      const data = await apiRequest(`/api/support/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: replyText, visibility })
      });
      setMessages(prev => [...prev, data.message]);
      setReplyText('');
    } catch (err) {
      setError(err.message || 'Failed to post message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleRecordDecision = async (e) => {
    e.preventDefault();
    if (!decisionReason.trim()) {
      return alert('Decision reason is required.');
    }

    setSubmittingDecision(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest(`/api/support/tickets/${id}/decisions`, {
        method: 'POST',
        body: JSON.stringify({ decision, decisionReason })
      });

      if (data.success) {
        setSuccess(data.message);
        loadCaseData(id);
      }
    } catch (err) {
      setError(err.message || 'Failed to record decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="company" />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading case details...
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Case #{ticket?.ticketNumber}: {ticket?.subject}
                </h1>
                <StatusBadge status={ticket?.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Customer: <strong>{ticket?.customerId?.fullName}</strong> ({ticket?.customerId?.email}) • Warranty: <strong>{ticket?.warrantyId?.warrantyNumber}</strong>
              </p>
            </div>

            <button
              onClick={handleRunAiInvestigation}
              className="btn btn-secondary"
              disabled={investigating}
            >
              <Bot size={18} color="#9333ea" />
              {investigating ? 'Running AI Investigation...' : 'Run AI Investigation'}
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* AI Investigation Report Box */}
          {aiReport && (
            <div className="card" style={{ marginBottom: '2rem', border: '2px solid #e9d5ff', backgroundColor: '#faf5ff' }}>
              <div className="card-header" style={{ borderColor: '#e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={22} color="#9333ea" />
                  <h2 className="card-title" style={{ color: '#581c87' }}>Structured AI Investigation Report</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b21a8' }}>Recommendation:</span>
                  <StatusBadge status={aiReport.recommendation} />
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#3b0764', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <strong>Summary: </strong>{aiReport.summary}
                </div>
                <div>
                  <strong>Analysis & Policy Reasoning: </strong>{aiReport.reasoning}
                </div>

                {/* Policy References */}
                {aiReport.policyReferences?.length > 0 && (
                  <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#581c87' }}>Policy Clauses Cited:</div>
                    {aiReport.policyReferences.map((ref, idx) => (
                      <div key={idx} style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        • <strong>{ref.clauseId}</strong>: "{ref.quotedOrReferencedText}" — <em>{ref.explanation}</em>
                      </div>
                    ))}
                  </div>
                )}

                {/* Missing Info */}
                {aiReport.missingInformation?.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--warning)' }}>Missing Information Identified:</strong>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                      {aiReport.missingInformation.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.8125rem'
                }}>
                  👉 <strong>Suggested Next Step: </strong>{aiReport.suggestedNextStep}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontStyle: 'italic', borderTop: '1px dashed #d8b4fe', paddingTop: '0.5rem' }}>
                  * Mandatory Rule: The AI recommendation is an automated investigation aid. A company employee makes the final decision.
                </div>
              </div>
            </div>
          )}

          {/* Two Column Grid: Conversation vs Human Decision Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Left: Message Thread & Evidence */}
            <div>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h2 className="card-title">Case Discussion</h2>
                  <span className="badge badge-info">{messages.length} Messages</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {messages.map((m, idx) => {
                    const isStaff = m.senderRole === 'company';
                    const isInternal = m.visibility === 'company_internal';

                    return (
                      <div key={idx} style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: isInternal ? '#fefce8' : isStaff ? '#f1f5f9' : '#ffffff',
                        border: `1px solid ${isInternal ? '#fef08a' : 'var(--border)'}`,
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                          <strong>
                            {m.senderId?.fullName || (isStaff ? 'Retailer Staff' : 'Customer')}
                            {isInternal && <span style={{ color: 'var(--warning)', marginLeft: '6px' }}>(Internal Note)</span>}
                          </strong>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendMessage}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="vis"
                        checked={visibility === 'customer_visible'}
                        onChange={() => setVisibility('customer_visible')}
                      />
                      Customer-visible reply
                    </label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="vis"
                        checked={visibility === 'company_internal'}
                        onChange={() => setVisibility('company_internal')}
                      />
                      <Lock size={12} color="var(--warning)" /> Staff-only internal note
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={visibility === 'company_internal' ? 'Add internal case note...' : 'Reply to customer...'}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={sendingMsg}
                    />
                    <button type="submit" className="btn btn-primary" disabled={sendingMsg || !replyText.trim()}>
                      <Send size={15} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Evidence Attachments */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Customer Submitted Evidence</h2>
                </div>
                {evidence.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No evidence files attached.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {evidence.map((ev, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg)',
                        borderRadius: '6px',
                        fontSize: '0.8125rem'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Paperclip size={14} color="var(--accent)" />
                          {ev.originalFilename}
                        </span>
                        <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                          View Attachment
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Human Claim Decision Form */}
            <div>
              <div className="card" style={{ border: '2px solid var(--primary)' }}>
                <div className="card-header">
                  <h2 className="card-title">Human Warranty Decision</h2>
                  <span className="badge badge-info">Authorized Decision Maker</span>
                </div>

                <form onSubmit={handleRecordDecision}>
                  <div className="form-group">
                    <label className="form-label">Decision <span className="required">*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: decision === 'approved' ? 'var(--success-bg)' : '#ffffff'
                      }}>
                        <input
                          type="radio"
                          name="dec"
                          value="approved"
                          checked={decision === 'approved'}
                          onChange={() => setDecision('approved')}
                        />
                        <CheckCircle2 size={16} color="var(--success)" />
                        <strong>Approve Claim for Assessment / Replacement</strong>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: decision === 'more_information_required' ? 'var(--warning-bg)' : '#ffffff'
                      }}>
                        <input
                          type="radio"
                          name="dec"
                          value="more_information_required"
                          checked={decision === 'more_information_required'}
                          onChange={() => setDecision('more_information_required')}
                        />
                        <HelpCircle size={16} color="var(--warning)" />
                        <strong>Request More Information / Diagnostics</strong>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: decision === 'rejected' ? 'var(--danger-bg)' : '#ffffff'
                      }}>
                        <input
                          type="radio"
                          name="dec"
                          value="rejected"
                          checked={decision === 'rejected'}
                          onChange={() => setDecision('rejected')}
                        />
                        <XCircle size={16} color="var(--danger)" />
                        <strong>Reject Claim (Policy Exclusions / Expired)</strong>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Decision Reason & Notes <span className="required">*</span></label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Explain the reason for this decision. This will be recorded immutably in the audit ledger and sent to the customer..."
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={submittingDecision || !decisionReason.trim()}
                  >
                    {submittingDecision ? 'Recording Decision...' : 'Record Final Decision & Notify Customer'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

