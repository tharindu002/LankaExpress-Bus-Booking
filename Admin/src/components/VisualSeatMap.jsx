import React from 'react';

export const VisualSeatMap = ({
  seatLayout = '2+2',
  totalSeats = 40,
  reservedSeats = [],
  bookedSeatsMap = {},
  onSeatClick,
}) => {
  // Generate seats array: e.g. A1, A2, B1, B2...
  const seats = [];
  const rows = Math.ceil(totalSeats / 4);
  const colLabels = seatLayout === '2+1' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];

  for (let r = 1; r <= rows; r++) {
    colLabels.forEach((col) => {
      if (seats.length < totalSeats) {
        seats.push(`${col}${r}`);
      }
    });
  }

  const getSeatStatus = (seat) => {
    if (bookedSeatsMap[seat]) return 'BOOKED';
    if (reservedSeats.includes(seat)) return 'RESERVED';
    return 'AVAILABLE';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h4 className="font-bold text-slate-100 text-sm">Visual Bus Seat Layout ({seatLayout})</h4>
          <p className="text-xs text-slate-400">Driver cabin at front. Click seat to manage status.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500"></span>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-500/20 border border-blue-500"></span>
            <span className="text-slate-300">Booked (Paid)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500"></span>
            <span className="text-slate-300">Reserved</span>
          </div>
        </div>
      </div>

      {/* Driver Wheel Indicator */}
      <div className="flex justify-end mb-6 pr-4">
        <div className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border border-slate-700">
          <span>🚍 Driver Cabin</span>
        </div>
      </div>

      {/* Seat Grid Container */}
      <div className="max-w-md mx-auto grid grid-cols-5 gap-3 bg-slate-950 p-6 rounded-xl border border-slate-800">
        {seats.map((seat, index) => {
          const status = getSeatStatus(seat);
          const bookingInfo = bookedSeatsMap[seat];

          let seatStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-800/50';
          if (status === 'BOOKED') {
            seatStyle = 'bg-blue-950/80 border-blue-500/80 text-blue-200 cursor-not-allowed';
          } else if (status === 'RESERVED') {
            seatStyle = 'bg-amber-950/80 border-amber-500/80 text-amber-200 hover:bg-amber-800/50';
          }

          // Aisle spacing after 2 seats in 2+2 layout
          const isAisle = (index + 1) % 4 === 2 && seatLayout === '2+2';

          return (
            <React.Fragment key={seat}>
              <button
                type="button"
                onClick={() => onSeatClick && onSeatClick(seat, status, bookingInfo)}
                className={`flex flex-col items-center justify-center h-12 rounded-lg border font-bold text-xs transition-all relative group ${seatStyle}`}
                title={bookingInfo ? `Booked by ${bookingInfo.passengerName} (${bookingInfo.bookingRef})` : `Seat ${seat} (${status})`}
              >
                <span>{seat}</span>
                <span className="text-[9px] opacity-75 font-normal">{status.toLowerCase()}</span>

                {/* Tooltip on hover */}
                {bookingInfo && (
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-44 bg-slate-900 text-white text-[11px] p-2 rounded-lg border border-slate-700 shadow-2xl pointer-events-none">
                    <p className="font-semibold text-blue-400">{bookingInfo.passengerName}</p>
                    <p className="text-slate-400">Ref: {bookingInfo.bookingRef}</p>
                    <p className="text-slate-400">Ph: {bookingInfo.passengerPhone}</p>
                  </div>
                )}
              </button>

              {/* Render Aisle Gap */}
              {isAisle && <div className="w-4"></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
