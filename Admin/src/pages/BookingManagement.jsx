import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Eye, Ban, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/bookings');
      setBookings(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`/api/admin/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason || 'Admin administrative cancellation',
      });
      setMessage(res.data.message);
      setModalOpen(false);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking cancellation failed');
    }
  };

  const columns = [
    { header: 'Booking Ref', accessor: 'bookingRef' },
    { header: 'Passenger Name', accessor: 'passengerName' },
    { header: 'Passenger Email', accessor: 'passengerEmail' },
    { header: 'Seats', render: (row) => row.seats.join(', ') },
    {
      header: 'Total Amount',
      render: (row) => <span className="font-bold text-slate-100">LKR {row.totalAmount}</span>,
    },
    { header: 'Payment Method', accessor: 'paymentMethod' },
    { header: 'Payment Status', render: (row) => <StatusBadge status={row.paymentStatus} /> },
    { header: 'Booking Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Travel Date', accessor: 'bookingDate' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/bookings/${row._id}`)} className="btn btn-secondary btn-xs">
            <Eye className="w-3.5 h-3.5" /> Details
          </button>
          {row.status === 'Active' && (
            <button
              onClick={() => {
                setSelectedBooking(row);
                setModalOpen(true);
              }}
              className="btn btn-danger btn-xs"
              title="Cancel & Refund to Wallet"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Booking Management</h2>
          <p className="text-xs text-slate-400">View ticket reservations, passenger records, QR tickets & process refunds</p>
        </div>
        <button onClick={fetchBookings} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading ticket bookings...</div>
        ) : (
          <DataTable
            columns={columns}
            data={bookings}
            searchPlaceholder="Search ref, passenger name, email..."
            filterOptions={[
              {
                key: 'status',
                label: 'Filter Status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ],
              },
            ]}
            filename="lankaexpressway_bookings.csv"
          />
        )}
      </div>

      {/* Booking Cancellation & Refund Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Cancel Booking: ${selectedBooking?.bookingRef}`}
      >
        <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
          <p className="text-slate-300">
            Cancelling this booking will release seat(s){' '}
            <strong className="text-white">{selectedBooking?.seats.join(', ')}</strong> back to the schedule and process an automatic refund of{' '}
            <strong className="text-emerald-400">LKR {selectedBooking?.totalAmount}</strong> into the passenger's Digital Wallet.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Cancellation</label>
            <textarea
              required
              rows="3"
              className="input-control text-xs"
              placeholder="e.g. Bus service breakdown / Passenger cancellation request..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary text-xs" onClick={() => setModalOpen(false)}>
              Back
            </button>
            <button type="submit" className="btn btn-danger text-xs">
              Confirm Cancellation & Refund
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
