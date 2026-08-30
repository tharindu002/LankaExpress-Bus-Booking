import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ticket, Search, UserCheck, Clock, XCircle, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { ConductorLayout } from '../../components/ConductorLayout';

export function ConductorBookings() {
  const [searchParams] = useSearchParams();
  const scheduleParam = searchParams.get('scheduleId') || '';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [scheduleParam, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getConductorBookings(scheduleParam, statusFilter);
      if (Array.isArray(res)) {
        setBookings(res);
      } else if (res && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load passenger bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualBoarding = async (b) => {
    setActionLoading(b.bookingRef);
    setActionMsg('');
    try {
      const res = await api.boardPassenger(b._id || b.bookingRef);
      if (res && res.success) {
        setActionMsg(res.message);
        fetchBookings();
      } else {
        alert(res?.error || res?.message || 'Failed to mark as boarded');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Server error');
    } finally {
      setActionLoading('');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.bookingRef.toLowerCase().includes(q) ||
      b.passengerName.toLowerCase().includes(q) ||
      b.passengerPhone.includes(q) ||
      (b.seats && b.seats.join(',').toLowerCase().includes(q))
    );
  });

  return (
    <ConductorLayout title="Schedule Bookings">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-400" />
            <span>Passenger Bookings & Boarding Manifest</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {scheduleParam ? `Filtered for Schedule: ${scheduleParam}` : 'Showing bookings across assigned trips'}
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {['ALL', 'Paid', 'Pending', 'Boarded', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Bookings' : st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reference, passenger name, seat number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control pl-9 text-xs py-2.5 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 glass-card text-slate-400 text-xs font-semibold">
          No passenger bookings found matching filter.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="p-4">Ref & Passenger</th>
                  <th className="p-4">Seat(s)</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Boarding Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredBookings.map((b) => (
                  <tr key={b.bookingRef} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-extrabold text-emerald-400">{b.bookingRef}</div>
                      <div className="font-bold text-slate-100 text-xs mt-0.5">{b.passengerName}</div>
                      <div className="text-[10px] text-slate-400">Schedule: {b.scheduleId}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.map((seat) => (
                          <span
                            key={seat}
                            className="px-2 py-0.5 bg-slate-800 text-emerald-300 font-extrabold text-xs rounded border border-slate-700"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{b.passengerPhone}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          b.paymentStatus === 'Paid'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          b.boardingStatus === 'Boarded'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {b.boardingStatus === 'Boarded' ? 'BOARDED' : b.status === 'Cancelled' ? 'CANCELLED' : 'PENDING'}
                      </span>
                      {b.boardedAt && (
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {new Date(b.boardedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {b.boardingStatus !== 'Boarded' && b.status === 'Active' && (
                        <button
                          onClick={() => handleManualBoarding(b)}
                          disabled={actionLoading === b.bookingRef}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          {actionLoading === b.bookingRef ? 'Marking...' : 'Mark Boarded'}
                        </button>
                      )}
                      {b.boardingStatus === 'Boarded' && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Boarded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ConductorLayout>
  );
}
