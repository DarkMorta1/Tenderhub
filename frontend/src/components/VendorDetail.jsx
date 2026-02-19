import React, { useEffect, useState } from 'react';
import { api } from '../utils/apiClient.js';
import { useAuth } from '../state/AuthContext.jsx';

export const VendorDetail = ({ vendorId, open, onClose }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open || !vendorId) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/vendors/${vendorId}`, token);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vendor');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, vendorId, token]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-slate-900">Vendor Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        {loading && <p className="text-slate-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{data.user.name}</h3>
              <p className="text-sm text-slate-600">{data.user.email}</p>
              <p className="text-sm text-slate-600">Joined: {new Date(data.user.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">KYC Status</p>
              <p className="font-medium text-slate-900">{data.user.kycStatus}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Profile</h4>
              {data.profile ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">Company:</span> {data.profile.companyName || '—'}</p>
                  <p><span className="font-medium">Location:</span> {data.profile.location || '—'}</p>
                  <p><span className="font-medium">Website:</span> {data.profile.website || '—'}</p>
                  <p><span className="font-medium">About:</span> {data.profile.about || '—'}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No additional profile information available.</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;
