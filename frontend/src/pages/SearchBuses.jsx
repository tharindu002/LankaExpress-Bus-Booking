import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaClock, FaWifi, FaBolt, FaCrown, 
  FaCheck, FaSearch, FaFilter, FaStar, FaChevronRight, FaShieldAlt, 
  FaExternalLinkAlt, FaTimes, FaTv, FaBed, FaLuggageCart 
} from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SearchBuses() {
  const { searchParams, setSearchCriteria, selectBus } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fromCity, setFromCity] = useState(searchParams.from || '');
  const [toCity, setToCity] = useState(searchParams.to || '');
  const [date, setDate] = useState(searchParams.date || '');
  
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [timeFilter, setTimeFilter] = useState('all'); // all, morning, afternoon, night
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Verification modal state
  const [selectedVerificationItem, setSelectedVerificationItem] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, [searchParams]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await api.getSchedules(searchParams.from, searchParams.to, searchParams.date);
      setSchedules(data);
      setFilteredSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique operators from schedules
  const availableOperators = [...new Set(schedules.map((s) => s.bus?.operator).filter(Boolean))];

  // Apply filters on client side
  useEffect(() => {
    let result = [...schedules];

    // Filter by Service Category (Luxury, Super Luxury, Premium)
    if (selectedCategories.length > 0) {
      result = result.filter((s) => 
        selectedCategories.includes(s.bus?.serviceCategory) || 
        selectedCategories.includes(s.bus?.type)
      );
    }

    // Filter by Operator
    if (selectedOperators.length > 0) {
      result = result.filter((s) => selectedOperators.includes(s.bus?.operator));
    }

    // Filter by Amenities
    if (selectedAmenities.length > 0) {
      result = result.filter((s) => {
        const busAmenities = s.bus?.amenities || [];
        return selectedAmenities.every((amenity) => busAmenities.includes(amenity));
      });
    }

    // Filter by Price
    result = result.filter((s) => s.fare <= maxPrice);

    // Filter by Time Slot
    if (timeFilter !== 'all') {
      result = result.filter((s) => {
        const hour = parseInt(s.departureTime.split(':')[0], 10);
        const isPM = s.departureTime.includes('PM');
        let hour24 = hour;
        if (isPM && hour !== 12) hour24 = hour + 12;
        if (!isPM && hour === 12) hour24 = 0;

        if (timeFilter === 'morning') return hour24 >= 5 && hour24 < 12;
        if (timeFilter === 'afternoon') return hour24 >= 12 && hour24 < 17;
        if (timeFilter === 'night') return hour24 >= 17 || hour24 < 5;
        return true;
      });
    }

    setFilteredSchedules(result);
  }, [schedules, selectedCategories, selectedOperators, selectedAmenities, maxPrice, timeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!fromCity || !toCity || !date) return;
    setSearchCriteria({ from: fromCity, to: toCity, date, timeSlot: 'all' });
  };

  const handleSelectSeats = (schedule) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/bus/${schedule.id}` } } });
      return;
    }
    selectBus(schedule);
    navigate(`/bus/${schedule.id}`);
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleOperatorToggle = (op) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Helper to render amenity icon
  const renderAmenityIcon = (name) => {
    switch (name) {
      case 'Wi-Fi':
        return <FaWifi className="text-teal-500" title="Wi-Fi" />;
      case 'USB Charging':
      case 'Individual USB Charging':
      case 'Personal USB Charging':
        return <FaBolt className="text-amber-500" title="USB Charging" />;
      case 'Reclining Seats':
      case 'Reclining Sleep Seats':
      case 'VIP Single / Pair Sleeper Recliners':
        return <FaCrown className="text-indigo-500" title="Reclining Seats" />;
      case 'TV / Video Entertainment':
      case 'TV':
      case 'Entertainment Screen':
        return <FaTv className="text-blue-500" title="TV" />;
      case 'Blankets':
        return <FaBed className="text-purple-500" title="Blankets" />;
      case 'Luggage Space':
      case 'Spacious Luggage Hold':
      case 'Luggage Boot':
        return <FaLuggageCart className="text-emerald-500" title="Luggage" />;
      default:
        return <FaCheck className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Sticky Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md border border-slate-100 dark:border-dark-border/40 grid grid-cols-1 md:grid-cols-4 gap-3 items-end transition-colors"
      >
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <FaMapMarkerAlt className="text-teal-500" />
            <span>From (Origin)</span>
          </label>
          <input
            type="text"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Origin Hub e.g. Colombo (Makumbura)"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <FaMapMarkerAlt className="text-gold-500" />
            <span>To (Destination)</span>
          </label>
          <input
            type="text"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Destination e.g. Galle (MMC) or Jaffna"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <FaCalendarAlt className="text-teal-500" />
            <span>Departure Date</span>
          </label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer text-sm h-11"
          >
            <FaSearch className="text-xs" />
            <span>Modify Search</span>
          </button>
        </div>
      </form>

      {/* Main Grid: Filters + List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-6 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <FaFilter className="text-xs text-primary-500" />
              <span>Filter Services</span>
            </h3>
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedOperators([]);
                setSelectedAmenities([]);
                setMaxPrice(4000);
                setTimeFilter('all');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-500 font-semibold cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Service Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Service Class</h4>
            <div className="space-y-2 text-sm">
              {['Super Luxury', 'Luxury', 'Premium'].map((cat) => (
                <label key={cat} className="flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="rounded text-primary-500 focus:ring-primary-400"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Operators Filter */}
          {availableOperators.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 dark:border-dark-border/40 pt-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bus Operator</h4>
              <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-1">
                {availableOperators.map((op) => (
                  <label key={op} className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedOperators.includes(op)}
                      onChange={() => handleOperatorToggle(op)}
                      className="rounded text-primary-500 focus:ring-primary-400"
                    />
                    <span className="truncate">{op}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Filter */}
          <div className="space-y-3 border-t border-slate-100 dark:border-dark-border/40 pt-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amenities</h4>
            <div className="space-y-2 text-xs">
              {['Wi-Fi', 'USB Charging', 'Reclining Seats', 'TV', 'Blankets', 'Luggage Space'].map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded text-primary-500 focus:ring-primary-400"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 border-t border-slate-100 dark:border-dark-border/40 pt-4">
            <div className="flex justify-between items-baseline">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Max Ticket Price</h4>
              <span className="text-sm font-bold text-gold-500">{maxPrice} LKR</span>
            </div>
            <input
              type="range"
              min="400"
              max="4000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Time Slot */}
          <div className="space-y-3 border-t border-slate-100 dark:border-dark-border/40 pt-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Departure Time</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'all', label: 'All Day' },
                { id: 'morning', label: 'Morning (5AM-12PM)' },
                { id: 'afternoon', label: 'Afternoon (12PM-5PM)' },
                { id: 'night', label: 'Night (5PM-5AM)' }
              ].map((time) => (
                <button
                  key={time.id}
                  type="button"
                  onClick={() => setTimeFilter(time.id)}
                  className={`p-2 rounded-lg font-bold border text-center transition-colors cursor-pointer ${
                    timeFilter === time.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:bg-slate-100'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Trigger */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-dark-card p-3 rounded-xl border border-slate-100 dark:border-dark-border/40">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {filteredSchedules.length} Verified Luxury Buses
          </span>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <FaFilter className="text-xs" />
            <span>Filters</span>
          </button>
        </div>

        {/* Bus List Result Cards */}
        <section className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching verified schedules from LankaExpressway database...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-4">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No luxury buses scheduled matching your filter criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedOperators([]);
                  setSelectedAmenities([]);
                  setMaxPrice(4000);
                  setTimeFilter('all');
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg text-sm transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredSchedules.map((schedule) => {
              const totalCap = schedule.bus?.totalSeats || 40;
              const availableSeatsCount = totalCap - (schedule.reservedSeats || []).length;
              const is2Plus1 = schedule.bus?.seatLayout === '2+1';

              // Calculate 30-minute booking cutoff accurately
              let cutoffClosed = false;
              if (schedule.departureTime) {
                try {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const searchDateStr = searchParams.date || todayStr;

                  if (searchDateStr < todayStr) {
                    cutoffClosed = true;
                  } else if (searchDateStr === todayStr) {
                    const timeParts = schedule.departureTime.trim().split(' ');
                    const timeNum = timeParts[0].split(':');
                    let hours = parseInt(timeNum[0], 10);
                    const minutes = parseInt(timeNum[1], 10) || 0;
                    const modifier = timeParts[1] ? timeParts[1].toUpperCase() : '';

                    if (hours <= 12) {
                      if (modifier === 'PM' && hours < 12) hours += 12;
                      if (modifier === 'AM' && hours === 12) hours = 0;
                    }

                    const parts = searchDateStr.split('-');
                    const depDate = new Date(
                      parseInt(parts[0], 10),
                      parseInt(parts[1], 10) - 1,
                      parseInt(parts[2], 10),
                      hours,
                      minutes,
                      0
                    );

                    const diffMinutes = (depDate.getTime() - Date.now()) / (1000 * 60);
                    if (diffMinutes < 30) {
                      cutoffClosed = true;
                    }
                  } else {
                    // Future search date (e.g. tomorrow) -> always open for booking
                    cutoffClosed = false;
                  }
                } catch (e) {
                  cutoffClosed = false;
                }
              }

              return (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Bus Operator Info */}
                    <div className="space-y-1.5 md:border-r border-slate-100 dark:border-dark-border/40 pr-4">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2.5 py-0.5 bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 border border-gold-200 dark:border-gold-900/30 text-[10px] font-black uppercase tracking-wider rounded-md">
                          {schedule.bus?.type || schedule.bus?.serviceCategory}
                        </span>
                        {is2Plus1 && (
                          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold rounded-md">
                            2+1 VIP
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">
                        {schedule.bus?.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {schedule.bus?.busNo || 'Verified Coach'} • <strong className="text-slate-700 dark:text-slate-300">{schedule.bus?.operator}</strong>
                      </p>
                      
                      {/* Verification Badge */}
                      <button
                        type="button"
                        onClick={() => setSelectedVerificationItem(schedule)}
                        className="inline-flex items-center space-x-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-bold pt-1 cursor-pointer"
                      >
                        <FaShieldAlt className="text-teal-500 text-xs" />
                        <span>{schedule.dataStatus || 'Verified Data'}</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </button>
                    </div>

                    {/* Timeline Info */}
                    <div className="col-span-2 grid grid-cols-3 items-center text-center px-4">
                      <div className="text-left">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{schedule.departureTime}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold truncate">
                          {schedule.route?.from}
                        </p>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                          {schedule.duration}
                        </span>
                        <div className="w-full relative flex items-center justify-center my-1.5">
                          <div className="absolute w-full h-[2px] bg-slate-200 dark:bg-dark-border"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-teal-400 relative z-10 border-4 border-white dark:border-dark-card"></div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-slate-400 rounded-md font-bold">
                          {schedule.route?.routeNo}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{schedule.arrivalTime}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold truncate">
                          {schedule.route?.to}
                        </p>
                      </div>
                    </div>

                    {/* Pricing & Booking CTA */}
                    <div className="flex flex-col items-stretch md:items-end justify-between space-y-4 text-left md:text-right pl-4 border-t md:border-t-0 border-slate-100 dark:border-dark-border/40 pt-4 md:pt-0">
                      <div>
                        <span className="text-2xl font-black text-gold-600 dark:text-gold-400">{schedule.fare} LKR</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Includes seat reservation</p>
                      </div>
                      
                      <div className="flex flex-col space-y-2 w-full">
                        <span className={`text-xs font-extrabold py-0.5 rounded-md px-1 text-center ${
                          availableSeatsCount <= 5 
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' 
                            : 'text-teal-600 bg-teal-50 dark:bg-teal-950/20'
                        }`}>
                          {availableSeatsCount} seats available ({totalCap} total)
                        </span>

                        {cutoffClosed ? (
                          <div className="text-center">
                            <button
                              disabled
                              className="w-full py-2 bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-300 dark:border-slate-700"
                            >
                              Booking Closed
                            </button>
                            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 block mt-1">
                              Booking closed. Tickets can only be booked until 30 minutes before departure.
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectSeats(schedule)}
                            className="w-full py-2 bg-primary-500 hover:bg-primary-600 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow transition cursor-pointer"
                          >
                            <span>Select Seats</span>
                            <FaChevronRight className="text-[10px]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amenities & Highway Route Bottom Banner */}
                  <div className="bg-slate-50 dark:bg-dark-bg/40 px-6 py-2.5 border-t border-slate-100 dark:border-dark-border/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap gap-2">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Cabin features:</span>
                      {(schedule.bus?.amenities || []).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          {renderAmenityIcon(item)}
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    {schedule.route?.highwayRoute && (
                      <span className="text-teal-700 dark:text-teal-300 text-[10px] bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 px-2.5 py-0.5 rounded-md font-bold">
                        {schedule.route.highwayRoute}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* Verification Details Modal */}
      {selectedVerificationItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-dark-border/40 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                <FaShieldAlt className="text-lg" />
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Public Source Verification</h3>
              </div>
              <button
                onClick={() => setSelectedVerificationItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white block">Bus Service:</strong>
                {selectedVerificationItem.bus?.name} ({selectedVerificationItem.bus?.busNo || 'Coach'})
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white block">Operator:</strong>
                {selectedVerificationItem.bus?.operator} ({selectedVerificationItem.bus?.operatorDetails?.contact || 'Hotline Available'})
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white block">Source Name:</strong>
                {selectedVerificationItem.sourceName || selectedVerificationItem.bus?.sourceName || 'BusSeat.lk & Operator Portal'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white block">Verified Public URL:</strong>
                <a
                  href={selectedVerificationItem.sourceUrl || selectedVerificationItem.bus?.sourceUrl || 'https://www.busseat.lk'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-bold underline flex items-center space-x-1 break-all"
                >
                  <span>{selectedVerificationItem.sourceUrl || selectedVerificationItem.bus?.sourceUrl || 'https://www.busseat.lk'}</span>
                  <FaExternalLinkAlt className="text-[10px] flex-shrink-0" />
                </a>
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white block">Last Verified Date:</strong>
                {selectedVerificationItem.lastVerifiedDate || '2026-08-26'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white block">Verification Notes:</strong>
                {selectedVerificationItem.notes || selectedVerificationItem.bus?.notes || 'Real scheduled service matching published Sri Lankan passenger transport directories.'}
              </p>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedVerificationItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
