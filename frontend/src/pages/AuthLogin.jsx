import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient.js';
import { useAuth } from '../state/AuthContext.jsx';

export const AuthLogin = () => {
  const [email, setEmail] = useState('buyer@acme.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const { login, setLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data);

      // Check if vendor and KYC not approved
      if (data.user.role === 'VENDOR' && data.user.kycStatus !== 'APPROVED') {
        navigate('/kyc-form');
      } else if (data.user.role === 'BUYER') {
        navigate('/buyer/dashboard');
      } else if (data.user.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to TenderHub</h1>
          <p className="text-sm text-slate-500">
            Access your account to manage tenders and bids
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-md transition"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 pt-6 border-t space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <p className="font-mono font-medium">Admin</p>
                <p className="font-mono text-slate-600">admin@gmail.com</p>
                <p className="font-mono text-slate-600">Ojash112</p>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <p className="font-mono font-medium">Buyer</p>
                <p className="font-mono text-slate-600">buyer@acme.local</p>
                <p className="font-mono text-slate-600">Password123!</p>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <p className="font-mono font-medium">Vendor</p>
                <p className="font-mono text-slate-600">vendor@global.local</p>
                <p className="font-mono text-slate-600">Password123!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-primary-600 font-semibold hover:underline"
          >
            Sign up here
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full text-primary-600 hover:bg-primary-50 text-sm font-medium py-2 rounded-md transition"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

