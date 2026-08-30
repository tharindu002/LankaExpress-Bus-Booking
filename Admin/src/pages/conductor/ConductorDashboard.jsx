import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Ticket, Bus, UserCheck, Clock, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { ConductorLayout } from '../../components/ConductorLayout';

export function ConductorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getConductorDashboard();
      if (res && res.success) {
        setData(res);
      } else {
        setData(res);
      }
    } catch (err) {
      console.error('Conductor dashboard load error:', err);
      setError('Failed to load conductor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const activeSchedule = data?.activeSchedule;
  const stats = data?.stats || {
    totalBookings: 0,
    paidBookings: 0,
    boardedCount: 0,
    pendingBoardingCount: 0,
    cancelledCount: 0,
  };

  return (
    <ConductorLayout title="Conductor Dashboard">
      {/* Greeting Banner */}
      <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
            TODAY'S OPERATING SHIFT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5">
            Good Day, {data?.conductor?.name || 'Conductor'}!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Employee ID: <strong className="text-emerald-400 font-mono">{data?.conductor?.employeeId}</strong>
          </p>
        </div>

        {/* Quick Action Large Scan Button */}
        <Link
          to="/conductor/scan"
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <QrCode className="w-5 h-5" />
          <span>Scan QR Ticket</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading assigned trip data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Assigned Schedule Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-400" />
                <span>Today's Assigned Bus Schedule</span>
              </h3>
              {activeSchedule && (
                <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-md uppercase">
                  Active Shift
                </span>
              )}
            </div>

            {activeSchedule ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-emerald-400 text-lg">{activeSchedule.scheduleId}</span>
                    <span className="text-xs font-bold text-slate-300">
                      • {activeSchedule.route ? `${activeSchedule.route.from} ➔ ${activeSchedule.route.to}` : activeSchedule.routeId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Bus Number</span>
                      <strong className="text-slate-100">
                        {activeSchedule.bus?.registrationNumber || activeSchedule.busId || 'N/A'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">{activeSchedule.bus?.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Departure / Arrival</span>
                      <strong className="text-slate-100">
                        {activeSchedule.departureTime} - {activeSchedule.arrivalTime}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 justify-center">
                  <Link
                    to={`/conductor/bookings?scheduleId=${activeSchedule.scheduleId}`}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <Ticket className="w-4 h-4 text-emerald-400" />
                    <span>View Schedule Bookings</span>
                  </Link>

                  <Link
                    to="/conductor/scan"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Verify QR Ticket</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No schedule currently assigned for today. Contact system admin to assign trips.
              </div>
            )}
          </div>

          {/* Booking Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Bookings</span>
              <strong className="text-xl font-black text-slate-100 mt-1 block">{stats.totalBookings}</strong>
            </div>

            <div className="glass-card p-4 text-center bg-emerald-950/20 border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">Boarded</span>
              <strong className="text-xl font-black text-emerald-400 mt-1 block">{stats.boardedCount}</strong>
            </div>

            <div className="glass-card p-4 text-center bg-amber-950/20 border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Pending Boarding</span>
              <strong className="text-xl font-black text-amber-400 mt-1 block">{stats.pendingBoardingCount}</strong>
            </div>

            <div className="glass-card p-4 text-center bg-rose-950/20 border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase block">Cancelled</span>
              <strong className="text-xl font-black text-rose-400 mt-1 block">{stats.cancelledCount}</strong>
            </div>
          </div>
        </>
      )}
    </ConductorLayout>
  );
}
