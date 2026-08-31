import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserCheck, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      const userRole = loggedUser.role?.toLowerCase();
      if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'conductor') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl dark:shadow-slate-950/40 border border-slate-100 dark:border-dark-border/40">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back to <span className="text-primary-500 dark:text-teal-400">LankaExpress</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage and download your expressway bus tickets
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-600 dark:text-slate-400 font-medium">
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-primary-500 hover:text-primary-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
