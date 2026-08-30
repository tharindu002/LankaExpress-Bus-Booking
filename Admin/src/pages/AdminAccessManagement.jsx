import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Mail, Phone, Lock, AlertCircle, CheckSquare, Square, UserCheck, Shield } from 'lucide-react';
import { api } from '../services/api';

const ALL_PERMISSIONS = [
  { key: 'manage_users', label: 'User & Passenger Management', desc: 'View passengers, update user statuses, adjust wallets' },
  { key: 'manage_buses', label: 'Bus Fleet & Operators', desc: 'Add/edit buses, operators, and seat layouts' },
  { key: 'manage_routes', label: 'Routes & Timetables', desc: 'Manage expressway routes and bus timetables' },
  { key: 'manage_conductors', label: 'Conductor & Multi-Bus Access', desc: 'Create conductors and set bus assignments & permissions' },
  { key: 'manage_bookings', label: 'Ticket Bookings', desc: 'Search, view, and manage passenger bookings' },
  { key: 'manage_finances', label: 'Finance & Wallets', desc: 'View wallet transactions, payments, and refunds' },
  { key: 'view_reports', label: 'Analytics & Reports', desc: 'Access revenue analytics and export reports' },
  { key: 'view_logs', label: 'System Audit Logs', desc: 'Inspect immutable system activity audit logs' },
];

export function AdminAccessManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
    adminPermissions: ALL_PERMISSIONS.map((p) => p.key),
  });

  const [submitErr, setSubmitErr] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdmins();
      if (res && res.success) {
        setAdmins(res.data);
      } else if (Array.isArray(res)) {
        setAdmins(res);
      }
    } catch (err) {
      console.error('Failed to fetch admin accounts:', err);
      setError('Failed to load admin user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitErr('');
    setSubmitMsg('');

    try {
      const res = await api.createAdmin(formData);
      if (res && (res.success || res.data)) {
        setSubmitMsg('Admin account created successfully!');
        setShowAddModal(false);
        fetchAdmins();
      } else {
        setSubmitErr(res?.message || 'Failed to create admin');
      }
    } catch (err) {
      setSubmitErr(err.response?.data?.message || err.response?.data?.error || 'Server error');
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    setSubmitErr('');
    setSubmitMsg('');

    try {
      const res = await api.updateAdminPermissions(selectedAdmin._id || selectedAdmin.id, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        adminPermissions: formData.adminPermissions,
        password: formData.password || undefined,
      });

      if (res && (res.success || res.data)) {
        setShowEditModal(false);
        fetchAdmins();
      } else {
        setSubmitErr(res?.message || 'Failed to update admin permissions');
      }
    } catch (err) {
      setSubmitErr(err.response?.data?.message || err.response?.data?.error || 'Server error');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '',
      role: admin.role || 'admin',
      adminPermissions: admin.adminPermissions || ALL_PERMISSIONS.map((p) => p.key),
    });
    setShowEditModal(true);
  };

  const togglePermission = (key) => {
    if (formData.adminPermissions.includes(key)) {
      setFormData({
        ...formData,
        adminPermissions: formData.adminPermissions.filter((p) => p !== key),
      });
    } else {
      setFormData({
        ...formData,
        adminPermissions: [...formData.adminPermissions, key],
      });
    }
  };

  const toggleAllPermissions = () => {
    if (formData.adminPermissions.length === ALL_PERMISSIONS.length) {
      setFormData({ ...formData, adminPermissions: [] });
    } else {
      setFormData({ ...formData, adminPermissions: ALL_PERMISSIONS.map((p) => p.key) });
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.userId && a.userId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <span>SuperAdmin Access Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grant, restrict, and customize system access module permissions for administrators
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              role: 'admin',
              adminPermissions: ALL_PERMISSIONS.map((p) => p.key),
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-950/50 flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Admin</span>
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search admins by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control pl-9 text-xs py-2.5 w-full"
          />
        </div>
      </div>

      {/* Admin Table */}
      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading administrator accounts...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="p-4">Admin Profile</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Granted Access Modules</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAdmins.map((a) => (
                  <tr key={a._id || a.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        {a.name}
                        {a.role === 'superadmin' && (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-500/40 text-[9px] font-black rounded uppercase">
                            SuperAdmin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{a.email}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-xs uppercase">
                      <span className={a.role === 'superadmin' ? 'text-amber-400' : 'text-slate-300'}>
                        {a.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {a.role === 'superadmin' ? (
                        <span className="px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                          Full SuperAdmin System Access (All Modules)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {(a.adminPermissions || []).map((permKey) => {
                            const found = ALL_PERMISSIONS.find((p) => p.key === permKey);
                            return (
                              <span
                                key={permKey}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700 font-semibold"
                              >
                                {found ? found.label : permKey}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          a.status === 'Active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {a.status || 'Active'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(a)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Create Administrator Account</span>
            </h3>

            {submitErr && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {submitErr}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supun Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@lankaexpressway.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-control py-2.5 w-full"
                >
                  <option value="admin">Standard Admin</option>
                  <option value="superadmin">SuperAdmin (Unrestricted Full Access)</option>
                </select>
              </div>

              {/* Module Permissions Checkbox list */}
              {formData.role === 'admin' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-200 font-extrabold uppercase text-[11px]">
                      Module Access Permissions
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllPermissions}
                      className="text-[11px] text-amber-400 font-bold hover:underline"
                    >
                      {formData.adminPermissions.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = formData.adminPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className="flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-200 block text-xs">{perm.label}</span>
                            <span className="text-[10px] text-slate-400 block">{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Save Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Admin Permissions */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Configure Admin Permissions ({selectedAdmin.name})</span>
            </h3>

            {submitErr && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {submitErr}
              </div>
            )}

            <form onSubmit={handleUpdatePermissions} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-control py-2.5 w-full"
                >
                  <option value="admin">Standard Admin</option>
                  <option value="superadmin">SuperAdmin (Unrestricted Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  New Password (Optional - leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Optional new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              {/* Module Permissions Checkbox list */}
              {formData.role === 'admin' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-200 font-extrabold uppercase text-[11px]">
                      Module Access Permissions
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllPermissions}
                      className="text-[11px] text-amber-400 font-bold hover:underline"
                    >
                      {formData.adminPermissions.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = formData.adminPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className="flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-200 block text-xs">{perm.label}</span>
                            <span className="text-[10px] text-slate-400 block">{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Update Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
