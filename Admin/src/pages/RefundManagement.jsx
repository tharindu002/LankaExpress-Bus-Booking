import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { RotateCcw, ShieldCheck, RefreshCw } from 'lucide-react';

export const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/refunds');
      setRefunds(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const totalRefundAmount = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

  const columns = [
    { header: 'Booking Ref', accessor: 'bookingRef' },
    { header: 'Passenger', render: (row) => row.userId?.name || row.userStrId },
    {
      header: 'Refund Amount',
      render: (row) => <span className="font-bold text-amber-400">LKR {row.amount}</span>,
    },
    { header: 'Refund Reason', accessor: 'reason' },
    { header: 'Notes', render: (row) => row.notes || 'Cancelled booking refund' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Idempotency Guard',
      render: () => (
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Duplicate Blocked
        </span>
      ),
    },
    {
      header: 'Refund Date',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-8 w-full">
      <div className="admin-page-header">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Ticket Refund Log</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Track ticket cancellation refunds credited into passenger digital wallets</p>
        </div>
        <button onClick={fetchRefunds} className="btn btn-secondary text-xs py-2.5 px-4 shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Refunds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <div className="glass-card kpi-card amber p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Refunded Value</span>
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-400">LKR {totalRefundAmount.toLocaleString()}</p>
          <span className="text-xs text-slate-400 mt-2 block font-medium">{refunds.length} Refund Transactions Completed</span>
        </div>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading refund logs...</div>
        ) : (
          <DataTable
            columns={columns}
            data={refunds}
            searchPlaceholder="Search booking ref, passenger name..."
            filename="lankaexpressway_refunds.csv"
          />
        )}
      </div>
    </div>
  );
};
