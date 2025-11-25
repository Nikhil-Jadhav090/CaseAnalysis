import React, { createContext, useContext, useState } from 'react';
import { API_ENDPOINTS } from '../config';

const AuthContext = createContext(null);

export const ROLES = {
  USER: 'user',
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('[AUTH] Login attempt:', { email });
      const res = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[AUTH] Login failed:', res.status, err);
        throw new Error(err.detail || 'Login failed');
      }
      const data = await res.json();
      console.log('[AUTH] Login successful, tokens received');
      // Save tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Fetch profile
      const prof = await fetch(API_ENDPOINTS.profile, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const userData = prof.ok ? await prof.json() : { email };
      console.log('[AUTH] Profile loaded:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      throw new Error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      // Backend expects: email, password, password2, first_name, last_name, role
      const [first_name, ...rest] = name.split(' ');
      const last_name = rest.join(' ') || '';
      const payload = {
        email,
        password,
        password2: password,
        first_name,
        last_name,
      };
      
      console.log('[AUTH] Registration attempt:', { email, first_name, last_name });
      console.log('[AUTH] Full payload:', payload);
      
      const res = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('[AUTH] Registration response status:', res.status);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[AUTH] Registration failed:', res.status, err);
        
        // Extract the first available error message from any field
        let errorMsg = 'Registration failed';
        if (err.email && Array.isArray(err.email)) {
          errorMsg = err.email[0];
        } else if (err.password && Array.isArray(err.password)) {
          errorMsg = err.password[0];
        } else if (err.password2 && Array.isArray(err.password2)) {
          errorMsg = err.password2[0];
        } else if (err.non_field_errors && Array.isArray(err.non_field_errors)) {
          errorMsg = err.non_field_errors[0];
        } else if (err.detail) {
          errorMsg = err.detail;
        } else {
          // If response is object with error details, stringify it
          errorMsg = JSON.stringify(err);
        }
        throw new Error(errorMsg);
      }
      
      const regData = await res.json();
      console.log('[AUTH] Registration successful:', regData);
      
      // Auto-login after register
      console.log('[AUTH] Auto-logging in after registration...');
      return await login(email, password);
    } catch (error) {
      console.error('[AUTH] Registration error:', error.message);
      throw new Error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async ({ name, email, currentPassword, newPassword }) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const updatedUser = {
        ...user,
        name: name || user.name,
        email: email || user.email,
        updatedAt: new Date().toISOString(),
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    roles: ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};