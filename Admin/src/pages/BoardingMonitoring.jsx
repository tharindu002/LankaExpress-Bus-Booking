import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bus, UserCheck, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export function BoardingMonitoring() {
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoardingData();
    const interval = setInterval(fetchBoardingData, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchBoardingData = async () => {
    try {
      const res = await api.getBoardingMonitoring();
      if (res && res.data) {
        setMonitoringData(res.data);
      } else if (Array.isArray(res)) {
        setMonitoringData(res);
      }
    } catch (err) {
      console.error('Error fetching boarding monitoring:', err);
      setError('Failed to refresh boarding statistics.');
    } finally {
      setLoading(false);
    }
  };

  const totalBookingsAll = monitoringData.reduce((sum, item) => sum + (item.totalBookings || 0), 0);
  const totalBoardedAll = monitoringData.reduce((sum, item) => sum + (item.boarded || 0), 0);
  const totalPendingAll = monitoringData.reduce((sum, item) => sum + (item.pending || 0), 0);

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            <span>Real-Time Boarding Operations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live monitor of passenger check-ins, conductor verification activity, and trip capacity
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchBoardingData();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Feeds</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Booked Passengers</span>
            <strong className="text-2xl font-black text-slate-100 mt-1 block">{totalBookingsAll}</strong>
          </div>
          <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-2xl">
            <Bus className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified & Boarded</span>
            <strong className="text-2xl font-black text-emerald-400 mt-1 block">{totalBoardedAll}</strong>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Boarding</span>
            <strong className="text-2xl font-black text-amber-400 mt-1 block">{totalPendingAll}</strong>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-2xl">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Schedule Monitoring Cards */}
      {loading && monitoringData.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading real-time schedule feeds...</p>
        </div>
      ) : monitoringData.length === 0 ? (
        <div className="text-center py-12 glass-card text-slate-400 text-xs">
          No active schedules found for boarding monitoring.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monitoringData.map((item) => {
            const boardingPercentage =
              item.paidBookings > 0 ? Math.round((item.boarded / item.paidBookings) * 100) : 0;

            return (
              <div key={item.scheduleId} className="glass-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">{item.scheduleId}</span>
                      <span className="text-xs text-slate-400 font-bold">• {item.departureTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{item.routeName}</h3>
                    <p className="text-xs text-slate-400">
                      Bus: <strong className="text-slate-200">{item.busName}</strong> ({item.busRegNo})
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Conductor</span>
                    {item.conductor ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        {item.conductor.name} ({item.conductor.employeeId})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Boarding Progress</span>
                    <span className="text-emerald-400">{boardingPercentage}% Check-in Completed</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden flex border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${boardingPercentage}%` }}
                    ></div>
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{
                        width: `${item.paidBookings > 0 ? Math.round((item.pending / item.paidBookings) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Statistics grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                    <strong className="text-slate-100 text-sm font-extrabold">{item.totalBookings}</strong>
                  </div>
                  <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-300">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">Boarded</span>
                    <strong className="text-sm font-extrabold">{item.boarded}</strong>
                  </div>
                  <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 text-amber-300">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">Pending</span>
                    <strong className="text-sm font-extrabold">{item.pending}</strong>
                  </div>
                  <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30 text-rose-300">
                    <span className="text-[10px] text-rose-400 font-bold uppercase block">Cancelled</span>
                    <strong className="text-sm font-extrabold">{item.cancelled}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
