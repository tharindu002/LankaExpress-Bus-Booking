import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

export const Header = ({ title = 'Admin Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clean breadcrumb text based on route
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Main Overview / Dashboard';
    if (path.includes('/users')) return 'Main Overview / Passenger Accounts';
    if (path.includes('/buses')) return 'Transport Operations / Fleet Management';
    if (path.includes('/operators')) return 'Transport Operations / Bus Operators';
    if (path.includes('/routes')) return 'Transport Operations / Express Routes';
    if (path.includes('/schedules')) return 'Transport Operations / Timetables & Schedules';
    if (path.includes('/seats')) return 'Transport Operations / Seat Visualizer';
    if (path.includes('/bookings')) return 'Ticketing & Sales / Reservations';
    if (path.includes('/wallets')) return 'Finance / Digital Wallets';
    if (path.includes('/wallet-transactions')) return 'Finance / Transaction Ledger';
    if (path.includes('/payments')) return 'Finance / PayHere Gateway';
    if (path.includes('/refunds')) return 'Finance / Ticket Refund Log';
    if (path.includes('/reports')) return 'Analytics / System Reports';
    if (path.includes('/notifications')) return 'Analytics / System Activity';
    if (path.includes('/audit-logs')) return 'Analytics / Audit Logs';
    if (path.includes('/profile')) return 'System / Admin Profile';
    return 'LankaExpressway / Executive Portal';
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-8 lg:px-10 py-3.5 flex items-center justify-between sticky top-0 z-30 w-full shadow-md">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 border border-slate-700 transition cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 tracking-wide uppercase">
            <span>{getBreadcrumb()}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">{title}</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition cursor-pointer"
          title="System Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-900"></span>
        </button>

        {/* User Info Badge */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3.5 pl-4 sm:pl-5 border-l border-slate-800 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20 border border-emerald-400/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">
              {user?.name || 'Administrator'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
              <FaShieldAlt className="text-[9px]" />
              <span className="uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
