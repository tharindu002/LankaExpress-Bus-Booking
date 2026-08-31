import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaQrcode, FaDownload, FaHome, FaUser, FaRoute, FaCalendarAlt } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';

export default function BookingSuccess() {
  const { currentBooking, resetBookingFlow, selectedBus } = useBooking();
  const navigate = useNavigate();

  // Reset booking flow on component unmount
  useEffect(() => {
    return () => {
      // Don't reset if user stays on success, but clear when navigating away
    };
  }, []);

  if (!currentBooking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Active Booking</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">No successful reservation was found in this session. Search buses to book a ticket.</p>
        <Link to="/search" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold">
          Search Buses
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleHomeReturn = () => {
    resetBookingFlow();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 print:p-0 print:m-0 print:bg-white">
      {/* Visual Success Alert */}
      <div className="text-center space-y-3 print:hidden">
        <FaCheckCircle className="text-6xl text-teal-500 mx-auto animate-bounce" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Reservation Confirmed!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Your payment has been processed successfully. Your ticket details are shown below. A confirmation SMS/WhatsApp message has been sent.
        </p>
      </div>

      {/* Stylized Bus E-Ticket */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-slate-300 print:rounded-none">

        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest block">EXPRESSWAY BOARDING PASS</span>
            <strong className="text-lg tracking-wider text-white">LANKA<span className="text-gold-500">EXPRESS</span></strong>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">BOOKING REF</span>
            <span className="font-mono font-extrabold text-gold-400 text-lg tracking-wider">{currentBooking.bookingRef}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          {/* Journey details */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Passenger Name</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{currentBooking.passengerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">National ID (NIC)</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{currentBooking.passengerNic}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Mobile</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{currentBooking.passengerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Seats Reserved</span>
                <span className="text-sm font-extrabold text-teal-500 dark:text-teal-400">{currentBooking.seats.join(', ')}</span>
              </div>
            </div>

            {/* Travel route detail */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Origin Hub</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedBus?.route?.from || 'Colombo (Makumbura)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Hub</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedBus?.route?.to || 'Galle (MMC)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Departure Schedule</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedBus?.departureTime || '06:30 AM'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Travel Date </span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {currentBooking.bookingDate}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Pricing (Simulated Ticket stub) */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-dark-border/40 space-y-4">

            {/* Real Scannable QR code */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentBooking.bookingRef)}`}
                alt={`QR Ticket ${currentBooking.bookingRef}`}
                className="w-36 h-36 rounded-lg object-contain"
              />
              <span className="text-[11px] font-mono font-black text-slate-800 mt-2 uppercase tracking-wider">
                {currentBooking.bookingRef}
              </span>
            </div>

            <div className="text-center font-semibold">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount Paid</span>
              <strong className="text-lg text-gold-500">{currentBooking.totalAmount} LKR</strong>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black block mt-0.5 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                TRANSACTION PAID
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Footer disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-t border-slate-100 dark:border-dark-border/40 text-[10px] text-slate-400 text-center font-medium">
          Please present this digital ticket QR code at the bus boarding gate. Keep your National ID handy. For customer care, call 1969.
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <FaDownload />
          <span>Download PDF Ticket</span>
        </button>

        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
        >
          <FaUser />
          <span>Go to My Dashboard</span>
        </Link>

        <button
          onClick={handleHomeReturn}
          className="w-full sm:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <FaHome />
          <span>Book Another Ticket</span>
        </button>
      </div>
    </div>
  );
}
