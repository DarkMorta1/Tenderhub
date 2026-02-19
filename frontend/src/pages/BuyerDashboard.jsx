import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { api } from '../utils/apiClient.js';
import VendorDetail from '../components/VendorDetail.jsx';

export const BuyerDashboard = () => {
  const { user, token } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [bids, setBids] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1,
    budget: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendorModalId, setVendorModalId] = useState(null);

  useEffect(() => {
    fetchMyRequirements();
  }, [token]);

  const fetchMyRequirements = async () => {
    try {
      const data = await api.get('/requirements?page=1&limit=50', token);
      setRequirements(data.items || []);
    } catch (err) {
      setError('Failed to load requirements');
    }
  };

  const fetchBidsForRequirement = async (reqId) => {
    try {
      const data = await api.get(`/requirements/${reqId}`, token);
      setBids(data.bids || []);
      setSelectedReq(data.requirement);
    } catch (err) {
      setError('Failed to load bids');
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deadline = new Date(formData.deadline).toISOString();
      await api.post(
        '/requirements',
        {
          ...formData,
          budget: parseFloat(formData.budget),
          quantity: parseInt(formData.quantity),
          deadline
        },
        token
      );
      setFormData({ title: '', description: '', quantity: 1, budget: '', deadline: '' });
      setShowForm(false);
      await fetchMyRequirements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create requirement');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Accept this bid?')) return;
    try {
      await api.post(`/bids/${bidId}/accept`, {}, token);
      await fetchBidsForRequirement(selectedReq._id);
    } catch (err) {
      setError('Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Reject this bid?')) return;
    try {
      await api.post(`/bids/${bidId}/reject`, {}, token);
      await fetchBidsForRequirement(selectedReq._id);
    } catch (err) {
      setError('Failed to reject bid');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Business Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
        >
          + New Offer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>
      )}

      {/* Create Requirement Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Offer</h2>
          <form onSubmit={handleCreateRequirement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Office Furniture Supply"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="100000"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of your requirements..."
                rows="4"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Offer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Offers ({requirements.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {requirements.map((req) => (
              <button
                key={req._id}
                onClick={() => fetchBidsForRequirement(req._id)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedReq?._id === req._id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <p className="font-medium text-slate-900">{req.title}</p>
                <p className="text-xs text-slate-500 mt-1">Budget: ₹{req.budget.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Qty: {req.quantity}</p>
              </button>
            ))}
            {requirements.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No offers yet</p>
            )}
          </div>
        </div>

        {/* Bids for Selected Requirement */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {selectedReq ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Bids for "{selectedReq.title}"</h2>
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-600">Budget</p>
                    <p className="font-semibold text-slate-900">₹{selectedReq.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Qty</p>
                    <p className="font-semibold text-slate-900">{selectedReq.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Status</p>
                    <p className="font-semibold text-slate-900">{selectedReq.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Bids</p>
                    <p className="font-semibold text-slate-900">{bids.length}</p>
                  </div>
                </div>
              </div>

              {bids.length > 0 ? (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {bid.vendor?.name || 'Unknown Vendor'}
                          </h3>
                          <p className="text-sm text-slate-500">{bid.vendor?.email}</p>
                          <div className="mt-2">
                            <button
                              onClick={() => setVendorModalId(bid.vendor?._id)}
                              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                            >
                              View Vendor
                            </button>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bid.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : bid.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {bid.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-600">Bid Price</p>
                          <p className="font-semibold text-slate-900">₹{bid.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Delivery</p>
                          <p className="font-semibold text-slate-900">{bid.deliveryTimeDays} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Unit Price</p>
                          <p className="font-semibold text-slate-900">
                            ₹{(bid.price / selectedReq.quantity).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Submitted</p>
                          <p className="font-semibold text-slate-900">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {bid.notes && (
                        <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Notes:</p>
                          <p className="text-sm text-slate-700">{bid.notes}</p>
                        </div>
                      )}

                      {bid.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptBid(bid._id)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectBid(bid._id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No bids yet. Vendors will see your offer on their dashboard.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Select an offer to view bids</p>
            </div>
          )}
        </div>
      </div>
      <VendorDetail vendorId={vendorModalId} open={!!vendorModalId} onClose={() => setVendorModalId(null)} />
    </div>
  );
};

