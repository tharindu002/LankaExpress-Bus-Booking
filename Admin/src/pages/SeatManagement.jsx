import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { VisualSeatMap } from '../components/VisualSeatMap';
import { Modal } from '../components/Modal';
import { Armchair, ShieldAlert, RefreshCw } from 'lucide-react';

export const SeatManagement = () => {
  const [searchParams] = useSearchParams();
  const initialScheduleId = searchParams.get('scheduleId') || '';

  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(initialScheduleId);
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Seat Action Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSeat, setActiveSeat] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch available schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get('/api/admin/schedules');
        setSchedules(res.data.data);
        if (res.data.data.length > 0 && !selectedScheduleId) {
          setSelectedScheduleId(res.data.data[0].scheduleId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedules();
  }, []);

  // Fetch seat map details for selected schedule
  const fetchSeatDetails = async (schedId) => {
    if (!schedId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/admin/schedules/${schedId}/seats`);
      setSeatData(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedule seat details');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScheduleId) {
      fetchSeatDetails(selectedScheduleId);
    }
  }, [selectedScheduleId]);

  const handleSeatClick = (seat, status, bookingInfo) => {
    setActiveSeat(seat);
    setActiveStatus(status);
    setActiveBooking(bookingInfo);
    setModalOpen(true);
  };

  const handleToggleSeat = async (action) => {
    setError('');
    setMessage('');
    try {
      const res = await axios.patch(`/api/admin/schedules/${selectedScheduleId}/seats`, {
        action,
        seat: activeSeat,
      });
      setMessage(res.data.message);
      setModalOpen(false);
      fetchSeatDetails(selectedScheduleId);
    } catch (err) {
      setError(err.response?.data?.message || 'Seat update rejected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Interactive Seat Layout & Lock Manager</h2>
          <p className="text-xs text-slate-400">View real-time bus seat availability and manage administrative seat holds safely</p>
        </div>

        {/* Schedule Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Select Schedule:</label>
          <select
            className="input-control text-xs w-64"
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
          >
            {schedules.map((s) => (
              <option key={s._id} value={s.scheduleId}>
                {s.scheduleId}: {s.departureTime} ({s.fare} LKR)
              </option>
            ))}
          </select>
          <button onClick={() => fetchSeatDetails(selectedScheduleId)} className="btn btn-secondary text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
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

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading visual seat layout...</div>
      ) : seatData ? (
        <VisualSeatMap
          seatLayout={seatData.bus?.seatLayout || '2+2'}
          totalSeats={seatData.bus?.totalSeats || 40}
          reservedSeats={seatData.reservedSeats || []}
          bookedSeatsMap={seatData.bookedSeatsMap || {}}
          onSeatClick={handleSeatClick}
        />
      ) : (
        <div className="py-12 text-center text-slate-500 text-sm">Please select a valid bus schedule</div>
      )}

      {/* Seat Details / Toggle Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Seat ${activeSeat} Control Panel`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <p><span className="text-slate-400">Seat Designation:</span> <strong className="text-slate-100">{activeSeat}</strong></p>
            <p><span className="text-slate-400">Current Status:</span> <strong className="text-blue-400 uppercase">{activeStatus}</strong></p>
          </div>

          {activeBooking ? (
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-blue-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-300">
                <ShieldAlert className="w-4 h-4 text-blue-400" /> Active Booking Details
              </p>
              <p>Passenger: {activeBooking.passengerName}</p>
              <p>Booking Reference: {activeBooking.bookingRef}</p>
              <p>Contact Phone: {activeBooking.passengerPhone}</p>
              <p className="text-[11px] text-slate-400 italic pt-1">
                To prevent double bookings, active paid seats cannot be manually overridden. Cancel the booking from Booking Management to refund & release seats safely.
              </p>
            </div>
          ) : (
            <p className="text-slate-300">
              You can toggle administrative holds for this seat. Reserving a seat will block users from selecting it online.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn btn-secondary text-xs" onClick={() => setModalOpen(false)}>
              Close
            </button>
            {!activeBooking && activeStatus === 'AVAILABLE' && (
              <button
                className="btn btn-primary text-xs"
                onClick={() => handleToggleSeat('RESERVE')}
              >
                Reserve / Lock Seat
              </button>
            )}
            {!activeBooking && activeStatus === 'RESERVED' && (
              <button
                className="btn btn-success text-xs"
                onClick={() => handleToggleSeat('RELEASE')}
              >
                Release Seat
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
