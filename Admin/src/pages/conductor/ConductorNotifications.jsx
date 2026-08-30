import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Ticket, Calendar, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { ConductorLayout } from '../../components/ConductorLayout';

export function ConductorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getConductorNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ConductorLayout title="Conductor Notifications">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Real-Time Notifications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Booking reservations, cancellations, and schedule assignment updates
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 glass-card text-slate-400 text-xs font-semibold">
          No notifications received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`glass-card p-4 flex items-start justify-between gap-4 transition ${
                !n.read ? 'border-l-4 border-l-emerald-500 bg-slate-900/60' : 'opacity-80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      n.type === 'NEW_BOOKING'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : n.type === 'BOOKING_CANCELLED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {n.type}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{n.title}</span>
                </div>

                <p className="text-xs text-slate-300">{n.message}</p>

                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold shrink-0 transition"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ConductorLayout>
  );
}
