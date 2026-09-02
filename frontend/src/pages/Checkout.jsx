import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaRegCreditCard, FaQrcode, FaMobileAlt, FaLock, FaCheckCircle, FaWallet, FaPlusCircle } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Checkout() {
  const { selectedBus, selectedSeats, passengerDetails, savePassengerDetails, completeBooking } = useBooking();
  const { user, walletBalance, refreshWallet } = useAuth();
  const navigate = useNavigate();

  // Passenger form states
  const [name, setName] = useState(passengerDetails?.name || user?.name || '');
  const [email, setEmail] = useState(passengerDetails?.email || user?.email || '');
  const [phone, setPhone] = useState(passengerDetails?.phone || user?.phone || '');
  const [nic, setNic] = useState(passengerDetails?.nic || '');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('InAppWallet'); // Default to Digital Wallet
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletPhone, setWalletPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fare = selectedBus?.fare || 0;
  const route = selectedBus?.route;
  const tollFee = route?.tollFee || 0;
  const basePrice = (selectedSeats?.length || 0) * fare;
  const bookingFee = 150;
  const totalAmount = basePrice + tollFee + bookingFee;
  const currentWalletBal = walletBalance !== undefined ? walletBalance : user?.walletBalance || 0;

  useEffect(() => {
    refreshWallet();
  }, []);

  useEffect(() => {
    if (paymentMethod === 'InAppWallet' && currentWalletBal >= totalAmount) {
      setError('');
    }
  }, [totalAmount, currentWalletBal, paymentMethod]);

  if (!selectedBus || selectedSeats.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Checkout Empty</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">You have not selected a bus or seats. Please return to search.</p>
        <Link to="/search" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold">
          Back to Search
        </Link>
      </div>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !nic) {
      setError('Please fill in all passenger details.');
      return;
    }

    if (paymentMethod === 'Card' && (!cardNo || !cardExpiry || !cardCvv)) {
      setError('Please enter complete credit card details.');
      return;
    }

    if (paymentMethod === 'InAppWallet' && currentWalletBal < totalAmount) {
      setError(`Insufficient wallet balance. Total fare: LKR ${totalAmount.toFixed(2)}, Wallet balance: LKR ${currentWalletBal.toFixed(2)}. Please add money to your wallet.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (paymentMethod === 'InAppWallet') {
        const result = await api.payTicketWithWallet({
          scheduleId: selectedBus.id,
          seats: selectedSeats,
          passengerName: name,
          passengerEmail: email,
          passengerPhone: phone,
          passengerNic: nic,
        });

        const bookingRef = result.data?.bookingRef || result.bookingRef || `BUS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const qrCodeData = result.data?.qrCodeData || bookingRef;

        await refreshWallet();
        completeBooking({
          bookingRef,
          seats: selectedSeats,
          passengerName: name,
          passengerEmail: email,
          passengerPhone: phone,
          passengerNic: nic,
          bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalAmount,
          qrCodeData,
          status: 'Active',
          paymentStatus: 'Paid',
          paymentMethod: 'Wallet',
        });
        savePassengerDetails({ name, email, phone, nic });
        navigate('/success');
      } else {
        const bookingData = {
          userId: user?.id || user?.userId || 'guest',
          name,
          email,
          phone,
          nic,
          scheduleId: selectedBus.id,
          seats: selectedSeats,
          totalAmount,
          paymentMethod,
        };
        const result = await api.createBooking(bookingData);
        completeBooking(result.booking || result);
        savePassengerDetails({ name, email, phone, nic });
        navigate('/success');
      }
    } catch (err) {
      setError(err.message || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/seats"
        className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
      >
        <FaArrowLeft className="text-xs" />
        <span>Back to Seat Selection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Passenger & Payment forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Passenger Info Form */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-6 shadow-sm transition-colors">
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4 border-b pb-2">
              Passenger Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Primary Passenger Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Tharidu Silva"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="tharidu@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Mobile Number (SMS updates)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">NIC / Passport Number</label>
                <input
                  type="text"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="199824510V / 20018475254"
                />
              </div>
            </div>
          </div>

          {/* Secure Online Payment Gateway Integration */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-6 shadow-sm transition-colors space-y-6">
            <div>
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-white border-b pb-2">
                Select Expressway Payment Gateway
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Pay using your internal Digital Wallet balance or external PayHere gateway.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm p-3.5 rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            {/* Payment Method Selectors */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'InAppWallet', label: 'Digital Wallet', icon: <FaWallet className="text-lg text-emerald-500" /> },
                { id: 'Card', label: 'Credit/Debit Card', icon: <FaRegCreditCard className="text-lg" /> },
                { id: 'LankaQR', label: 'LankaQR Code', icon: <FaQrcode className="text-lg" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(item.id);
                    setError('');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                      : 'bg-slate-50 dark:bg-dark-bg border-slate-200 dark:border-dark-border hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic fields based on method selection */}
            <div className="bg-slate-50 dark:bg-dark-bg/60 p-5 rounded-2xl border border-slate-100 dark:border-dark-border/20 transition-all">
              {paymentMethod === 'InAppWallet' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-slate-200 dark:border-dark-border">
                    <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                      <FaWallet className="mr-1.5" /> Internal Digital Wallet Balance
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase">
                      Instant Payment
                    </span>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border space-y-3 font-semibold text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Current Wallet Balance:</span>
                      <strong className="text-slate-900 dark:text-white text-base">
                        LKR {currentWalletBal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Ticket Booking Total:</span>
                      <strong className="text-slate-900 dark:text-white">
                        LKR {totalAmount.toFixed(2)}
                      </strong>
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-dark-border pt-2.5 flex justify-between items-center">
                      <span>Remaining Balance After Deduction:</span>
                      <strong className={`text-base font-black ${
                        currentWalletBal >= totalAmount ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        LKR {(currentWalletBal - totalAmount).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {currentWalletBal >= totalAmount ? (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center space-x-2">
                      <FaCheckCircle className="flex-shrink-0 text-base text-emerald-600" />
                      <span>Sufficient wallet balance! Click "Pay with Digital Wallet" below to complete ticket booking.</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl space-y-3">
                      <p>⚠️ Insufficient wallet balance. You require LKR {(totalAmount - currentWalletBal).toFixed(2)} more to complete this booking.</p>
                      <Link
                        to="/wallet"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition"
                      >
                        <FaPlusCircle />
                        <span>Add Money to Wallet via PayHere</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-semibold pb-1">
                    <FaLock />
                    <span>Secure PayHere Credit / Debit Card Gateway</span>
                  </div>
                  <div className="space-y-3 text-sm font-semibold">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-sm"
                        placeholder="4512 8412 9015 6124"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2 border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-sm"
                          placeholder="12/29"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CVV Code</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2 border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-sm"
                          placeholder="•••"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'LankaQR' && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white p-3 rounded-lg border-2 border-slate-200 shadow-sm flex items-center justify-center w-36 h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="9" y="9" width="12" height="12" fill="white" />
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="79" y="9" width="12" height="12" fill="white" />
                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="9" y="79" width="12" height="12" fill="white" />
                      <rect x="35" y="10" width="10" height="5" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">LankaQR Standard</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold max-w-sm">
                      Scan using banking apps to pay <strong>LKR {totalAmount.toFixed(2)}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Fare breakdown */}
        <aside className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border/40 pb-2.5">
            Checkout Summary
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5 bg-slate-50 dark:bg-dark-bg p-3.5 rounded-xl border border-slate-100 dark:border-dark-border/20">
              <span className="text-slate-400 font-bold block uppercase">Express Coach</span>
              <strong className="text-sm text-slate-800 dark:text-white">{selectedBus.bus.name}</strong>
              <p className="text-slate-500 dark:text-slate-400">{selectedBus.bus.busNo}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2 space-y-1">
                <span className="text-slate-400 font-bold block uppercase">Route</span>
                <p className="text-slate-800 dark:text-slate-200 font-bold">{route?.from} ➔ {route?.to}</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedBus.departureTime} departure</p>
              </div>
            </div>

            {/* Seats summary */}
            <div className="flex justify-between border-b pb-3 border-slate-100 dark:border-dark-border/30">
              <span className="text-slate-400 font-bold">Selected Seats</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{selectedSeats.join(', ')}</span>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Fare ({selectedSeats.length} × LKR {fare})</span>
                <span>LKR {basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Expressway Toll</span>
                <span>LKR {tollFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Transit Booking Fee</span>
                <span>LKR {bookingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-white font-extrabold border-t border-dashed border-slate-200 dark:border-dark-border pt-2.5 text-base">
                <span>Grand Total</span>
                <span className="text-emerald-600 font-black">LKR {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={loading || (paymentMethod === 'InAppWallet' && currentWalletBal < totalAmount)}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-gray-900 disabled:text-slate-400 font-black rounded-2xl shadow-xl shadow-emerald-600/20 disabled:shadow-none transition cursor-pointer text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Pay LKR {totalAmount.toFixed(2)} with Digital Wallet</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400 mt-3.5">
                <FaLock />
                <span>PayHere 256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
