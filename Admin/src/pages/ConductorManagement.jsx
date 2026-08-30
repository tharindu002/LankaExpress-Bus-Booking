import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Plus, Search, ShieldCheck, Mail, Phone, Calendar, Bus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function ConductorManagement() {
  const [conductors, setConductors] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    password: '',
    assignedBuses: [],
    conductorPermissions: {
      maxBusesAllowed: 2,
      canScanQR: true,
      canIssueTickets: true,
      canCancelBoarding: true,
    },
  });

  const [submitMsg, setSubmitMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');

  useEffect(() => {
    fetchConductorsAndBuses();
  }, []);

  const fetchConductorsAndBuses = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, bRes] = await Promise.all([api.getConductors(), api.getBuses()]);
      
      if (Array.isArray(cRes)) {
        setConductors(cRes);
      } else if (cRes && cRes.data) {
        setConductors(cRes.data);
      }

      if (Array.isArray(bRes)) {
        setBuses(bRes);
      } else if (bRes && bRes.data) {
        setBuses(bRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch conductors/buses:', err);
      setError('Failed to load conductor & bus datasets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConductors = fetchConductorsAndBuses;

  const handleCreateConductor = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitErr('');

    try {
      const res = await api.createConductor(formData);
      if (res && res.success) {
        setSubmitMsg('Conductor account created successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          employeeId: '',
          password: '',
          assignedBuses: [],
          conductorPermissions: {
            maxBusesAllowed: 2,
            canScanQR: true,
            canIssueTickets: true,
            canCancelBoarding: true,
          },
        });
        setShowAddModal(false);
        fetchConductors();
      } else {
        setSubmitErr(res?.error || res?.message || 'Failed to create conductor');
      }
    } catch (err) {
      setSubmitErr(err.response?.data?.message || err.response?.data?.error || 'Server error occurred');
    }
  };

  const handleUpdateConductor = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitErr('');

    try {
      const res = await api.updateConductor(selectedConductor._id || selectedConductor.id, formData);
      if (res && (res.success || res._id)) {
        setShowEditModal(false);
        fetchConductors();
      } else {
        setSubmitErr(res?.error || res?.message || 'Failed to update conductor');
      }
    } catch (err) {
      setSubmitErr(err.response?.data?.message || err.response?.data?.error || 'Server error');
    }
  };

  const handleToggleStatus = async (conductor) => {
    const newStatus = conductor.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.updateConductorStatus(conductor._id || conductor.id, newStatus);
      fetchConductors();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (c) => {
    setSelectedConductor(c);
    setFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      employeeId: c.employeeId || c.userId || '',
      password: '', // Blank unless changing
      assignedBuses: c.assignedBuses || [],
      conductorPermissions: c.conductorPermissions || {
        maxBusesAllowed: 2,
        canScanQR: true,
        canIssueTickets: true,
        canCancelBoarding: true,
      },
    });
    setShowEditModal(true);
  };

  const toggleBusAssignment = (busId) => {
    const current = formData.assignedBuses || [];
    if (current.includes(busId)) {
      setFormData({
        ...formData,
        assignedBuses: current.filter((b) => b !== busId),
      });
    } else {
      setFormData({
        ...formData,
        assignedBuses: [...current, busId],
      });
    }
  };

  const filteredConductors = conductors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.employeeId && c.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>Conductor Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, manage and monitor bus conductor accounts and schedule assignments
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', employeeId: '', password: '' });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Conductor</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, employee ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control pl-9 text-xs py-2.5 w-full"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control text-xs py-2 px-3 w-full sm:w-auto"
          >
            <option value="ALL">All Conductors</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Conductors Table */}
      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading conductors...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : filteredConductors.length === 0 ? (
        <div className="text-center py-12 glass-card text-slate-400 text-xs font-semibold">
          No conductors found matching your criteria.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="p-4">Conductor Info</th>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Authorized Buses</th>
                  <th className="p-4">Assigned Schedules</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredConductors.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-extrabold text-emerald-400">
                      {c.employeeId || c.userId || 'N/A'}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    {/* Authorized Buses Access */}
                    <td className="p-4">
                      {c.assignedBuses && c.assignedBuses.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.assignedBuses.map((busId) => {
                            const foundBus = buses.find((b) => b.busId === busId || b.busNo === busId);
                            return (
                              <span
                                key={busId}
                                className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold"
                              >
                                {foundBus ? `${foundBus.busId} (${foundBus.name || foundBus.busNo})` : busId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No specific bus assigned</span>
                      )}
                    </td>

                    <td className="p-4">
                      {c.assignedSchedules && c.assignedSchedules.length > 0 ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <Bus className="w-3 h-3" />
                            {c.assignedSchedules.length} Assigned Schedule(s)
                          </span>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {c.assignedSchedules.map((s) => s.scheduleId).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No schedule assigned</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          c.status === 'Active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] transition cursor-pointer"
                        >
                          Edit & Access
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                            c.status === 'Active'
                              ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {c.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Conductor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Create Conductor & Configure Access</span>
            </h3>

            {submitErr && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {submitErr}
              </div>
            )}

            <form onSubmit={handleCreateConductor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nimal Perera"
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
                  placeholder="conductor@lankaexpressway.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-101"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="input-control py-2.5 w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-control py-2.5 w-full"
                  />
                </div>
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

              {/* Multi-Bus Handling Access Selector */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-slate-200 font-extrabold uppercase text-[11px]">
                  Authorize Bus Fleet Access (Multi-Bus Handling)
                </label>
                <p className="text-[10px] text-slate-400">
                  Select which bus(es) this conductor is authorized to operate (e.g. 1 bus, 2 buses, etc.)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                  {buses.map((bus) => {
                    const isAssigned = formData.assignedBuses?.includes(bus.busId);
                    return (
                      <div
                        key={bus._id || bus.busId}
                        onClick={() => toggleBusAssignment(bus.busId)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          isAssigned
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold block text-xs">{bus.busId}</span>
                          <span className="text-[10px] block truncate">{bus.name} ({bus.busNo})</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="accent-emerald-500 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Save Conductor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Conductor */}
      {showEditModal && selectedConductor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Configure Conductor & Multi-Bus Access ({selectedConductor.name})</span>
            </h3>

            {submitErr && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {submitErr}
              </div>
            )}

            <form onSubmit={handleUpdateConductor} className="space-y-3 text-xs">
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
                <label className="block text-slate-300 font-bold mb-1">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="input-control py-2.5 w-full opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="input-control py-2.5 w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-control py-2.5 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="Optional new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-control py-2.5 w-full"
                />
              </div>

              {/* Multi-Bus Access Selector */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-slate-200 font-extrabold uppercase text-[11px]">
                  Authorized Bus Fleet Access (Multi-Bus Handling)
                </label>
                <p className="text-[10px] text-slate-400">
                  Select which bus(es) this conductor is authorized to operate (e.g. 1 bus, 2 buses, etc.)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  {buses.map((bus) => {
                    const isAssigned = formData.assignedBuses?.includes(bus.busId);
                    return (
                      <div
                        key={bus._id || bus.busId}
                        onClick={() => toggleBusAssignment(bus.busId)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          isAssigned
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold block text-xs">{bus.busId}</span>
                          <span className="text-[10px] block truncate">{bus.name} ({bus.busNo})</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="accent-emerald-500 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Update Conductor Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
