import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

export const OperatorManagement = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    website: '',
    operatorType: 'Private',
    serviceCategory: 'Super Luxury',
    status: 'Active',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/operators');
      setOperators(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleOpenModal = (op = null) => {
    setError('');
    setMessage('');
    if (op) {
      setEditingOperator(op);
      setFormData({
        name: op.name || '',
        contactNumber: op.contactNumber || '',
        email: op.email || '',
        website: op.website || '',
        operatorType: op.operatorType || 'Private',
        serviceCategory: op.serviceCategory || 'Super Luxury',
        status: op.status || 'Active',
      });
    } else {
      setEditingOperator(null);
      setFormData({
        name: '',
        contactNumber: '+94 11 200 0000',
        email: 'contact@operator.lk',
        website: 'https://operator.lk',
        operatorType: 'Private',
        serviceCategory: 'Super Luxury',
        status: 'Active',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingOperator) {
        const res = await axios.patch(`/api/admin/operators/${editingOperator._id}`, formData);
        setMessage(res.data.message);
      } else {
        const res = await axios.post('/api/admin/operators', formData);
        setMessage(res.data.message);
      }
      setModalOpen(false);
      fetchOperators();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus operator record?')) return;
    try {
      const res = await axios.delete(`/api/admin/operators/${id}`);
      setMessage(res.data.message);
      fetchOperators();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Operator ID', accessor: 'operatorId' },
    { header: 'Operator Name', accessor: 'name' },
    { header: 'Contact Phone', accessor: 'contactNumber' },
    { header: 'Email', accessor: 'email' },
    { header: 'Type', render: (row) => <StatusBadge status={row.operatorType} /> },
    { header: 'Category', render: (row) => <StatusBadge status={row.serviceCategory} /> },
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
    <div className="space-y-8 w-full">
      <div className="admin-page-header">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Bus Operator Management</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage private & public transport operating companies across all expressway routes</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-lg shadow-emerald-950/40">
          <Plus className="w-4 h-4" /> Add New Operator
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
          <div className="py-12 text-center text-slate-400 text-sm">Loading operators list...</div>
        ) : (
          <DataTable
            columns={columns}
            data={operators}
            searchPlaceholder="Search operator name, ID, phone..."
            filename="lankaexpressway_operators.csv"
          />
        )}
      </div>

      {/* Add / Edit Operator Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOperator ? `Edit Operator: ${editingOperator.name}` : 'Create New Bus Operator'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Operator Name</label>
            <input
              type="text"
              required
              className="input-control text-xs"
              placeholder="e.g. Lanka Ashok Leyland Express"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Hotline</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="+94 11 200 0000"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="input-control text-xs"
                placeholder="contact@operator.lk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operator Type</label>
              <select
                className="input-control text-xs"
                value={formData.operatorType}
                onChange={(e) => setFormData({ ...formData, operatorType: e.target.value })}
              >
                <option value="Private">Private</option>
                <option value="Public">Public (SLTB)</option>
                <option value="Franchise">Franchise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Category</label>
              <select
                className="input-control text-xs"
                value={formData.serviceCategory}
                onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
              >
                <option value="Super Luxury">Super Luxury</option>
                <option value="Luxury">Luxury</option>
                <option value="Premium">Premium</option>
              </select>
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
              {editingOperator ? 'Save Changes' : 'Create Operator'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
