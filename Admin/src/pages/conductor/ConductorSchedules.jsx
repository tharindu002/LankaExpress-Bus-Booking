import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Clock, Ticket, UserCheck, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { ConductorLayout } from '../../components/ConductorLayout';

export function ConductorSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getConductorSchedules();
      if (Array.isArray(res)) {
        setSchedules(res);
      } else if (res && res.data) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load assigned schedules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConductorLayout title="My Assigned Schedules">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-400" />
            <span>Assigned Operating Trips</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Schedules assigned to your conductor ID</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 glass-card text-slate-400 text-xs font-semibold">
          No schedules currently assigned to your account. Contact system administrator.
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((sched) => (
            <div key={sched.scheduleId} className="glass-card p-5 space-y-4 hover:border-slate-700 transition">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <span className="font-mono font-black text-emerald-400 text-sm">{sched.scheduleId}</span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {sched.route ? `${sched.route.from} ➔ ${sched.route.to}` : sched.routeId}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase rounded-md">
                    {sched.operatingDays || 'Daily'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bus Plate</span>
                  <strong className="text-slate-100">
                    {sched.bus?.registrationNumber || sched.busId}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{sched.bus?.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Departure</span>
                  <strong className="text-slate-100">{sched.departureTime}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Arrival</span>
                  <strong className="text-slate-100">{sched.arrivalTime}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Booked / Boarded</span>
                  <strong className="text-emerald-400 font-black">
                    {sched.boardedCount || 0} / {sched.bookedSeatsCount || 0} Boarded
                  </strong>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-800/60 pt-3">
                <Link
                  to={`/conductor/bookings?scheduleId=${sched.scheduleId}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  <span>Passenger Manifest</span>
                </Link>

                <Link
                  to="/conductor/scan"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Scan Ticket</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </ConductorLayout>
  );
}
