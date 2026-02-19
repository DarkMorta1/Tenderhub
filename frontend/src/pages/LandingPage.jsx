import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'BUYER') navigate('/buyer/dashboard');
      else if (user.role === 'VENDOR') navigate('/vendor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">TenderHub</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/signin')}
              className="px-6 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Smart Vendor Bidding & Procurement Platform
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Connect with verified vendors, post tenders, and manage procurement with complete transparency and security.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold mb-2">Verified Vendors</h3>
              <p className="text-primary-100">All vendors go through KYC verification for safe transactions</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Transparent Bidding</h3>
              <p className="text-primary-100">Compare bids side-by-side with full vendor details</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure Escrow</h3>
              <p className="text-primary-100">Money held safely until work is delivered</p>
            </div>
          </div>

          <div className="mt-12 space-y-3">
            <p className="text-sm text-primary-100">Demo Credentials:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm font-mono">Admin: admin@gmail.com</p>
                <p className="text-sm font-mono">Password: Ojash112</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm font-mono">Buyer: buyer@acme.local</p>
                <p className="text-sm font-mono">Password: Password123!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
