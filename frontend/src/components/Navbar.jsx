import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaMoon, FaSun, FaUser, FaSignOutAlt, FaBars, FaTimes, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, walletBalance, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 border-b glass border-slate-200/55 dark:border-dark-border/55">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <FaBus className="text-2xl text-emerald-500 animate-pulse" />
            <span className="font-extrabold text-xl tracking-wider">
              LANKA<span className="text-emerald-600 font-bold">EXPRESS</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <Link to="/search" className="font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Book Tickets
            </Link>

            {user && (
              <Link
                to="/wallet"
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-sm"
              >
                <FaWallet className="text-emerald-600 text-sm" />
                <span>My Wallet</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                  LKR {walletBalance ? walletBalance.toLocaleString() : '0'}
                </span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center space-x-1 font-medium text-amber-600 dark:text-amber-400 hover:text-emerald-600 transition-colors">
                <FaShieldAlt className="text-sm" />
                <span>Admin</span>
              </Link>
            )}

            {user?.role === 'user' && (
              <Link to="/dashboard" className="font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                My Dashboard
              </Link>
            )}

            {/* Dark/Light mode button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <FaMoon className="text-lg text-slate-600" /> : <FaSun className="text-lg text-amber-400" />}
            </button>

            {/* Authentication Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/30 transition-all duration-200 cursor-pointer"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-emerald-500/20 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card text-slate-700 dark:text-slate-300 transition-colors"
            >
              {theme === 'light' ? <FaMoon className="text-md" /> : <FaSun className="text-md text-amber-400" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card focus:outline-none"
            >
              {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-slate-200/50 dark:border-dark-border/50 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
            >
              Book Tickets
            </Link>
            {user && (
              <Link
                to="/wallet"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md font-bold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                My Wallet (LKR {walletBalance ? walletBalance.toLocaleString() : '0'})
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                Admin Dashboard
              </Link>
            )}
            {user?.role === 'user' && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                My Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 font-semibold text-rose-600 dark:text-rose-400"
              >
                Logout
              </button>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 border"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-3 py-2 rounded-md font-bold bg-emerald-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
