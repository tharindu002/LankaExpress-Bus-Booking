import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { FaBus, FaShieldAlt } from 'react-icons/fa';

export const Login = () => {
  const [email, setEmail] = useState('admin@lankaexpressway.lk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [quickFilledRole, setQuickFilledRole] = useState(null);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.role === 'conductor') {
        navigate('/conductor');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickFill = (roleName, demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setQuickFilledRole(roleName);
    setTimeout(() => setQuickFilledRole(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white py-14">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-teal-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Main Glassmorphic Login Card */}
      <div className="admin-login-card">
        
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-20 right-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

        {/* Card Header & Branding */}
        <div className="admin-login-header">
          <div className="relative mb-5">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 blur-md opacity-60"></div>
            <div className="relative w-18 h-18 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-2xl border border-emerald-400/40">
              <FaBus className="text-3xl drop-shadow-md" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-2">
            LANKA<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">EXPRESS</span>
          </h1>

          <div className="admin-login-badge">
            <FaShieldAlt className="text-xs" />
            Executive Admin Portal
          </div>
          
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            Enter your credentials to securely access system management & live telemetry.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-7 p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-950/50">
            <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Fill Confirmation Notification */}
        {quickFilledRole && (
          <div className="mb-6 p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Filled credentials for <strong className="text-emerald-200">{quickFilledRole}</strong></span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-form-group">
          <div className="admin-field-container">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                className="input-control pl-12 bg-slate-950/80 border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-100 placeholder-slate-500 rounded-xl py-3.5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lankaexpressway.lk"
              />
            </div>
          </div>

          <div className="admin-field-container">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-control pl-12 pr-12 bg-slate-950/80 border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-100 placeholder-slate-500 rounded-xl py-3.5 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-submit"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In To Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Credentials Section */}
        <div className="admin-quick-section">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-semibold">Quick Fill Admin Credentials</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Demo Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleQuickFill('Super Admin 1', 'admin@lankaexpressway.lk', 'admin123')}
              className="admin-quick-card group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">Super Admin 1</span>
                <Key className="w-3.5 h-3.5 text-emerald-500/70 group-hover:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">admin@lankaexpressway.lk</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('Admin 2', 'admin@highwayexpress.lk', 'admin123')}
              className="admin-quick-card group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">Admin 2</span>
                <Key className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">admin@highwayexpress.lk</p>
            </button>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => handleQuickFill('Demo Conductor', 'conductor@lankaexpressway.lk', 'password123')}
              className="admin-quick-card group w-full"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-teal-300 group-hover:text-teal-200 transition">Demo Conductor (Nimal Perera)</span>
                <Key className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">conductor@lankaexpressway.lk</p>
            </button>
          </div>
        </div>

        {/* Security & Access Info Footer */}
        <div className="mt-9 text-center pt-2">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
            <span>Protected Endpoint • Role-Based Access Control Enabled</span>
          </p>
        </div>

      </div>
    </div>
  );
};


