import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile data from our custom MERN backend
  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      // Only clear token if it's explicitly 401
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('attendify_token');
        localStorage.removeItem('attendify_user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('attendify_token');
    const localUser = localStorage.getItem('attendify_user');
    
    if (token) {
      if (localUser) {
        try {
          setUser(JSON.parse(localUser));
        } catch (e) {}
      }
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    console.log('🚀 Initializing Signup for:', email);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      
      if (data.requiresVerification) {
        return data;
      }
      
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        onboardingComplete: data.onboardingComplete,
        sessionEndDate: data.sessionEndDate
      };

      localStorage.setItem('attendify_token', data.token);
      localStorage.setItem('attendify_user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      console.error('❌ Signup Exception:', message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    console.log('🔑 Attempting Login for:', email);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        onboardingComplete: data.onboardingComplete,
        sessionEndDate: data.sessionEndDate
      };

      localStorage.setItem('attendify_token', data.token);
      localStorage.setItem('attendify_user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      toast.success(`Welcome back! 👋`);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      console.error('❌ Login Exception:', message);
      throw new Error(message);
    }
  }, []);

  const verifyOtp = useCallback(async ({ email, otp }) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        onboardingComplete: data.onboardingComplete,
        sessionEndDate: data.sessionEndDate
      };

      localStorage.setItem('attendify_token', data.token);
      localStorage.setItem('attendify_user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      toast.success('Email verified successfully!');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(message);
    }
  }, []);

  const resendOtp = useCallback(async ({ email }) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      toast.success(data.message || 'OTP resent successfully!');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('attendify_token');
    localStorage.removeItem('attendify_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const completeOnboarding = useCallback(async (profileData = {}) => {
    try {
      const { data } = await api.put('/auth/settings', {
        ...profileData,
        onboardingComplete: true
      });
      
      const updatedUser = { ...user, ...data, onboardingComplete: true };
      setUser(updatedUser);
      localStorage.setItem('attendify_user', JSON.stringify(updatedUser));
      
      toast.success('Onboarding complete!');
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      throw new Error(message);
    }
  }, [user]);

  const updateUser = useCallback((updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('attendify_user', JSON.stringify(newUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, completeOnboarding, verifyOtp, resendOtp, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
