import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FaWallet,
  FaPlusCircle,
  FaHistory,
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaTicketAlt,
  FaSync,
  FaExchangeAlt,
} from 'react-icons/fa';

export default function MyWallet() {
  const { user, walletBalance, refreshWallet } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [processing, setProcessing] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success'|'error', text: '' }
  const [sandboxOrderId, setSandboxOrderId] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      await refreshWallet();
      const res = await api.getWalletTransactions();
      if (res && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTopup = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setAlertMsg({ type: 'error', text: 'Minimum top-up amount is LKR 100.00' });
      return;
    }

    setProcessing(true);
    setAlertMsg(null);

    try {
      // 1. Get PayHere parameters & backend MD5 hash
      const res = await api.topupWallet(numAmount);
      if (!res.success || !res.payHereData) {
        throw new Error(res.message || 'Failed to initialize top-up');
      }

      const payHereData = res.payHereData;
      setSandboxOrderId(payHereData.order_id);

      // Define PayHere SDK Handlers
      if (window.payhere) {
        window.payhere.onCompleted = async function onCompleted(orderId) {
          console.log('PayHere payment completed:', orderId);
          setAlertMsg({ type: 'success', text: `Payment completed successfully! Order ID: ${orderId}` });
          setTopupModalOpen(false);
          setProcessing(false);
          await fetchWalletData();
        };

        window.payhere.onDismissed = function onDismissed() {
          console.warn('PayHere payment dismissed by user');
          setAlertMsg({ type: 'error', text: 'PayHere payment window was closed before completion.' });
          setProcessing(false);
        };

        window.payhere.onError = function onError(error) {
          console.error('PayHere Error:', error);
          setAlertMsg({ type: 'error', text: `PayHere Payment Error: ${error}` });
          setProcessing(false);
        };

        // Trigger PayHere SDK Modal
        window.payhere.startPayment(payHereData);
      } else {
        setAlertMsg({ type: 'error', text: 'PayHere SDK is not loaded. Please check your internet connection.' });
        setProcessing(false);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
      setProcessing(false);
    }
  };

  // Direct Sandbox Simulator Verification (for local development testing)
  const handleVerifySandbox = async () => {
    if (!sandboxOrderId) return;
    setProcessing(true);
    try {
      const res = await api.verifySandboxTopup(sandboxOrderId);
      if (res.success) {
        setAlertMsg({ type: 'success', text: `✅ Sandbox Top-Up Verified! LKR ${amount} added to your Digital Wallet.` });
        setTopupModalOpen(false);
        await fetchWalletData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10">
          <FaWallet size={320} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center">
              <FaShieldAlt className="mr-1.5" /> LankaExpressway Secure Digital Wallet
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">My Digital Wallet</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-emerald-200 text-sm font-medium mb-1">Available Wallet Balance</p>
              <div className="text-3xl sm:text-4xl font-black text-white">
                LKR {walletBalance.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-300/80 mt-1 flex items-center">
                <FaCheckCircle className="mr-1 text-emerald-400" /> PayHere Verified Account Balance
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:col-span-2 justify-end">
              <button
                onClick={() => {
                  setTopupModalOpen(true);
                  setAlertMsg(null);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-lg"
              >
                <FaPlusCircle className="text-xl" />
                <span>Add Money (PayHere)</span>
              </button>

              <button
                onClick={fetchWalletData}
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-4 rounded-xl border border-white/20 transition flex items-center justify-center space-x-2"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl mb-6 border flex items-center justify-between shadow-sm ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {alertMsg.type === 'success' ? (
              <FaCheckCircle className="text-emerald-600 text-xl flex-shrink-0" />
            ) : (
              <FaTimesCircle className="text-rose-600 text-xl flex-shrink-0" />
            )}
            <span className="font-medium text-sm sm:text-base">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <FaHistory size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Wallet Transaction History</h2>
              <p className="text-sm text-gray-500">Real-time ledger of all wallet top-ups, ticket payments & refunds</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
            {transactions.length} Transactions
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <FaSync className="animate-spin mx-auto text-emerald-600 text-3xl mb-3" />
            <p className="text-gray-500 font-medium">Fetching verified wallet ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <FaWallet className="mx-auto text-gray-300 text-5xl mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Transactions Yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mt-1 mb-4">
              Add money to your wallet using PayHere or book bus tickets to start generating wallet transactions.
            </p>
            <button
              onClick={() => setTopupModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
            >
              Add Money Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider border-y border-gray-100">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reference / Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-LK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <span className="block text-xs text-gray-400 font-normal">
                        {new Date(tx.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {tx.type === 'CREDIT' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <FaArrowDown className="mr-1 text-emerald-600" /> CREDIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <FaArrowUp className="mr-1 text-rose-600" /> DEBIT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-800">
                      {tx.reason === 'WALLET_TOPUP' && '💳 PayHere Wallet Top-Up'}
                      {tx.reason === 'TICKET_PAYMENT' && '🚌 Bus Ticket Purchase'}
                      {tx.reason === 'BOOKING_REFUND' && '🔄 Booking Cancellation Refund'}
                      {tx.reason === 'ADMIN_ADJUSTMENT' && '⚙️ System Adjustment'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-extrabold">
                      <span className={tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.type === 'CREDIT' ? '+' : '-'} LKR {tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-600">
                      LKR {tx.balanceAfter ? tx.balanceAfter.toFixed(2) : '-'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {tx.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <FaCheckCircle className="mr-1 text-emerald-500" /> Completed
                        </span>
                      ) : tx.status === 'PENDING' ? (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          <FaClock className="mr-1 text-amber-500 animate-spin" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <FaTimesCircle className="mr-1 text-rose-500" /> {tx.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {tx.bookingRef && (
                        <div className="text-emerald-700 font-bold flex items-center mb-0.5">
                          <FaTicketAlt className="mr-1" /> {tx.bookingRef}
                        </div>
                      )}
                      {tx.paymentId && <div>PayID: {tx.paymentId}</div>}
                      {tx.orderId && <div className="text-gray-400">Order: {tx.orderId}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PayHere Top-Up Modal */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setTopupModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            >
              &times;
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <FaWallet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Money via PayHere</h3>
                <p className="text-xs text-gray-500">Official Sri Lankan PayHere Payment Gateway Checkout</p>
              </div>
            </div>

            <form onSubmit={handleStartTopup} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Amount in LKR (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-gray-400 text-lg">
                    LKR
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="1000"
                    className="w-full pl-16 pr-4 py-3.5 text-2xl font-black text-gray-900 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                  />
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-2">Quick Select:</span>
                <div className="grid grid-cols-4 gap-2">
                  {['500', '1000', '2500', '5000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        amount === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      +LKR {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* PayHere Sandbox Info Alert */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center font-bold text-emerald-800">
                  <FaShieldAlt className="mr-1.5 text-emerald-600" /> PayHere Sandbox Development Mode Active
                </div>
                <p className="text-emerald-700/90 leading-relaxed">
                  Top-up requests generate a cryptographically signed MD5 hash on Express backend and initialize official PayHere Sandbox Modal.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-black rounded-2xl text-lg shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <FaSync className="animate-spin" />
                      <span>Connecting PayHere...</span>
                    </>
                  ) : (
                    <>
                      <FaPlusCircle />
                      <span>Proceed to PayHere Checkout</span>
                    </>
                  )}
                </button>

                {sandboxOrderId && (
                  <button
                    type="button"
                    onClick={handleVerifySandbox}
                    disabled={processing}
                    className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle className="text-emerald-400" />
                    <span>Verify Sandbox Top-Up ({sandboxOrderId})</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
