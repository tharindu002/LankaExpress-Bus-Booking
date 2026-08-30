import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Wallet, DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';

export const WalletManagement = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/wallets');
      setWallets(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const totalSystemBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalTopUpsSum = wallets.reduce((sum, w) => sum + (w.totalTopUps || 0), 0);
  const totalTicketSpendingSum = wallets.reduce((sum, w) => sum + (w.totalTicketSpending || 0), 0);
  const totalRefundsSum = wallets.reduce((sum, w) => sum + (w.totalRefunds || 0), 0);

  const columns = [
    { header: 'User ID', accessor: 'userStrId' },
    { header: 'Passenger Name', render: (row) => row.user?.name || row.userStrId },
    { header: 'Email Address', render: (row) => row.user?.email || '-' },
    {
      header: 'Authoritative Balance',
      render: (row) => <span className="font-bold text-emerald-400">LKR {(row.balance || 0).toLocaleString()}</span>,
    },
    {
      header: 'Total Top-Ups',
      render: (row) => <span className="text-slate-300">LKR {(row.totalTopUps || 0).toLocaleString()}</span>,
    },
    {
      header: 'Ticket Spending',
      render: (row) => <span className="text-slate-300">LKR {(row.totalTicketSpending || 0).toLocaleString()}</span>,
    },
    {
      header: 'Refunds Received',
      render: (row) => <span className="text-purple-400">LKR {(row.totalRefunds || 0).toLocaleString()}</span>,
    },
    { header: 'Wallet Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">User Digital Wallets Overview</h2>
          <p className="text-xs text-slate-400">Authoritative single source of truth wallet balances & financial metrics</p>
        </div>
        <button onClick={fetchWallets} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Wallets
        </button>
      </div>

      {/* Financial Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card kpi-card emerald p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Wallet Float</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">LKR {totalSystemBalance.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Total User Balances Held</span>
        </div>

        <div className="glass-card kpi-card purple p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Top-Ups Deposited</span>
            <ArrowUpRight className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">LKR {totalTopUpsSum.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Via PayHere Gateway</span>
        </div>

        <div className="glass-card kpi-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ticket Spending</span>
            <ArrowDownRight className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">LKR {totalTicketSpendingSum.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Spent On Bus Tickets</span>
        </div>

        <div className="glass-card kpi-card amber p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Refunds Issued</span>
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">LKR {totalRefundsSum.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Refunded For Cancellations</span>
        </div>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading digital wallets...</div>
        ) : (
          <DataTable
            columns={columns}
            data={wallets}
            searchPlaceholder="Search passenger name, email, user ID..."
            filename="lankaexpressway_wallets.csv"
          />
        )}
      </div>
    </div>
  );
};
