import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Ticket, RotateCcw, CreditCard, RefreshCw } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/notifications');
      setNotifications(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">System Activity Notifications</h2>
          <p className="text-xs text-slate-400">Real-time log of bookings, payments, cancellations & system events</p>
        </div>
        <button onClick={fetchNotifications} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Notifications
        </button>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading activity feed...</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => {
              let Icon = Bell;
              let bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';

              if (n.type === 'booking') {
                Icon = Ticket;
                bg = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
              } else if (n.type === 'refund') {
                Icon = RotateCcw;
                bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              } else if (n.type === 'payment') {
                Icon = CreditCard;
                bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              }

              return (
                <div key={n.id} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl border ${bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200">{n.title}</h4>
                      <span className="text-[11px] text-slate-500">{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">No recent notifications</div>
        )}
      </div>
    </div>
  );
};
