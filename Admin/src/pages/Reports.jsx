import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Download, Calendar, RefreshCw, DollarSign, Wallet, RotateCcw, Clock } from 'lucide-react';

export const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reports', {
        params: { startDate, endDate },
      });
      setReportData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportReportCSV = () => {
    if (!reportData) return;
    const summary = reportData.summary;

    const rows = [
      ['Metric', 'Value'],
      ['Total Reservations', summary.totalBookings],
      ['Active Valid Bookings', summary.activeBookingsCount],
      ['Ticket Revenue (LKR)', summary.totalTicketRevenue],
      ['Wallet Top-Up Deposits (LKR)', summary.totalWalletTopUps],
      ['Refunds Issued (LKR)', summary.totalRefunds],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lankaexpressway_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportData?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Executive Analytics & Reports</h2>
          <p className="text-xs text-slate-400">Generate ticket sales, revenue separation & travel time distribution reports</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="bg-transparent text-slate-200 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              className="bg-transparent text-slate-200 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReports} className="btn btn-primary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Filter
          </button>
          <button onClick={exportReportCSV} className="btn btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Financial Metrics Split */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card kpi-card emerald p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">LKR {(summary.totalTicketRevenue || 0).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Direct Bus Ticket Sales</span>
        </div>

        <div className="glass-card kpi-card purple p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet Top-Up Deposits</span>
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400">LKR {(summary.totalWalletTopUps || 0).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Separated from Ticket Revenue</span>
        </div>

        <div className="glass-card kpi-card amber p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refunds Issued</span>
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">LKR {(summary.totalRefunds || 0).toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Total Booking Refunds</span>
        </div>
      </div>

      {/* Popular Travel Times Table */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Popular Departure Travel Times
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Generating report analytics...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Departure Time</th>
                  <th>Booking Volume</th>
                  <th>Popularity Rank</th>
                </tr>
              </thead>
              <tbody>
                {(reportData?.popularTravelTimes || []).map((t, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-200">{t.time}</td>
                    <td className="text-blue-400 font-bold">{t.count} Passengers</td>
                    <td>
                      <span className="badge badge-active">Rank #{idx + 1}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
