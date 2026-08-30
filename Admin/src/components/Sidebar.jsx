import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bus,
  Building2,
  MapPin,
  CalendarDays,
  Armchair,
  Ticket,
  Wallet,
  Receipt,
  CreditCard,
  RotateCcw,
  BarChart3,
  Bell,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';
import { FaBus, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, isSuperAdmin, hasPermission } = useAuth();

  const navSections = [
    {
      title: 'Main Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'User Management', path: '/users', icon: Users, permission: 'manage_users' },
      ],
    },
    {
      title: 'Transport Operations',
      items: [
        { label: 'Buses & Fleets', path: '/buses', icon: Bus, permission: 'manage_buses' },
        { label: 'Bus Operators', path: '/operators', icon: Building2, permission: 'manage_buses' },
        { label: 'Express Routes', path: '/routes', icon: MapPin, permission: 'manage_routes' },
        { label: 'Bus Schedules', path: '/schedules', icon: CalendarDays, permission: 'manage_routes' },
        { label: 'Conductors', path: '/conductors', icon: ShieldCheck, permission: 'manage_conductors' },
        { label: 'Boarding Operations', path: '/boarding', icon: UserCheck, permission: 'manage_conductors' },
        { label: 'Seat Management', path: '/seats', icon: Armchair, permission: 'manage_buses' },
      ],
    },
    {
      title: 'Ticketing & Sales',
      items: [{ label: 'Bookings', path: '/bookings', icon: Ticket, permission: 'manage_bookings' }],
    },
    {
      title: 'Finance & Payments',
      items: [
        { label: 'User Wallets', path: '/wallets', icon: Wallet, permission: 'manage_finances' },
        { label: 'Wallet Transactions', path: '/wallet-transactions', icon: Receipt, permission: 'manage_finances' },
        { label: 'PayHere Payments', path: '/payments', icon: CreditCard, permission: 'manage_finances' },
        { label: 'Refunds Log', path: '/refunds', icon: RotateCcw, permission: 'manage_finances' },
      ],
    },
    {
      title: 'Analytics & System',
      items: [
        { label: 'Reports & Export', path: '/reports', icon: BarChart3, permission: 'view_reports' },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, permission: 'view_logs' },
        ...(isSuperAdmin
          ? [{ label: 'Admin Access Control', path: '/admin-access', icon: ShieldCheck, permission: 'manage_admins' }]
          : []),
        { label: 'Admin Profile', path: '/profile', icon: UserCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-68 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0 backdrop-blur-xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0 border border-emerald-400/30">
              <FaBus className="text-xl" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-wider text-slate-100 leading-none">
                LANKA<span className="text-emerald-400 font-extrabold">EXPRESS</span>
              </h2>
              <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase flex items-center gap-1 mt-1.5">
                <FaShieldAlt className="text-[9px]" /> {isSuperAdmin ? 'SUPERADMIN CONSOLE' : 'ADMIN CONSOLE'}
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-inner'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/40 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout System</span>
          </button>
        </div>
      </aside>
    </>
  );
};
