import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AuthLogin } from './pages/AuthLogin.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { KycForm } from './pages/KycForm.jsx';
import { BuyerDashboard } from './pages/BuyerDashboard.jsx';
import { VendorDashboard } from './pages/VendorDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<AuthLogin />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kyc-form" element={<KycForm />} />

      <Route
        path="/buyer/*"
        element={
          <ProtectedRoute role="BUYER">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<BuyerDashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute role="VENDOR">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<VendorDashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="ADMIN">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;


