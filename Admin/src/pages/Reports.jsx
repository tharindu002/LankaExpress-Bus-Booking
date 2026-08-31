import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Download, Calendar, RefreshCw, DollarSign, Wallet, RotateCcw, Clock, Printer, TrendingUp, Bus, CreditCard, ShieldCheck } from 'lucide-react';

export const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get('/api/admin/reports', { params });
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const handlePrintReport = () => {
    window.print();
  };

  const exportReportCSV = () => {
    if (!reportData) return;
    const summary = reportData.summary || {};
    const routes = reportData.routeBreakdown || [];

    const rows = [
      ['LANKA EXPRESSWAY BUS BOOKING - FINANCIAL REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Filter Month/Period', selectedMonth || `${startDate} to ${endDate}`],
      [],
      ['SUMMARY METRICS', 'VALUE (LKR)'],
      ['Total Ticket Revenue', summary.totalTicketRevenue || 0],
      ['Wallet Top-Up Deposits', summary.totalWalletTopUps || 0],
      ['Refunds & Cancellations', summary.totalRefunds || 0],
      ['Net Total Income', summary.netRevenue || 0],
      [],
      ['ROUTE REVENUE BREAKDOWN'],
      ['Route Name', 'Bookings Count', 'Passengers Count', 'Total Revenue (LKR)'],
      ...routes.map((r) => [r.routeName, r.bookingsCount, r.passengersCount, r.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lanka_expressway_monthly_report_${selectedMonth || 'custom'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportData?.summary || {};
  const routes = reportData?.routeBreakdown || [];
  const popularTimes = reportData?.popularTravelTimes || [];
  const paymentMethods = reportData?.paymentMethodBreakdown || {};
  const reportBookings = reportData?.reportBookings || [];

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Monthly Financial & Revenue Reports
          </h2>
          <p className="text-xs text-slate-400">Monthly income statement, route revenue breakdown & payment analytics</p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-bold">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setStartDate('');
                setEndDate('');
              }}
              className="bg-transparent text-slate-100 font-extrabold outline-none cursor-pointer"
            >
              <option value="2026-08" className="bg-slate-900">August 2026 (Current)</option>
              <option value="2026-07" className="bg-slate-900">July 2026</option>
              <option value="2026-06" className="bg-slate-900">June 2026</option>
              <option value="2026-05" className="bg-slate-900">May 2026</option>
            </select>
          </div>

          <button onClick={fetchReports} className="btn btn-primary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handlePrintReport} className="btn btn-secondary text-xs bg-slate-800 text-slate-200 border-slate-700">
            <Printer className="w-3.5 h-3.5 text-blue-400" /> Print Statement
          </button>
          <button onClick={exportReportCSV} className="btn btn-secondary text-xs">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Printable Report Header Banner */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-black uppercase text-black">Lanka Expressway Bus Booking System</h1>
        <h2 className="text-lg font-bold text-gray-700">Official Monthly Revenue & Financial Statement</h2>
        <p className="text-xs text-gray-500">Period: {selectedMonth || `${startDate} to ${endDate}`} | Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            LKR {(summary.totalTicketRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Direct Bus Ticket Bookings</span>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Topups</span>
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">
            LKR {(summary.totalWalletTopUps || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Customer PayHere Topup Deposits</span>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refunds Issued</span>
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            LKR {(summary.totalRefunds || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Cancellations & Ticket Refunds</span>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-blue-500 bg-slate-900/90">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Net Total Income</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-300">
            LKR {(summary.netRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-blue-400 font-medium">Calculated Monthly System Income</span>
        </div>
      </div>

      {/* Route Revenue Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-400" />
            Expressway Route Revenue Breakdown
          </span>
          <span className="text-xs font-semibold text-slate-400">{routes.length} Active Routes</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading route financial metrics...</div>
        ) : routes.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">No bookings found for the selected period.</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Reservations</th>
                  <th>Passengers</th>
                  <th>Total Revenue (LKR)</th>
                  <th>Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r, idx) => {
                  const share = summary.totalTicketRevenue ? Math.round((r.revenue / summary.totalTicketRevenue) * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td className="font-bold text-slate-200">{r.routeName}</td>
                      <td className="text-slate-300 font-bold">{r.bookingsCount} Bookings</td>
                      <td className="text-emerald-400 font-bold">{r.passengersCount} Seats</td>
                      <td className="text-emerald-400 font-black">LKR {r.revenue.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${share}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-300">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Method Analysis & Popular Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Channels Split */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Payment Channel Breakdown
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Digital Wallet Payments</span>
              <span className="text-sm font-black text-purple-400">LKR {(paymentMethods.Wallet || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">PayHere Credit/Debit Card</span>
              <span className="text-sm font-black text-emerald-400">LKR {(paymentMethods.Card || paymentMethods.Online || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">LankaQR Payments</span>
              <span className="text-sm font-black text-amber-400">LKR {(paymentMethods.LankaQR || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Popular Departure Times */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Popular Expressway Departure Times
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {popularTimes.slice(0, 5).map((t, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">{t.time} Departure</span>
                <span className="text-xs font-black text-blue-400 bg-blue-950/40 border border-blue-900/50 px-2.5 py-1 rounded-lg">
                  {t.count} Reservations
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
