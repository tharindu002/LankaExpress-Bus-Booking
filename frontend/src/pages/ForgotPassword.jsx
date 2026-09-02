import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email check, 2: Reset OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address format.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      if (res.otp) {
        setDemoOtp(res.otp);
        setOtp(res.otp); // Pre-fill for user convenience
      }
      setSuccessMsg(res.message || 'Reset code generated successfully.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'No account registered with this email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit reset code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccessMsg(res.message || 'Password reset successful!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please check your reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl dark:shadow-slate-950/40 border border-slate-100 dark:border-dark-border/40">
        
        {step === 1 && (
          <div>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter your registered email address. We will verify your account and send a reset code.
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Verify Email & Get Reset Code</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reset Account Password
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Account verified: <strong className="text-slate-700 dark:text-slate-200">{email}</strong>
              </p>
              {demoOtp && (
                <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">
                  <FaShieldAlt />
                  <span>Reset Code (OTP): {demoOtp}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">6-Digit Reset Code (OTP)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaKey className="text-xs" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm tracking-widest font-mono"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock className="text-xs" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock className="text-xs" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 cursor-pointer text-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <FaCheckCircle className="text-5xl text-teal-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Password Reset Successful!</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Your account password for <strong className="text-slate-700 dark:text-slate-200">{email}</strong> has been updated. You can now log in with your new password.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
