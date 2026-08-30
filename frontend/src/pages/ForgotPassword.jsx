import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl dark:shadow-slate-950/40 border border-slate-100 dark:border-dark-border/40">
        {!submitted ? (
          <div>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <FaCheckCircle className="text-5xl text-teal-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Check your email</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              We have sent a password reset link to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              (This is a simulated request. In a real system, you would check your inbox.)
            </p>
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
