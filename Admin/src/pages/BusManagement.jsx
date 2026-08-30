import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Bus } from 'lucide-react';

export const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    busNo: '',
    model: 'Volvo 9400 B11R',
    busType: 'Super Luxury AC',
    serviceCategory: 'Super Luxury',
    seatLayout: '2+2',
    totalSeats: 40,
    facilities: 'Air Conditioning, Reclining Seats, USB Charging',
    operatorId: '',
    status: 'Active',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busRes, opRes] = await Promise.all([
        axios.get('/api/admin/buses'),
        axios.get('/api/admin/operators'),
      ]);
      setBuses(busRes.data.data);
      setOperators(opRes.data.data);
      if (opRes.data.data.length > 0 && !formData.operatorId) {
        setFormData((prev) => ({ ...prev, operatorId: opRes.data.data[0].operatorId }));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (bus = null) => {
    setError('');
    setMessage('');
    if (bus) {
      setEditingBus(bus);
      setFormData({
        name: bus.name || '',
        busNo: bus.busNo || '',
        model: bus.model || '',
        busType: bus.busType || '',
        serviceCategory: bus.serviceCategory || 'Super Luxury',
        seatLayout: bus.seatLayout || '2+2',
        totalSeats: bus.totalSeats || 40,
        facilities: Array.isArray(bus.facilities) ? bus.facilities.join(', ') : bus.facilities || '',
        operatorId: bus.operatorId || (operators[0]?.operatorId || ''),
        status: bus.status || 'Active',
      });
    } else {
      setEditingBus(null);
      setFormData({
        name: '',
        busNo: '',
        model: 'Volvo 9400 B11R',
        busType: 'Super Luxury AC',
        serviceCategory: 'Super Luxury',
        seatLayout: '2+2',
        totalSeats: 40,
        facilities: 'Air Conditioning, Reclining Seats, USB Charging',
        operatorId: operators[0]?.operatorId || '',
        status: 'Active',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      ...formData,
      facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editingBus) {
        const res = await axios.patch(`/api/admin/buses/${editingBus._id}`, payload);
        setMessage(res.data.message);
      } else {
        const res = await axios.post('/api/admin/buses', payload);
        setMessage(res.data.message);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus record?')) return;
    try {
      const res = await axios.delete(`/api/admin/buses/${id}`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Bus ID', accessor: 'busId' },
    { header: 'Reg Number', accessor: 'busNo' },
    { header: 'Bus Name', accessor: 'name' },
    { header: 'Operator', render: (row) => row.operator?.name || row.operatorId },
    { header: 'Model', accessor: 'model' },
    { header: 'Bus Type', accessor: 'busType' },
    { header: 'Category', render: (row) => <StatusBadge status={row.serviceCategory} /> },
    { header: 'Layout', accessor: 'seatLayout' },
    { header: 'Total Seats', accessor: 'totalSeats' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(row)} className="btn btn-secondary btn-xs">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => handleDelete(row._id)} className="btn btn-danger btn-xs">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Bus Fleet Management</h2>
          <p className="text-xs text-slate-400">Configure buses, seat layouts, service categories & facilities</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add New Bus
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading buses fleet...</div>
        ) : (
          <DataTable
            columns={columns}
            data={buses}
            searchPlaceholder="Search bus name, reg number, model..."
            filename="lankaexpressway_buses.csv"
          />
        )}
      </div>

      {/* Add / Edit Bus Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBus ? `Edit Bus: ${editingBus.name}` : 'Create New Expressway Bus'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Name</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="e.g. Southern Super Line"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Number</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="e.g. NC-4589"
                value={formData.busNo}
                onChange={(e) => setFormData({ ...formData, busNo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Operator</label>
              <select
                className="input-control text-xs"
                value={formData.operatorId}
                onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
              >
                {operators.map((op) => (
                  <option key={op._id} value={op.operatorId}>
                    {op.name} ({op.operatorId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Model</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="e.g. Volvo 9400 B11R"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Type</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="Super Luxury AC"
                value={formData.busType}
                onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seat Layout</label>
              <select
                className="input-control text-xs"
                value={formData.seatLayout}
                onChange={(e) => setFormData({ ...formData, seatLayout: e.target.value })}
              >
                <option value="2+2">2+2 Layout</option>
                <option value="2+1">2+1 VIP Layout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Seats</label>
              <input
                type="number"
                required
                className="input-control text-xs"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Facilities (Comma Separated)</label>
            <input
              type="text"
              className="input-control text-xs"
              placeholder="Air Conditioning, Reclining Seats, USB Charging, WiFi"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Status</label>
            <select
              className="input-control text-xs"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary text-xs" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              {editingBus ? 'Save Changes' : 'Create Bus'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
