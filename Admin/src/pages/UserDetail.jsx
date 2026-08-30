import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Wallet, Ticket, Receipt, User, Phone, Mail, Shield } from 'lucide-react';

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/users/${id}`);
        setUserData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user details');
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading user account profile...</div>;
  }

  if (error || !userData) {
    return <div className="p-6 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-sm">{error || 'User not found'}</div>;
  }

  const { user, wallet, transactions, bookings } = userData;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/users')} className="btn btn-secondary text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to User List
      </button>

      {/* User Header Profile */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-2xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-100">{user.name}</h2>
              <StatusBadge status={user.status} />
              <StatusBadge status={user.role} />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> ID: {user.userId}</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance Widget */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-right min-w-[200px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Authoritative Wallet Balance</span>
          <p className="text-2xl font-black text-emerald-400">LKR {(wallet?.balance || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Status: {wallet?.status || 'ACTIVE'}</span>
        </div>
      </div>

      {/* Activity Logs Split: Wallet Transactions & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Transactions */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            Wallet Transaction Ledger ({transactions?.length || 0})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {transactions?.length > 0 ? (
              transactions.map((t) => (
                <div key={t._id} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">{t.reason}</span>
                    <span className="text-[11px] text-slate-400">{t.notes || `Order ${t.orderId || t.bookingRef || '-'}`}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'} LKR {t.amount}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No wallet transactions recorded for this user</p>
            )}
          </div>
        </div>

        {/* User Bookings */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-400" />
            Bus Ticket Booking History ({bookings?.length || 0})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {bookings?.length > 0 ? (
              bookings.map((b) => (
                <div key={b._id} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">{b.bookingRef}</span>
                    <span className="text-slate-400">Seats: {b.seats.join(', ')} ({b.bookingDate})</span>
                    <span className="text-[10px] text-slate-500 block">Method: {b.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-200">LKR {b.totalAmount}</p>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No ticket bookings recorded for this user</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
