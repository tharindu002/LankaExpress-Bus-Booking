import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Download, Calendar, RefreshCw, DollarSign, Wallet, RotateCcw, Clock, Printer, TrendingUp, Bus, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportReportPDF = () => {
    if (!reportData) return;
    const summary = reportData.summary || {};
    const routes = reportData.routeBreakdown || [];
    const paymentMethods = reportData.paymentMethodBreakdown || {};

    const doc = new jsPDF();

    const primaryColor = [15, 23, 42]; // Dark slate Navy #0f172a
    const emeraldColor = [16, 185, 129]; // Emerald #10b981
    const textColor = [30, 41, 59]; // Slate 800

    // Header Banner Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 38, 'F');

    // Header Text
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('LANKA EXPRESSWAY BUS BOOKING SYSTEM', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 213, 219);
    doc.text('OFFICIAL MONTHLY REVENUE & FINANCIAL STATEMENT', 14, 24);

    doc.setFontSize(8.5);
    doc.text(`Period: ${selectedMonth || `${startDate} to ${endDate}`}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 125, 32);

    let startY = 46;

    // 1. Executive Summary Table
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Financial Summary', 14, startY);

    startY += 4;

    const summaryData = [
      ['Total Ticket Revenue', `LKR ${(summary.totalTicketRevenue || 0).toLocaleString()}`],
      ['Wallet Top-Up Deposits', `LKR ${(summary.totalWalletTopUps || 0).toLocaleString()}`],
      ['Refunds & Cancellations', `LKR ${(summary.totalRefunds || 0).toLocaleString()}`],
      ['Net Total System Income', `LKR ${(summary.netRevenue || 0).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: startY,
      head: [['Financial Metric Description', 'Amount (LKR)']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
      },
      styles: { cellPadding: 3 },
    });

    startY = doc.lastAutoTable.finalY + 10;

    // 2. Expressway Route Revenue Breakdown
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Expressway Route Revenue Breakdown', 14, startY);

    startY += 4;

    const routeTableHead = ['Route Name', 'Reservations', 'Passengers', 'Revenue (LKR)', 'Share (%)'];
    const routeTableBody = routes.map((r) => {
      const share = summary.totalTicketRevenue ? Math.round((r.revenue / summary.totalTicketRevenue) * 100) : 0;
      return [
        r.routeName,
        `${r.bookingsCount} Bookings`,
        `${r.passengersCount} Seats`,
        `LKR ${r.revenue.toLocaleString()}`,
        `${share}%`,
      ];
    });

    if (routeTableBody.length === 0) {
      routeTableBody.push(['No route revenue data recorded for this period', '-', '-', 'LKR 0', '0%']);
    }

    autoTable(doc, {
      startY: startY,
      head: [routeTableHead],
      body: routeTableBody,
      theme: 'striped',
      headStyles: {
        fillColor: emeraldColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: textColor,
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
      },
      styles: { cellPadding: 3 },
    });

    startY = doc.lastAutoTable.finalY + 10;

    // 3. Payment Method Breakdown
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Payment Channel Breakdown', 14, startY);

    startY += 4;

    const paymentTableData = [
      ['Digital Wallet Payments', `LKR ${(paymentMethods.Wallet || 0).toLocaleString()}`],
      ['PayHere Credit/Debit Card', `LKR ${(paymentMethods.Card || paymentMethods.Online || 0).toLocaleString()}`],
      ['LankaQR Payments', `LKR ${(paymentMethods.LankaQR || 0).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: startY,
      head: [['Payment Channel', 'Total Revenue Collected (LKR)']],
      body: paymentTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: textColor,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { halign: 'right', fontStyle: 'bold' },
      },
      styles: { cellPadding: 3 },
    });

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Lanka Expressway Bus Booking System — Official Financial Statement', 14, 287);
      doc.text(`Page ${i} of ${pageCount}`, 180, 287);
    }

    doc.save(`lanka_expressway_financial_report_${selectedMonth || 'custom'}.pdf`);
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
          <button onClick={exportReportPDF} className="btn btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/40">
            <FileText className="w-4 h-4 text-white" /> Download PDF
          </button>
          <button onClick={exportReportCSV} className="btn btn-secondary text-xs">
            <Download className="w-3.5 h-3.5 text-slate-400" /> CSV
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
