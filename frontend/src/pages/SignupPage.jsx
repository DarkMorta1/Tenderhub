import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient.js';
import { useAuth } from '../state/AuthContext.jsx';

export const SignupPage = () => {
  const [step, setStep] = useState('role'); // role, details
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role: role === 'business' ? 'BUYER' : 'VENDOR'
      };
      if (role === 'vendor') {
        payload.companyName = companyName;
      }

      const data = await api.post('/auth/register', payload);
      login(data);

      // Redirect to KYC form for vendors
      if (data.user.role === 'VENDOR') {
        navigate('/kyc-form');
      } else if (data.user.role === 'BUYER') {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to TenderHub</h1>
            <p className="text-slate-600">Choose how you want to use the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Owner / Buyer */}
            <div
              onClick={() => handleRoleSelect('business')}
              className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Business Owner</h3>
              <p className="text-slate-600 mb-6">
                Post tenders and requirements, compare vendor bids, and manage procurement
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Post tenders and requirements</li>
                <li>✓ Receive bids from verified vendors</li>
                <li>✓ Compare and accept bids</li>
                <li>✓ Track orders and payments</li>
              </ul>
            </div>

            {/* Vendor */}
            <div
              onClick={() => handleRoleSelect('vendor')}
              className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Vendor</h3>
              <p className="text-slate-600 mb-6">
                Browse tenders, submit bids, and grow your business with verified buyers
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Browse open tenders</li>
                <li>✓ Submit competitive bids</li>
                <li>✓ Complete KYC verification</li>
                <li>✓ Build your reputation</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-primary-600 font-semibold hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-8">
        <button
          onClick={() => setStep('role')}
          className="text-primary-600 text-sm font-medium mb-6 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Create{role === 'business' ? ' Business' : ' Vendor'} Account
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {role === 'business'
            ? 'Sign up to post tenders and manage procurement'
            : 'Sign up to browse tenders and submit bids'}
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Ltd"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white text-sm font-medium py-2.5 rounded-md transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/signin')}
            className="text-primary-600 font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
