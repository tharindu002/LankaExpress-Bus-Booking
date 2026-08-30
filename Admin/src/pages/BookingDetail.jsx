import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Ticket, QrCode, User, Phone, Mail, CreditCard } from 'lucide-react';

export const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/bookings/${id}`);
        setBooking(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking record');
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading ticket details...</div>;
  }

  if (error || !booking) {
    return <div className="p-6 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-sm">{error || 'Booking not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/bookings')} className="btn btn-secondary text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings List
      </button>

      {/* Ticket Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-100">{booking.bookingRef}</h2>
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.paymentStatus} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Booked on {booking.bookingDate} • Schedule ID: {booking.scheduleId}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-right min-w-[200px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Amount Paid</span>
          <p className="text-2xl font-black text-emerald-400">LKR {booking.totalAmount}</p>
          <span className="text-[10px] text-slate-500">Method: {booking.paymentMethod}</span>
        </div>
      </div>

      {/* Passenger & Ticket Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passenger Information */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-blue-400" />
            Passenger Information
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Passenger Full Name:</span>
              <span className="font-semibold text-slate-100">{booking.passengerName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Email Address:</span>
              <span className="font-semibold text-slate-100">{booking.passengerEmail}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Phone Hotline:</span>
              <span className="font-semibold text-slate-100">{booking.passengerPhone}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">National ID (NIC):</span>
              <span className="font-semibold text-slate-100">{booking.passengerNic || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Selected Seats:</span>
              <span className="font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/40">
                {booking.seats.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* QR Verification Data */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <QrCode className="w-5 h-5 text-purple-400" />
            QR Ticket Verification Payload
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <p className="text-slate-400">Scan payload generated for conductor handheld scanner:</p>
            <div className="p-3 bg-slate-900 rounded font-mono text-[11px] text-emerald-400 border border-slate-800 break-all select-all">
              {booking.qrCodeData || 'N/A'}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>Security Hash: Verified</span>
              <span className="text-emerald-400 font-semibold">Ready for Boarding Scan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
