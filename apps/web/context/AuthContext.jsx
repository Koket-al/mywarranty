'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeCompany, setActiveCompany] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const data = await apiRequest('/api/auth/me');
      if (data.success) {
        setUser(data.user);
        setActiveCompany(data.activeCompany);
        setMemberships(data.memberships || []);
      } else {
        setUser(null);
        setActiveCompany(null);
        setMemberships([]);
      }
    } catch (err) {
      setUser(null);
      setActiveCompany(null);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.success) {
      await refreshSession();
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setActiveCompany(null);
      setMemberships([]);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      activeCompany,
      memberships,
      loading,
      login,
      logout,
      refreshSession,
      isCompanyStaff: !!activeCompany,
      isCustomer: !!user && !activeCompany,
      isPlatformAdmin: !!user?.isPlatformAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

