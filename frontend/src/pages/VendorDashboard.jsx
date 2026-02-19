import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { api } from '../utils/apiClient.js';

export const VendorDashboard = () => {
  const { user, token } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidData, setBidData] = useState({
    price: '',
    deliveryTimeDays: '7',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('marketplace');
  const [filter, setFilter] = useState('OPEN');

  useEffect(() => {
    fetchOpenRequirements();
    fetchMyBids();
  }, [token, filter]);

  const fetchOpenRequirements = async () => {
    try {
      const data = await api.get(`/requirements?status=${filter}&page=1&limit=50`, token);
      setRequirements(data.items || []);
    } catch (err) {
      setError('Failed to load offers');
    }
  };

  const fetchMyBids = async () => {
    try {
      const data = await api.get('/bids/my-bids?page=1&limit=50', token);
      setMyBids(data.items || []);
    } catch (err) {
      console.error('Failed to load bids');
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(
        '/bids',
        {
          requirementId: selectedReq._id,
          price: parseFloat(bidData.price),
          deliveryTimeDays: parseInt(bidData.deliveryTimeDays),
          notes: bidData.notes
        },
        token
      );
      setBidData({ price: '', deliveryTimeDays: '7', notes: '' });
      setShowBidForm(false);
      setSelectedReq(null);
      await fetchOpenRequirements();
      await fetchMyBids();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawBid = async (bidId) => {
    if (!window.confirm('Withdraw this bid?')) return;
    try {
      await api.post(`/bids/${bidId}/withdraw`, {}, token);
      await fetchMyBids();
      await fetchOpenRequirements();
    } catch (err) {
      setError('Failed to withdraw bid');
    }
  };

  const daysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vendor Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome, {user?.name}. Browse and bid on business offers.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setTab('marketplace')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            tab === 'marketplace'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setTab('bids')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            tab === 'bids'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Bids ({myBids.length})
        </button>
      </div>

      {/* Marketplace Tab */}
      {tab === 'marketplace' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['OPEN', 'IN_REVIEW', 'AWARDED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-primary-300'
                }`}
              >
                {status === 'IN_REVIEW' ? 'In Review' : status}
              </button>
            ))}
          </div>

          {/* Offers Grid */}
          {requirements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requirements.map((req) => {
                const hasMyBid = myBids.some((bid) => bid.requirement?._id === req._id || bid.requirementId === req._id);
                const myBid = myBids.find((bid) => bid.requirement?._id === req._id || bid.requirementId === req._id);

                return (
                  <div
                    key={req._id}
                    className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                      selectedReq?._id === req._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSelectedReq(req)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-slate-900 flex-1">{req.title}</h3>
                      {hasMyBid && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2 whitespace-nowrap">
                          Have bid
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{req.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Budget</p>
                        <p className="font-semibold text-slate-900">₹{req.budget.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Qty</p>
                        <p className="font-semibold text-slate-900">{req.quantity}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Deadline</p>
                        <p className="font-semibold text-slate-900">{daysUntilDeadline(req.deadline)}d left</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Bids</p>
                        <p className="font-semibold text-slate-900">{req.bids?.length || 0}</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Posted by: <span className="font-medium">{req.buyer?.name || 'Business'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">No {filter.toLowerCase()} offers available right now.</p>
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {tab === 'bids' && (
        <div className="space-y-4">
          {myBids.length > 0 ? (
            <div className="space-y-3">
              {myBids.map((bid) => (
                <div key={bid._id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {bid.requirement?.title || 'Requirement'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Posted by: {bid.requirement?.buyer?.name || 'Business'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                        bid.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : bid.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : bid.status === 'WITHDRAWN'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
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
                        ₹{(bid.price / bid.requirement?.quantity || 1).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Posted</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Deadline</p>
                      <p className="font-semibold text-slate-900">
                        {daysUntilDeadline(bid.requirement?.deadline)}d left
                      </p>
                    </div>
                  </div>

                  {bid.notes && (
                    <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Your Notes:</p>
                      <p className="text-sm text-slate-700">{bid.notes}</p>
                    </div>
                  )}

                  {bid.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdrawBid(bid._id)}
                      className="w-full px-4 py-2 text-red-600 border border-red-300 hover:bg-red-50 font-medium rounded-lg transition"
                    >
                      Withdraw Bid
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">You haven't submitted any bids yet. Browse offers to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Bid Form Modal - Shows when requirement is selected */}
      {selectedReq && !showBidForm && tab === 'marketplace' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900">{selectedReq.title}</h2>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 mb-4">{selectedReq.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-600">Budget</p>
                <p className="font-semibold text-slate-900">₹{selectedReq.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Qty</p>
                <p className="font-semibold text-slate-900">{selectedReq.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Deadline</p>
                <p className="font-semibold text-slate-900">{daysUntilDeadline(selectedReq.deadline)}d</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Posted by</p>
                <p className="font-semibold text-slate-900">{selectedReq.buyer?.name || 'Business'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBidForm(true)}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
              >
                Submit Bid
              </button>
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Submission Form */}
      {showBidForm && selectedReq && tab === 'marketplace' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Submit Bid for "{selectedReq.title}"</h2>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Bid Price (₹) / Unit: ₹{selectedReq.quantity ? (bidData.price ? (bidData.price / selectedReq.quantity).toFixed(0) : 0) : 0}
                </label>
                <input
                  type="number"
                  value={bidData.price}
                  onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                  placeholder={`≤ ₹${selectedReq.budget.toLocaleString()}`}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Timeline (days)</label>
                <input
                  type="number"
                  value={bidData.deliveryTimeDays}
                  onChange={(e) => setBidData({ ...bidData, deliveryTimeDays: e.target.value })}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={bidData.notes}
                  onChange={(e) => setBidData({ ...bidData, notes: e.target.value })}
                  placeholder="e.g., Premium quality, with warranty..."
                  rows="4"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition"
                >
                  {loading ? 'Submitting...' : 'Submit Bid'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBidForm(false);
                    setBidData({ price: '', deliveryTimeDays: '7', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

