import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaInfoCircle, FaCrown, FaUserTie, FaDoorOpen } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';

export default function SeatSelection() {
  const { selectedBus, selectedSeats, toggleSeat, clearSelectedSeats } = useBooking();
  const navigate = useNavigate();

  if (!selectedBus) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Bus Selected</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Please select a bus schedule from the search page to reserve seats.</p>
        <Link to="/search" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold shadow-md">
          Back to Search
        </Link>
      </div>
    );
  }

  const { reservedSeats = [], fare, route, bus } = selectedBus;
  const tollFee = route?.tollFee || 0;
  const is2Plus1 = bus?.seatLayout === '2+1' || bus?.seat_layout === '2+1';
  const totalSeats = bus?.totalSeats || bus?.total_seats || (is2Plus1 ? 28 : 40);

  // Dynamic row calculation
  // For 2+2: 4 seats per row -> columns: A, B (Left) and C, D (Right)
  // For 2+1 VIP: 3 seats per row -> columns: A (Left VIP Single) and B, C (Right VIP Pair)
  const seatsPerRow = is2Plus1 ? 3 : 4;
  const rowCount = Math.ceil(totalSeats / seatsPerRow);
  const rows = Array.from({ length: rowCount }, (_, i) => i + 1);

  const leftColumns = is2Plus1 ? ['A'] : ['A', 'B'];
  const rightColumns = is2Plus1 ? ['B', 'C'] : ['C', 'D'];

  const handleSeatClick = (seatId) => {
    if (reservedSeats.includes(seatId)) return;
    toggleSeat(seatId);
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout');
  };

  // Pricing calculations
  const basePrice = selectedSeats.length * fare;
  const bookingFee = selectedSeats.length > 0 ? 150 : 0; // standard booking fee in LKR
  const totalAmount = basePrice + tollFee + bookingFee;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Back Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          to={`/bus/${selectedBus.id}`}
          className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Bus Details</span>
        </Link>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-xs font-extrabold rounded-lg border border-teal-200 dark:border-teal-900/40">
            {is2Plus1 ? '👑 2+1 VIP Executive Suite Layout' : '🚌 2+2 Standard Luxury Layout'}
          </span>
          <button
            onClick={clearSelectedSeats}
            disabled={selectedSeats.length === 0}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 font-semibold disabled:opacity-40 transition-colors cursor-pointer self-start md:self-auto"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Seat Map Visual representation */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-6 shadow-sm flex flex-col items-center">
          <div className="w-full text-center mb-4 border-b border-slate-100 dark:border-dark-border/40 pb-3">
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">
              Interactive Cabin Layout ({is2Plus1 ? '2+1 VIP Sleeper' : '2+2 Luxury AC'})
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {bus?.name} • {bus?.busNo ? `Plate ${bus.busNo}` : 'Verified Coach'} • {totalSeats} Total Passenger Capacity
            </p>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-xs font-semibold mb-8 w-full border-b pb-4 border-slate-100 dark:border-dark-border/30">
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-600 rounded"></div>
              <span className="text-slate-600 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 bg-blue-600 rounded pulse-selected"></div>
              <span className="text-slate-600 dark:text-slate-300">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 bg-rose-500 dark:bg-rose-600 rounded"></div>
              <span className="text-slate-600 dark:text-slate-300">Reserved</span>
            </div>
          </div>

          {/* Bus Frame Representation */}
          <div className={`w-full ${is2Plus1 ? 'max-w-xs' : 'max-w-sm'} border-4 border-slate-300 dark:border-dark-border rounded-t-[50px] rounded-b-[20px] bg-slate-50 dark:bg-slate-900/60 p-5 relative shadow-inner`}>
            {/* Front Windshield glass */}
            <div className="h-10 bg-slate-200 dark:bg-dark-border rounded-t-[35px] mb-6 flex items-center justify-center text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
              Cabin Windshield
            </div>

            {/* Front Row (Driver & Door) */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-dark-border/40">
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                <FaDoorOpen className="text-xs" />
                <span>Door</span>
              </div>
              <div className="px-3.5 py-1.5 bg-slate-300 dark:bg-dark-card border border-slate-400 dark:border-slate-700 rounded-md text-[10px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center space-x-1 shadow-sm">
                <FaUserTie className="text-xs text-primary-500" />
                <span>Driver</span>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="space-y-3">
              {rows.map((rowNo) => (
                <div
                  key={rowNo}
                  className={`grid ${is2Plus1 ? 'grid-cols-4' : 'grid-cols-5'} gap-2 items-center text-center`}
                >
                  {/* Left Column Seats */}
                  {leftColumns.map((col) => {
                    const seatId = `${col}${rowNo}`;
                    const isReserved = reservedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => handleSeatClick(seatId)}
                        disabled={isReserved}
                        title={`Seat ${seatId} (${is2Plus1 ? 'VIP Single Window' : 'Window/Aisle'})`}
                        className={`aspect-square p-1 rounded-md text-[11px] font-extrabold transition-all border flex flex-col justify-center items-center cursor-pointer shadow-sm ${
                          isReserved
                            ? 'bg-rose-500 text-white border-rose-600 opacity-80 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-700 pulse-selected font-black scale-105'
                            : is2Plus1
                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 hover:scale-105'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 hover:scale-105'
                        }`}
                      >
                        <FaCrown className="text-[8px] mb-0.5" />
                        <span>{seatId}</span>
                      </button>
                    );
                  })}

                  {/* Aisle */}
                  <div className="text-[9px] font-extrabold text-slate-300 dark:text-slate-700 uppercase select-none">
                    R{rowNo}
                  </div>

                  {/* Right Column Seats */}
                  {rightColumns.map((col) => {
                    const seatId = `${col}${rowNo}`;
                    const isReserved = reservedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => handleSeatClick(seatId)}
                        disabled={isReserved}
                        title={`Seat ${seatId}`}
                        className={`aspect-square p-1 rounded-md text-[11px] font-extrabold transition-all border flex flex-col justify-center items-center cursor-pointer shadow-sm ${
                          isReserved
                            ? 'bg-rose-500 text-white border-rose-600 opacity-80 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-700 pulse-selected font-black scale-105'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 hover:scale-105'
                        }`}
                      >
                        <FaCrown className="text-[8px] mb-0.5" />
                        <span>{seatId}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Engine / Rear frame */}
            <div className="h-5 bg-slate-300 dark:bg-dark-border rounded-b-lg mt-8 text-[9px] text-slate-400 font-extrabold tracking-widest text-center flex items-center justify-center">
              REAR ENGINE
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Booking Checkout Info */}
        <aside className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border/40 pb-2.5">
            Reservation Summary
          </h3>

          <div className="space-y-4">
            <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-dark-bg p-3.5 rounded-xl border border-slate-100 dark:border-dark-border/20">
              <span className="text-slate-400 font-bold block uppercase tracking-wider">Journey Details</span>
              <strong className="text-sm text-slate-800 dark:text-white block">
                {route?.from} ➔ {route?.to}
              </strong>
              <p className="text-slate-600 dark:text-slate-300 font-semibold">{bus?.name} ({route?.routeNo})</p>
              <p className="text-teal-600 dark:text-teal-400 font-bold">{selectedBus.departureTime} departure • {selectedBus.duration}</p>
              {route?.highwayRoute && (
                <span className="inline-block text-[10px] px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded font-bold">
                  {route.highwayRoute}
                </span>
              )}
            </div>

            {/* Selected seats list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selected Seats</span>
              {selectedSeats.length === 0 ? (
                <span className="text-xs text-rose-500 font-bold block bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  No seats selected yet. Please click on the cabin seats above.
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-lg"
                    >
                      Seat {seat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing details */}
            <div className="space-y-2.5 border-t border-slate-100 dark:border-dark-border/40 pt-4 text-sm font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Fare ({selectedSeats.length} × {fare} LKR)</span>
                <span>{basePrice} LKR</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Expressway Toll Fee</span>
                <span>{tollFee} LKR</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Transit Booking Fee</span>
                <span>{bookingFee} LKR</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-white font-extrabold border-t border-dashed border-slate-200 dark:border-dark-border pt-2.5 text-base">
                <span>Total Fare</span>
                <span className="text-gold-500 font-black">{totalAmount} LKR</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCheckout}
              disabled={selectedSeats.length === 0}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 font-extrabold rounded-xl shadow-lg disabled:shadow-none hover:scale-[1.02] disabled:scale-100 active:scale-[0.98] transition cursor-pointer text-center"
            >
              Confirm & Checkout
            </button>
            <div className="flex items-center space-x-1 mt-3 justify-center text-[10px] text-slate-400">
              <FaInfoCircle />
              <span>Seats are temporarily held for 10 minutes</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
