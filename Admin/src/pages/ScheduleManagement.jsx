import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, CalendarDays, Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    conductorId: '',
    departureTime: '08:00 AM',
    arrivalTime: '10:30 AM',
    duration: '2h 30m',
    operatingDays: 'Daily',
    fare: 840,
    status: 'Active',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, busRes, routeRes, condRes] = await Promise.all([
        axios.get('/api/admin/schedules'),
        axios.get('/api/admin/buses'),
        axios.get('/api/admin/routes'),
        axios.get('/api/admin/conductors'),
      ]);
      setSchedules(schedRes.data.data);
      setBuses(busRes.data.data);
      setRoutes(routeRes.data.data);
      setConductors(condRes.data.data || []);

      if (busRes.data.data.length > 0 && routeRes.data.data.length > 0 && !formData.busId) {
        setFormData((prev) => ({
          ...prev,
          busId: busRes.data.data[0].busId,
          routeId: routeRes.data.data[0].routeId,
        }));
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

  const handleOpenModal = (sched = null) => {
    setError('');
    setMessage('');
    if (sched) {
      setEditingSchedule(sched);
      setFormData({
        busId: sched.busId || (buses[0]?.busId || ''),
        routeId: sched.routeId || (routes[0]?.routeId || ''),
        conductorId: sched.conductorId || (sched.conductor?._id || ''),
        departureTime: sched.departureTime || '08:00 AM',
        arrivalTime: sched.arrivalTime || '10:30 AM',
        duration: sched.duration || '2h 30m',
        operatingDays: sched.operatingDays || 'Daily',
        fare: sched.fare || 840,
        status: sched.status || 'Active',
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        busId: buses[0]?.busId || '',
        routeId: routes[0]?.routeId || '',
        conductorId: conductors[0]?.userId || '',
        departureTime: '08:00 AM',
        arrivalTime: '10:30 AM',
        duration: '2h 30m',
        operatingDays: 'Daily',
        fare: 840,
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
      if (editingSchedule) {
        const res = await axios.patch(`/api/admin/schedules/${editingSchedule._id}`, formData);
        if (formData.conductorId) {
          await axios.post(`/api/admin/schedules/${editingSchedule._id}/assign-conductor`, { conductorId: formData.conductorId });
        }
        setMessage(res.data.message || 'Schedule updated');
      } else {
        const res = await axios.post('/api/admin/schedules', formData);
        if (formData.conductorId && res.data?.data?._id) {
          await axios.post(`/api/admin/schedules/${res.data.data._id}/assign-conductor`, { conductorId: formData.conductorId });
        }
        setMessage(res.data.message || 'Schedule created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus schedule record?')) return;
    try {
      const res = await axios.delete(`/api/admin/schedules/${id}`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Schedule ID', accessor: 'scheduleId' },
    {
      header: 'Bus Details',
      render: (row) => `${row.bus?.name || row.busId} (${row.bus?.seatLayout || '2+2'})`,
    },
    {
      header: 'Route Corridor',
      render: (row) => `${row.route?.routeNo || row.routeId} (${row.route?.fromCity || ''} ➔ ${row.route?.toCity || ''})`,
    },
    {
      header: 'Assigned Conductor',
      render: (row) => {
        const cond = conductors.find((c) => c._id === row.conductor || c.userId === row.conductorId || c.employeeId === row.conductorId);
        return cond ? (
          <span className="font-bold text-emerald-400">{cond.name} ({cond.employeeId || cond.userId})</span>
        ) : (
          <span className="text-slate-500 italic">Unassigned</span>
        );
      },
    },
    { header: 'Departure', accessor: 'departureTime' },
    { header: 'Arrival', accessor: 'arrivalTime' },
    { header: 'Operating Days', accessor: 'operatingDays' },
    {
      header: 'Ticket Fare',
      render: (row) => <span className="font-bold text-emerald-400">LKR {row.fare}</span>,
    },
    {
      header: 'Reserved Seats',
      render: (row) => (
        <span className="badge badge-pending">{(row.reservedSeats || []).length} Seats Booked</span>
      ),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/seats?scheduleId=${row.scheduleId}`)}
            className="btn btn-primary btn-xs"
            title="View Interactive Seat Map"
          >
            <Armchair className="w-3.5 h-3.5" /> Seats
          </button>
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
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Bus Schedule Management</h2>
          <p className="text-xs text-slate-400">Manage bus departure timetables, fares, operating days & seat availability</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-xs">
          <Plus className="w-4 h-4" /> Create New Schedule
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
          <div className="py-12 text-center text-slate-400 text-sm">Loading bus schedules...</div>
        ) : (
          <DataTable
            columns={columns}
            data={schedules}
            searchPlaceholder="Search schedule ID, bus name, departure time..."
            filename="lankaexpressway_schedules.csv"
          />
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSchedule ? `Edit Schedule: ${editingSchedule.scheduleId}` : 'Create New Bus Schedule'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Bus</label>
              <select
                className="input-control text-xs"
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              >
                {buses.map((b) => (
                  <option key={b._id} value={b.busId}>
                    {b.name} ({b.busNo || b.busId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Route</label>
              <select
                className="input-control text-xs"
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
              >
                {routes.map((r) => (
                  <option key={r._id} value={r.routeId}>
                    {r.routeNo}: {r.fromCity} ➔ {r.toCity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Conductor</label>
            <select
              className="input-control text-xs"
              value={formData.conductorId}
              onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
            >
              <option value="">-- Unassigned --</option>
              {conductors.map((c) => (
                <option key={c._id} value={c.userId || c._id}>
                  {c.name} ({c.employeeId || c.userId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departure Time</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="08:00 AM"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Arrival Time</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="10:30 AM"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
              <input
                type="text"
                required
                className="input-control text-xs"
                placeholder="2h 30m"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operating Days</label>
              <input
                type="text"
                className="input-control text-xs"
                placeholder="Daily / Mon-Fri"
                value={formData.operatingDays}
                onChange={(e) => setFormData({ ...formData, operatingDays: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ticket Fare (LKR)</label>
              <input
                type="number"
                required
                className="input-control text-xs"
                placeholder="840"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
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
              {editingSchedule ? 'Save Changes' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
