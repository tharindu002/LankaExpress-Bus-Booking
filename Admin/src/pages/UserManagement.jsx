import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Eye, ShieldAlert, ShieldCheck, Wallet, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  // Wallet Adjust Modal State
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [adjType, setAdjType] = useState('CREDIT');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    setActionError('');
    setActionSuccess('');
    const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';

    try {
      const res = await axios.patch(`/api/admin/users/${selectedUser._id}/status`, {
        status: newStatus,
        reason: statusReason || 'Admin administrative update',
      });
      setActionSuccess(res.data.message);
      setStatusModalOpen(false);
      setStatusReason('');
      fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleWalletAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionError('');
    setActionSuccess('');

    try {
      const res = await axios.post(`/api/admin/users/${selectedUser._id}/wallet-adjust`, {
        type: adjType,
        amount: adjAmount,
        reason: adjReason,
      });
      setActionSuccess(res.data.message);
      setWalletModalOpen(false);
      setAdjAmount('');
      setAdjReason('');
      fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Wallet adjustment failed');
    }
  };

  const columns = [
    { header: 'User ID', accessor: 'userId' },
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email Address', accessor: 'email' },
    { header: 'Phone Number', accessor: 'phone' },
    { header: 'Role', render: (row) => <StatusBadge status={row.role} /> },
    {
      header: 'Wallet Balance',
      render: (row) => (
        <span className="font-bold text-emerald-400">LKR {(row.walletBalance || 0).toLocaleString()}</span>
      ),
    },
    { header: 'Account Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/users/${row._id}`)}
            className="btn btn-secondary btn-xs"
            title="View User Details & History"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setWalletModalOpen(true);
            }}
            className="btn btn-primary btn-xs"
            title="Admin Wallet Adjustment"
          >
            <Wallet className="w-3.5 h-3.5" />
            Adjust
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setStatusModalOpen(true);
            }}
            className={`btn btn-xs ${row.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
            title={row.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
          >
            {row.status === 'Active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {row.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Passenger & User Management</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage registered passenger accounts, account statuses & wallet balances</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary text-xs py-2.5 px-4 shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh List</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
          {actionError}
        </div>
      )}

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading users list...</div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search by name, email, phone, user ID..."
            filename="lankaexpressway_users.pdf"
          />
        )}
      </div>

      {/* Account Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`${selectedUser?.status === 'Active' ? 'Suspend' : 'Activate'} Account: ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to change user <strong>{selectedUser?.name}</strong> status from{' '}
            <span className="font-bold">{selectedUser?.status}</span> to{' '}
            <span className="font-bold text-amber-400">
              {selectedUser?.status === 'Active' ? 'Suspended' : 'Active'}
            </span>
            ? This action will be recorded in the system Audit Log.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Status Change</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Terms violation / Support request"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn btn-secondary text-xs" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </button>
            <button
              className={`btn text-xs ${selectedUser?.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
              onClick={handleStatusToggle}
            >
              Confirm Status Change
            </button>
          </div>
        </div>
      </Modal>

      {/* Admin Wallet Adjustment Modal */}
      <Modal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title={`Admin Wallet Adjustment: ${selectedUser?.name}`}
      >
        <form onSubmit={handleWalletAdjustment} className="space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Wallet Balance:</span>
            <span className="font-bold text-emerald-400">LKR {(selectedUser?.walletBalance || 0).toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Type</label>
            <select
              className="input-control text-xs"
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
            >
              <option value="CREDIT">CREDIT (Add funds to wallet)</option>
              <option value="DEBIT">DEBIT (Deduct funds from wallet)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (LKR)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              className="input-control text-xs"
              placeholder="e.g. 1000.00"
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Reason / Notes</label>
            <textarea
              required
              rows="3"
              className="input-control text-xs"
              placeholder="Provide clear reason for auditing purposes (e.g. Compensation for bus delay)..."
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary text-xs" onClick={() => setWalletModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              Process Wallet Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
