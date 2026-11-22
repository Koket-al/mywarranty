'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';
import { Bell, CheckCheck } from 'lucide-react';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Notifications
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Updates on your warranty registrations and claims
              </p>
            </div>

            {notifications.length > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(241, 165, 1, 0.75)' }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Bell size={36} color="var(--bg)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'rgba(241, 165, 1, 0.75)', fontSize: '0.875rem' }}>No notifications right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map(n => (
                  <div key={n._id} style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: n.readAt ? 'var(--feature-secondary)' : 'var(--feature-primary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--bg)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(241, 165, 1, 0.75)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--bg)', lineHeight: 1.5 }}>{n.message}</p>
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

