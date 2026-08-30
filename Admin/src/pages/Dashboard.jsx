import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Ticket,
  CalendarCheck,
  DollarSign,
  Bus,
  Clock,
  Ban,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/dashboard');
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-sm font-semibold shadow-lg">
        {error}
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-9">
      {/* Top Header Controls */}
      <div className="admin-page-header">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time intercity transit analytics & financial key metrics</p>
        </div>
        <button onClick={fetchDashboardStats} className="btn btn-secondary text-xs py-2.5 px-4 shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* KPI 1: Total Users */}
        <div className="glass-card kpi-card purple">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-100">{kpis.totalUsers || 0}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">Active Passenger Accounts</span>
        </div>

        {/* KPI 2: Total Bookings */}
        <div className="glass-card kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-100">{kpis.totalBookings || 0}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">Lifetime System Reservations</span>
        </div>

        {/* KPI 3: Today's Bookings */}
        <div className="glass-card kpi-card amber">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-100">{kpis.todaysBookings || 0}</p>
          <span className="text-xs text-amber-400 mt-2 block font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Live Daily Volume
          </span>
        </div>

        {/* KPI 4: Ticket Revenue */}
        <div className="glass-card kpi-card emerald">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Revenue</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400">LKR {(kpis.ticketRevenue || 0).toLocaleString()}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">From Active Ticket Sales</span>
        </div>

        {/* KPI 5: Active Buses */}
        <div className="glass-card kpi-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Buses</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-100">{kpis.activeBuses || 0}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">Fleet Operational</span>
        </div>

        {/* KPI 6: Pending Payments */}
        <div className="glass-card kpi-card amber">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payments</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-400">{kpis.pendingPayments || 0}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">Awaiting Gateway Confirmation</span>
        </div>

        {/* KPI 7: Cancelled Bookings */}
        <div className="glass-card kpi-card rose">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled Bookings</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-rose-400">{kpis.cancelledBookings || 0}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">Refunded to User Wallets</span>
        </div>

        {/* KPI 8: Wallet Top-Up Stats */}
        <div className="glass-card kpi-card purple">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Top-Ups</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-purple-400">LKR {(kpis.walletTopUpAmount || 0).toLocaleString()}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">
            {kpis.walletTopUpCount || 0} Total Top-Up Deposits
          </span>
        </div>
      </div>

      {/* Popular Routes Analytics */}
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Popular Expressway Routes Analytics</span>
        </h3>
        <div className="space-y-3.5">
          {(data?.popularRoutes || []).map((route, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900/70 hover:bg-slate-900/90 rounded-xl border border-slate-800 transition">
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  #{i + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{route.routeName}</h4>
                  <span className="text-xs text-slate-400">Route No: {route.routeNo}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-400">LKR {route.revenue.toLocaleString()}</p>
                <span className="text-xs text-slate-400 font-medium">{route.bookingCount} Bookings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings & Recent Payments Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Recent Bookings */}
        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-5 flex items-center justify-between">
            <span>Recent Ticket Bookings</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {(data?.recentBookings || []).map((b) => (
              <div key={b._id} className="flex items-center justify-between p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-200">{b.bookingRef}</p>
                  <p className="text-slate-400 mt-0.5">{b.passengerName} ({b.seats.join(', ')})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200 mb-1">LKR {b.totalAmount}</p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-5 flex items-center justify-between">
            <span>Recent PayHere & Wallet Transactions</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {(data?.recentPayments || []).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-200">{p.reason}</p>
                  <p className="text-slate-400 mt-0.5">{p.userId?.name || p.userStrId}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold mb-1 ${p.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.type === 'CREDIT' ? '+' : '-'} LKR {p.amount}
                  </p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
