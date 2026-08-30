import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    routeNo: '',
    name: '',
    fromCity: '',
    toCity: '',
    boardingPoints: '',
    droppingPoints: '',
    highwayRoute: 'E01 Southern Expressway',
    distanceKm: '120 km',
    tollFee: 500,
    status: 'Active',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/routes');
      setRoutes(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenModal = (r = null) => {
    setError('');
    setMessage('');
    if (r) {
      setEditingRoute(r);
      setFormData({
        routeNo: r.routeNo || '',
        name: r.name || '',
        fromCity: r.fromCity || '',
        toCity: r.toCity || '',
        boardingPoints: Array.isArray(r.boardingPoints) ? r.boardingPoints.join(', ') : r.boardingPoints || '',
        droppingPoints: Array.isArray(r.droppingPoints) ? r.droppingPoints.join(', ') : r.droppingPoints || '',
        highwayRoute: r.highwayRoute || 'E01 Southern Expressway',
        distanceKm: r.distanceKm || '120 km',
        tollFee: r.tollFee || 500,
        status: r.status || 'Active',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        routeNo: 'EX 1-1',
        name: 'Colombo - Galle Expressway',
        fromCity: 'Colombo (Makumbura Multimodal Center)',
        toCity: 'Galle (Kaduwela - Galle Intercity)',
        boardingPoints: 'Makumbura, Kottawa Highway Entrance',
        droppingPoints: 'Pinnaduwa Interchange, Galle Bus Stand',
        highwayRoute: 'E01 Southern Expressway',
        distanceKm: '116 km',
        tollFee: 500,
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
      boardingPoints: formData.boardingPoints.split(',').map((p) => p.trim()).filter(Boolean),
      droppingPoints: formData.droppingPoints.split(',').map((p) => p.trim()).filter(Boolean),
    };

    try {
      if (editingRoute) {
        const res = await axios.patch(`/api/admin/routes/${editingRoute._id}`, payload);
        setMessage(res.data.message);
      } else {
        const res = await axios.post('/api/admin/routes', payload);
        setMessage(res.data.message);
      }
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this highway route record?')) return;
    try {
      const res = await axios.delete(`/api/admin/routes/${id}`);
      setMessage(res.data.message);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Route No', accessor: 'routeNo' },
    { header: 'Route Name', accessor: 'name' },
    { header: 'Origin City', accessor: 'fromCity' },
    { header: 'Destination City', accessor: 'toCity' },
    { header: 'Highway Route', accessor: 'highwayRoute' },
    { header: 'Distance', accessor: 'distanceKm' },
    { header: 'Toll Fee', render: (row) => `LKR ${row.tollFee}` },
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
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Expressway Route Management</h2>
          <p className="text-xs text-slate-400">Configure expressway transit corridors, boarding/dropping points & tolls</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add New Route
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
          <div className="py-12 text-center text-slate-400 text-sm">Loading routes...</div>
        ) : (
          <DataTable
            columns={columns}
            data={routes}
            searchPlaceholder="Search route number, cities, highway..."
            filename="lankaexpressway_routes.csv"
          />
        )}
      </div>

      {/* Add / Edit Route Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoute ? `Edit Route: ${editingRoute.routeNo}` : 'Create New Expressway Route'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Route Number</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="e.g. EX 1-1"
                value={formData.routeNo}
                onChange={(e) => setFormData({ ...formData, routeNo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Route Name</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="Colombo - Galle Expressway"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">From City (Origin)</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="Colombo (Makumbura)"
                value={formData.fromCity}
                onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">To City (Destination)</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="Galle (Bus Stand)"
                value={formData.toCity}
                onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Boarding Points (Comma Separated)</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="Makumbura MMC, Kottawa Interchange"
                value={formData.boardingPoints}
                onChange={(e) => setFormData({ ...formData, boardingPoints: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dropping Points (Comma Separated)</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="Pinnaduwa Interchange, Galle Main Stand"
                value={formData.droppingPoints}
                onChange={(e) => setFormData({ ...formData, droppingPoints: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Highway Name</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="E01 Southern Expressway"
                value={formData.highwayRoute}
                onChange={(e) => setFormData({ ...formData, highwayRoute: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Distance</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="116 km"
                value={formData.distanceKm}
                onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                className="input-control text-xs"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary text-xs" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              {editingRoute ? 'Save Changes' : 'Create Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
