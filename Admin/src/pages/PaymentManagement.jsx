import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { CreditCard, ShieldAlert, RefreshCw } from 'lucide-react';

export const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/payments');
      setPayments(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    { header: 'Order ID', accessor: 'orderId' },
    { header: 'Payment ID', render: (row) => row.paymentId || 'N/A (Pending)' },
    { header: 'Passenger', render: (row) => row.userId?.name || row.userStrId },
    {
      header: 'Amount',
      render: (row) => <span className="font-bold text-slate-100">LKR {row.amount}</span>,
    },
    { header: 'Gateway', accessor: 'gateway' },
    { header: 'Gateway Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Date & Time',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">PayHere Gateway Payments</h2>
          <p className="text-xs text-slate-400">Verified server-to-server gateway notifications log</p>
        </div>
        <button onClick={fetchPayments} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Payments
        </button>
      </div>

      {/* Security Rule Guard Notice */}
      <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-200">
        <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div>
          <span className="font-bold text-blue-300 block">Immutable Payment Security Policy</span>
          <span>
            Payment success status is strictly derived from verified PayHere server MD5 signatures. Manual override to SUCCESS is forbidden to prevent financial fraud.
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading payments log...</div>
        ) : (
          <DataTable
            columns={columns}
            data={payments}
            searchPlaceholder="Search order ID, payment ID, passenger..."
            filename="lankaexpressway_payhere_payments.csv"
          />
        )}
      </div>
    </div>
  );
};
