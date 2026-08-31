import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Bus, LayoutDashboard, Ticket, Bell, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import { io } from 'socket.io-client';

export function ConductorLayout({ children, title = 'Conductor Workspace' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [liveToast, setLiveToast] = useState(null);

  useEffect(() => {
    fetchNotificationCount();
  }, [location.pathname]);

  // Connect to Socket.IO and join conductor private room
  useEffect(() => {
    if (!user) return;

    const getSocketUrl = () => {
      const isLocalDev =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocalDev) {
        const localUrl = (
          import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          'http://localhost:5000'
        ).trim();
        let cleanLocal = localUrl.replace(/\/+$/, '');
        if (cleanLocal.endsWith('/api')) cleanLocal = cleanLocal.slice(0, -4);
        return cleanLocal;
      }

      // PRODUCTION / VERCEL: ALWAYS USE RENDER BACKEND
      let prodUrl = (
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        ''
      ).trim();

      if (!prodUrl || prodUrl.includes('localhost') || prodUrl.includes('127.0.0.1')) {
        prodUrl = 'https://lankaexpress-bus-booking-backend.onrender.com';
      }

      let cleanProd = prodUrl.replace(/\/+$/, '');
      if (cleanProd.endsWith('/api')) cleanProd = cleanProd.slice(0, -4);
      return cleanProd;
    };

    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
    });

    const condIds = [user._id, user.userId, user.employeeId].filter(Boolean);
    condIds.forEach((id) => {
      socket.emit('join_conductor', id);
    });

    socket.on('NEW_BOOKING', (data) => {
      console.log('🔔 Live Socket.IO NEW_BOOKING received:', data);
      setUnreadNotifications((prev) => prev + 1);
      setLiveToast({
        type: 'NEW_BOOKING',
        title: data.title || 'New Booking Received',
        message: data.message,
        bookingRef: data.bookingRef,
        passengerName: data.passengerName,
        seats: data.seats,
        departureTime: data.departureTime,
        paymentStatus: data.paymentStatus || 'PAID',
        route: data.route,
      });

      setTimeout(() => {
        setLiveToast((current) => (current?.bookingRef === data.bookingRef ? null : current));
      }, 7000);
    });

    socket.on('BOOKING_CANCELLED', (data) => {
      console.log('⚠️ Live Socket.IO BOOKING_CANCELLED received:', data);
      setUnreadNotifications((prev) => prev + 1);
      setLiveToast({
        type: 'BOOKING_CANCELLED',
        title: data.title || 'Booking Cancelled',
        message: data.message,
        bookingRef: data.bookingRef,
      });

      setTimeout(() => {
        setLiveToast((current) => (current?.bookingRef === data.bookingRef ? null : current));
      }, 7000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const res = await api.getConductorNotifications();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadNotifications(res.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-20 sm:pb-0">
      {/* Top Mobile & Desktop Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 tracking-tight leading-tight">LANKA<span className="text-amber-400">EXPRESS</span></h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">CONDUCTOR PORTAL</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/conductor/notifications"
            className="relative p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <div className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-3">
            <span className="text-xs font-bold text-slate-300">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Real-Time Socket.IO Toast Notification Overlay */}
      {liveToast && (
        <div className="fixed top-16 right-4 z-50 max-w-md w-full bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 text-slate-100 animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-md">
                {liveToast.type === 'NEW_BOOKING' ? '🔔 LIVE NEW BOOKING' : '⚠️ BOOKING CANCELLED'}
              </span>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 bg-slate-800 rounded"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-extrabold text-white">{liveToast.title}</h4>
            <p className="text-xs text-slate-300 font-medium">{liveToast.message}</p>

            {liveToast.type === 'NEW_BOOKING' && (
              <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Ref</span>
                  <span className="font-mono text-emerald-400 font-bold">{liveToast.bookingRef}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Passenger</span>
                  <span className="font-bold text-slate-200">{liveToast.passengerName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Seat(s)</span>
                  <span className="font-extrabold text-amber-400">{Array.isArray(liveToast.seats) ? liveToast.seats.join(', ') : liveToast.seats}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-extrabold text-emerald-400">{liveToast.paymentStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Bar for Large Screens */}
      <nav className="hidden sm:flex bg-slate-900 border-b border-slate-800 px-6 py-2.5 space-x-2">
        <Link
          to="/conductor"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive('/conductor') ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/conductor/schedules"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive('/conductor/schedules') ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>My Schedules</span>
        </Link>

        <Link
          to="/conductor/bookings"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive('/conductor/bookings') ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Bookings</span>
        </Link>

        <Link
          to="/conductor/scan"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive('/conductor/scan') ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scan QR Ticket</span>
        </Link>

        <Link
          to="/conductor/notifications"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive('/conductor/notifications') ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({unreadNotifications})</span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {children}
      </main>

      {/* Bottom Navigation for Mobile Phones */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <Link
          to="/conductor"
          className={`flex flex-col items-center py-1 px-3 rounded-xl ${
            isActive('/conductor') ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          to="/conductor/schedules"
          className={`flex flex-col items-center py-1 px-3 rounded-xl ${
            isActive('/conductor/schedules') ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Bus className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Trips</span>
        </Link>

        <Link
          to="/conductor/scan"
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg shadow-emerald-950/80 -mt-6 border-4 border-slate-950"
        >
          <QrCode className="w-6 h-6" />
        </Link>

        <Link
          to="/conductor/bookings"
          className={`flex flex-col items-center py-1 px-3 rounded-xl ${
            isActive('/conductor/bookings') ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bookings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-1 px-3 text-rose-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Logout</span>
        </button>
      </div>
    </div>
  );
}
