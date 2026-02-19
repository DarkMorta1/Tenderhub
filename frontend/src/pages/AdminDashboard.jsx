import React, { useEffect, useState } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { api } from '../utils/apiClient.js';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterKyc, setFilterKyc] = useState('');

  useEffect(() => {
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'vendors') fetchVendors();
    if (tab === 'kyc') fetchPendingKyc();
  }, [tab, filterRole, filterKyc]);

  const fetchAnalytics = async () => {
    try {
      const data = await api.get('/admin/analytics', token);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
    }
  };

  const fetchVendors = async () => {
    try {
      const params = [];
      if (filterRole) params.push(`role=${filterRole}`);
      const query = params.length ? '?' + params.join('&') : '';
      const data = await api.get(`/admin/users${query}`, token);
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load vendors');
    }
  };

  const fetchPendingKyc = async () => {
    try {
      const params = [];
      if (filterKyc) params.push(`status=${filterKyc}`);
      const query = params.length ? '?' + params.join('&') : '';
      const data = await api.get(`/admin/kyc/pending${query}`, token);
      setKycRecords(data.kycRecords || data.items || []);
    } catch (err) {
      setError('Failed to load KYC records');
    }
  };

  const handleApproveVendor = async (userId) => {
    if (!window.confirm('Approve this vendor?')) return;
    try {
      await api.post(`/admin/vendors/${userId}/approve`, {}, token);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isApprovedVendor: true } : u)));
    } catch (err) {
      setError('Failed to approve vendor');
    }
  };

  const handleRejectKyc = async (kycId) => {
    const remarks = window.prompt('Enter rejection remarks:');
    if (!remarks) return;
    try {
      await api.post(`/admin/kyc/${kycId}/reject`, { remarks }, token);
      await fetchPendingKyc();
    } catch (err) {
      setError('Failed to reject KYC');
    }
  };

  const handleApproveKyc = async (kycId) => {
    if (!window.confirm('Approve this KYC?')) return;
    try {
      await api.post(`/admin/kyc/${kycId}/approve`, {}, token);
      await fetchPendingKyc();
    } catch (err) {
      setError('Failed to approve KYC');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.post(`/admin/users/${userId}/deactivate`, {}, token);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      setError('Failed to deactivate user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform management and oversight</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {['analytics', 'vendors', 'kyc', 'audit'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-xs uppercase text-slate-600 font-medium mb-2">Total Users</div>
                <div className="text-3xl font-bold text-slate-900">{analytics.totalUsers || 0}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-xs uppercase text-slate-600 font-medium mb-2">Vendors</div>
                <div className="text-3xl font-bold text-slate-900">{analytics.vendors || 0}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-xs uppercase text-slate-600 font-medium mb-2">Business Owners</div>
                <div className="text-3xl font-bold text-slate-900">{analytics.buyers || 0}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-xs uppercase text-slate-600 font-medium mb-2">Total Requirements</div>
                <div className="text-3xl font-bold text-slate-900">{analytics.requirements || 0}</div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Loading analytics...</p>
          )}
        </div>
      )}

      {/* Vendors Tab */}
      {tab === 'vendors' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['', 'VENDOR', 'BUYER'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === role
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-primary-300'
                }`}
              >
                {role ? role : 'All Users'}
              </button>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">KYC Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Vendor Approved</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Joined</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'VENDOR'
                                ? 'bg-orange-100 text-orange-800'
                                : user.role === 'BUYER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              user.kycStatus === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : user.kycStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.kycStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {user.kycStatus || 'NOT_SUBMITTED'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              user.isApprovedVendor
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {user.isApprovedVendor ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {user.role === 'VENDOR' && !user.isApprovedVendor && (
                            <button
                              onClick={() => handleApproveVendor(user._id)}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded font-medium text-xs transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeactivateUser(user._id)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium text-xs transition"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {tab === 'kyc' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterKyc(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterKyc === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-primary-300'
                }`}
              >
                {status || 'All KYC'}
              </button>
            ))}
          </div>

          {/* KYC Records */}
          <div className="space-y-4">
            {kycRecords.length > 0 ? (
              kycRecords.map((kyc) => (
                <div
                  key={kyc._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {kyc.user?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-slate-600">{kyc.user?.email}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        kyc.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : kyc.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {kyc.status}
                    </span>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Documents:</p>
                    {kyc.documents && kyc.documents.length > 0 ? (
                      <ul className="text-sm text-slate-700 space-y-1">
                        {kyc.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-primary-600">•</span>
                            {doc.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No documents submitted</p>
                    )}
                  </div>

                  {kyc.adminRemarks && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Admin Remarks:</p>
                      <p className="text-sm text-slate-700">{kyc.adminRemarks}</p>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 mb-4">
                    Submitted: {new Date(kyc.createdAt).toLocaleString()}
                  </div>

                  {kyc.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveKyc(kyc._id)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => handleRejectKyc(kyc._id)}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                      >
                        Reject KYC
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No KYC records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {tab === 'audit' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Audit Logs</h2>
          <p className="text-slate-600">
            Audit logging feature under development. This section will show all admin activities.
          </p>
        </div>
      )}
    </div>
  );
};

