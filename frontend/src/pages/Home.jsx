import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaRoute, FaWifi, FaBolt, FaCrown, FaShieldAlt } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';
import { api } from '../services/api';

export default function Home() {
  const [routes, setRoutes] = useState([]);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('all');
  const [error, setError] = useState('');
  const { setSearchCriteria } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    api.getRoutes().then((data) => {
      setRoutes(data);
    });
  }, []);

  // Unique list of departure and destination hubs
  const departureHubs = [...new Set(routes.map((r) => r.from))];
  const destinationHubs = [...new Set(routes.map((r) => r.to))];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromCity || !toCity) {
      setError('Please select both Origin and Destination.');
      return;
    }
    if (fromCity === toCity) {
      setError('Origin and Destination cannot be the same.');
      return;
    }
    if (!date) {
      setError('Please choose a departure date.');
      return;
    }

    setError('');
    setSearchCriteria({ from: fromCity, to: toCity, date, timeSlot });
    navigate('/search');
  };

  const handlePopularRouteClick = (from, to) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    setSearchCriteria({ from, to, date: dateString, timeSlot: 'all' });
    navigate('/search');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1470&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center space-y-6 z-10">
          <span className="px-3.5 py-1 bg-gold-500/25 border border-gold-500/40 text-gold-400 text-xs font-extrabold uppercase tracking-widest rounded-full">
            Sri Lanka's Premier Highway Bus Network
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Travel Luxury across <span className="text-teal-400 bg-clip-text">Expressways</span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-slate-300">
            Book super luxury Volvo coaches and executive highway transit seats in seconds. Direct routes via Southern, Central, and Outer Circular Expressways.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-4xl mt-8 bg-white dark:bg-dark-card text-slate-800 dark:text-white p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-dark-border/40 text-left">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <FaMapMarkerAlt className="text-teal-500" />
                  <span>From (Origin)</span>
                </label>
                <select
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select Origin Hub</option>
                  {departureHubs.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <FaMapMarkerAlt className="text-gold-500" />
                  <span>To (Destination)</span>
                </label>
                <select
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select Destination Hub</option>
                  {destinationHubs.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <FaCalendarAlt className="text-teal-500" />
                  <span>Departure Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full p-3 bg-primary-500 hover:bg-primary-600 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 dark:shadow-teal-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-12"
                >
                  <FaSearch />
                  <span>Search Buses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popular Highway Routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Popular Expressway Connections</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Quickly book high-frequency services across our busiest inter-city routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { from: 'Colombo (Makumbura)', to: 'Galle (MMC)', desc: 'Southern Expressway E01 • 1.5 Hours', price: '420 LKR' },
            { from: 'Colombo (Makumbura)', to: 'Matara (MMC)', desc: 'Southern Expressway E01 • 2 Hours', price: '550 LKR' },
            { from: 'Colombo (Bastian Mawatha)', to: 'Jaffna', desc: 'Direct AC Coach • A9 Highway', price: '3,200 LKR' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-primary-500 dark:text-teal-400 font-extrabold tracking-wider bg-primary-50 dark:bg-teal-950/20 px-3 py-1 rounded-full self-start w-fit">
                  <FaRoute className="mr-1" />
                  <span>EXPRESSWAY ROUTE</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                    {item.from.split(' ')[0]} to {item.to.split(' ')[0]}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </div>
                <div className="flex items-baseline space-x-1 pt-2">
                  <span className="text-xs text-slate-400">Fares from</span>
                  <span className="text-lg font-black text-gold-600 dark:text-gold-400">{item.price}</span>
                </div>
              </div>
              <button
                onClick={() => handlePopularRouteClick(item.from, item.to)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 hover:bg-primary-500 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white py-3 font-semibold text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-dark-border/40 transition-all cursor-pointer text-center"
              >
                Book Seats Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid (Expressway Comfort) */}
      <div className="bg-slate-100 dark:bg-dark-card/50 border-y border-slate-200/50 dark:border-dark-border/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Unmatched Travel Comfort</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Our registered luxury buses undergo quarterly safety and hygiene inspections to guarantee five-star transit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm text-center space-y-3 border border-slate-100 dark:border-dark-border/30">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/20 text-primary-500 dark:text-teal-400 rounded-xl flex items-center justify-center mx-auto text-xl">
                <FaWifi />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">High-Speed Wi-Fi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Stay connected on the expressway with high-speed complimentary Wi-Fi.</p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm text-center space-y-3 border border-slate-100 dark:border-dark-border/30">
              <div className="w-12 h-12 bg-gold-50 dark:bg-gold-950/20 text-gold-500 dark:text-gold-400 rounded-xl flex items-center justify-center mx-auto text-xl">
                <FaBolt />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">USB Charging</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Keep your devices charged at every seat with universal USB slots.</p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm text-center space-y-3 border border-slate-100 dark:border-dark-border/30">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/20 text-primary-500 dark:text-teal-400 rounded-xl flex items-center justify-center mx-auto text-xl">
                <FaCrown />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Premium Cabins</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Relax in fully reclining leather armchairs with footrests and legroom.</p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm text-center space-y-3 border border-slate-100 dark:border-dark-border/30">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl flex items-center justify-center mx-auto text-xl">
                <FaShieldAlt />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Insured Travel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Every ticket includes standard passenger medical and luggage insurance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
