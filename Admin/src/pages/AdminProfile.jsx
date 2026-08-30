import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Key, LogOut } from 'lucide-react';

export const AdminProfile = () => {
    const { user, updateProfile, changePassword } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [passErr, setPassErr] = useState('');

    const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setProfileMsg('');
      setProfileErr('');

      const res = await updateProfile({ name, phone });
      if (res.success) {
        setProfileMsg(res.message);
      } else {
        setProfileErr(res.error);
      }
    };

    const handleChangePassword = async (e) => {
      e.preventDefault();
      setPassMsg('');
      setPassErr('');

      if (newPassword !== confirmPassword) {
        setPassErr('New password and confirm password do not match');
        return;
      }

      const res = await changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPassMsg(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassErr(res.error);
      }
    };

    return (
      <div className="space-y-8 w-full">
        <div className="admin-page-header">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Admin Profile Settings</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage administrator account credentials & security settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Profile Details Form */}
          <div className="glass-card p-7 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <User className="w-5 h-5 text-emerald-400" />
              <span>Account Profile Info</span>
            </h3>

            {profileMsg && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
                {profileMsg}
              </div>
            )}
            {profileErr && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {profileErr}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Email Address (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  className="input-control bg-slate-950/80 opacity-70 cursor-not-allowed py-3"
                  value={user?.email || ''}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Role / Authority
                </label>
                <input
                  type="text"
                  disabled
                  className="input-control uppercase text-emerald-400 font-extrabold bg-slate-950/80 opacity-85 cursor-not-allowed py-3"
                  value={user?.role || 'ADMIN'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-control py-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="input-control py-3"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary text-xs sm:text-sm w-full py-3.5 mt-3 shadow-lg shadow-emerald-950/50">
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-7 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Change Password</span>
            </h3>

            {passMsg && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
                {passMsg}
              </div>
            )}
            {passErr && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
                {passErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="input-control py-3"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  className="input-control py-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="input-control py-3"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary text-xs sm:text-sm w-full py-3.5 mt-3 shadow-lg shadow-emerald-950/50">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
