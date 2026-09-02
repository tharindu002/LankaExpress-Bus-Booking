import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaHistory, FaTimesCircle, FaEdit, FaCheckCircle, FaMapMarkerAlt, FaQrcode, FaWallet } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MyWallet from './MyWallet';

export default function UserDashboard() {
  const { user, walletBalance, refreshWallet, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings'); // bookings, history, profile, wallet
  const [userBookings, setUserBookings] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [editMode, setEditMode] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingRef, setSelectedBookingRef] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const userId = user?.id || user?.userId;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings(true);
    refreshWallet();
  }, [userId]);

  const fetchBookings = async (forceSpinner = false) => {
    if (forceSpinner || userBookings.length === 0) {
      setLoading(true);
    }
    try {
      const uId = user?.id || user?.userId;
      if (!uId) return;
      const data = await api.getUserBookings(uId);
      setUserBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile(profileForm);
      setProfileMsg('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setProfileMsg('Failed to update profile.');
    }
  };

  const handleOpenCancelModal = (ref) => {
    setSelectedBookingRef(ref);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await api.cancelBooking(selectedBookingRef);
      if (res) {
        await fetchBookings();
        await refreshWallet();
        setShowCancelModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) return null;

  const upcomingBookings = userBookings.filter((b) => b.status === 'Active');
  const pastBookings = userBookings.filter((b) => b.status === 'Cancelled');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-dark-card dark:to-slate-900 rounded-3xl text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md transition-colors">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">PASSENGER PANEL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ayubowan, {user.name}!</h1>
          <p className="text-slate-300 text-xs sm:text-sm">Manage bookings, cancellation requests, and wallet details</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-700/40 dark:bg-slate-800/40 border border-slate-600/40 px-4 py-2 rounded-xl">
          <FaUser className="text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">{user.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Tabs (Sidebar) */}
        <aside className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-4 shadow-sm space-y-2 transition-colors">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg/60'
            }`}
          >
            <FaTicketAlt />
            <span>Active Tickets ({upcomingBookings.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg/60'
            }`}
          >
            <FaHistory />
            <span>Booking History ({pastBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaWallet />
              <span>Digital Wallet</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-md font-extrabold ${activeTab === 'wallet' ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-white'}`}>
              LKR {walletBalance ? walletBalance.toLocaleString() : '0'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg/60'
            }`}
          >
            <FaUser />
            <span>Profile & Settings</span>
          </button>
        </aside>

        {/* Details Content pane */}
        <div className="md:col-span-3">
          {/* Active Bookings View */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Active expressway tickets</h2>
              {loading ? (
                <div className="text-center py-10 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">You do not have any active reservations.</p>
                  <Link to="/search" className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow">
                    Book Tickets Now
                  </Link>
                </div>
              ) : (
                upcomingBookings.map((b) => (
                  <div
                    key={b.bookingRef}
                    className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-5 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 border-slate-100 dark:border-dark-border/40">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Reference</span>
                        <span className="font-mono font-extrabold text-slate-800 dark:text-white block">{b.bookingRef}</span>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-black uppercase rounded-md">
                          Paid & Active
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md border ${
                          b.boardingStatus === 'Boarded'
                            ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {b.boardingStatus === 'Boarded' ? 'BOARDED' : 'Boarding: Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold">Route</span>
                        <strong className="text-sm text-slate-800 dark:text-slate-200 block">
                          {b.schedule?.route?.from.split(' ')[0]} ➔ {b.schedule?.route?.to.split(' ')[0]}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{b.schedule?.bus?.name}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold">Reserved Seats</span>
                        <div className="flex flex-wrap gap-1">
                          {b.seats.map((seat) => (
                            <span key={seat} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:justify-end items-center space-x-3">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-slate-400 uppercase block">Total Amount</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{b.totalAmount} LKR</span>
                        </div>
                        {(() => {
                          const canCancel = (() => {
                            if (b.boardingStatus === 'Boarded' || b.status !== 'Active') return false;
                            const depTime = b.schedule?.departureTime;
                            const bDate = b.bookingDate;
                            if (!depTime || !bDate) return true;

                            try {
                              const todayStr = new Date().toISOString().split('T')[0];
                              if (bDate < todayStr) return false;
                              if (bDate > todayStr) return true;

                              const timeParts = depTime.trim().split(' ');
                              const timeNum = timeParts[0].split(':');
                              let hours = parseInt(timeNum[0], 10);
                              const minutes = parseInt(timeNum[1], 10) || 0;
                              const modifier = timeParts[1] ? timeParts[1].toUpperCase() : '';

                              if (hours <= 12) {
                                if (modifier === 'PM' && hours < 12) hours += 12;
                                if (modifier === 'AM' && hours === 12) hours = 0;
                              }

                              const parts = bDate.split('-');
                              const depDate = new Date(
                                parseInt(parts[0], 10),
                                parseInt(parts[1], 10) - 1,
                                parseInt(parts[2], 10),
                                hours,
                                minutes,
                                0
                              );

                              const diffMinutes = (depDate.getTime() - Date.now()) / (1000 * 60);
                              return diffMinutes >= 30;
                            } catch (e) {
                              return true;
                            }
                          })();

                          return canCancel ? (
                            <button
                              onClick={() => handleOpenCancelModal(b.bookingRef)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              Cancellation Closed (&lt;30m)
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Booking History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Booking History</h2>
              {pastBookings.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 text-slate-500 text-sm">
                  No past or cancelled bookings found.
                </div>
              ) : (
                pastBookings.map((b) => (
                  <div
                    key={b.bookingRef}
                    className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-4 shadow-sm opacity-80"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{b.bookingRef}</span>
                        <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">Cancelled & Refunded</span>
                      </div>
                      <div className="font-bold text-slate-500">{b.totalAmount} LKR (Refunded to Wallet)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-6 shadow-sm space-y-6 transition-colors">
              <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-dark-border/40">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Profile Details</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center space-x-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <FaEdit />
                  <span>{editMode ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {profileMsg && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm p-3 rounded-lg font-medium text-center">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!editMode}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg opacity-50 border rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-xs shadow cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Unified PayHere Digital Wallet Tab */}
          {activeTab === 'wallet' && <MyWallet />}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-dark-border/40">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Cancel Booking {selectedBookingRef}?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to cancel this reservation? The ticket fare will be instantly refunded into your Digital Wallet.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                No, Keep Ticket
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
