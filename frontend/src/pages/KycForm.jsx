import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient.js';
import { useAuth } from '../state/AuthContext.jsx';

export const KycForm = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [documentNames, setDocumentNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not a vendor or already KYC approved
  React.useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (user.role !== 'VENDOR') {
      navigate('/buyer/dashboard');
    } else if (user.kycStatus === 'APPROVED') {
      navigate('/vendor/dashboard');
    }
  }, [user, navigate]);

  const handleAddDocument = () => {
    const docArray = documentNames
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);
    if (docArray.length > 0) {
      setDocuments([...documents, ...docArray]);
      setDocumentNames('');
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (documents.length === 0) {
      setError('Please add at least one document');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/kyc', { documents }, token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white shadow-sm rounded-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your KYC Verification</h1>
          <p className="text-slate-600">
            Upload documents to verify your vendor identity. This is required to submit bids.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ KYC submitted successfully!</p>
            <p className="text-sm text-green-700">Admin will review and approve your account soon.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Documents</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide the following documents for verification:
            </p>
            <ul className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
              <li className="text-slate-700">📄 Business Registration Certificate</li>
              <li className="text-slate-700">📄 Tax ID / GSTIN</li>
              <li className="text-slate-700">📄 Bank Account Details</li>
              <li className="text-slate-700">📄 Owner ID Proof</li>
              <li className="text-slate-700">📄 Company Address Proof</li>
            </ul>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Document Names/References</label>
            <p className="text-xs text-slate-500 mb-2">
              Enter document names separated by commas. Example: pan.pdf, gst.pdf, bank_statement.pdf
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={documentNames}
                onChange={(e) => setDocumentNames(e.target.value)}
                placeholder="e.g., business_reg.pdf, tax_id.pdf"
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-2 bg-primary-100 text-primary-700 font-medium rounded-md hover:bg-primary-200 transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Uploaded Documents</label>
              <div className="space-y-2">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-700">📎 {doc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">{documents.length} document(s) added</p>
            </div>
          )}

          {/* Company Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-slate-900">Vendor Information</h4>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                disabled
                defaultValue={user?.companyName || 'Global Supplies Ltd'}
                className="w-full border rounded-md px-3 py-2 text-sm bg-slate-100 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Email</label>
              <input
                type="email"
                disabled
                defaultValue={user?.email}
                className="w-full border rounded-md px-3 py-2 text-sm bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ By submitting, you confirm that all information is accurate and you agree to our verification process.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || documents.length === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white text-sm font-medium py-3 rounded-md transition"
          >
            {loading ? 'Submitting KYC...' : documents.length > 0 ? 'Submit KYC' : 'Add documents to submit'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Note: Admin will review your KYC within 24 hours. You'll be notified once approved.
          </p>
        </form>
      </div>
    </div>
  );
};
