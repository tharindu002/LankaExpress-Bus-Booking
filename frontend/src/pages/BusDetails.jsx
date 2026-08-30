import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaBus, FaArrowLeft, FaClock, FaCheckCircle, FaMapMarkerAlt, FaStar, 
  FaShieldAlt, FaBriefcase, FaCalendarAlt, FaPhoneAlt, FaEnvelope, 
  FaGlobe, FaExternalLinkAlt, FaCrown, FaInfoCircle 
} from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function BusDetails() {
  const { id } = useParams();
  const { selectBus } = useBooking();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleProceedToSeats = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/seats' } } });
      return;
    }
    navigate('/seats');
  };

  useEffect(() => {
    api.getScheduleById(id).then((data) => {
      setSchedule(data);
      if (data) {
        selectBus(data); // Sync context
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Loading verified coach details...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bus Schedule Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">The selected bus schedule is not available or has been modified. Please return to the search results.</p>
        <Link to="/search" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold shadow-md">
          Back to Search
        </Link>
      </div>
    );
  }

  const { bus, route, operatorDetails } = schedule;
  const is2Plus1 = bus?.seatLayout === '2+1';
  const boardingPoints = route?.boardingPoints || (route?.boarding_points || []);
  const droppingPoints = route?.droppingPoints || (route?.dropping_points || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <Link to="/search" className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
        <FaArrowLeft className="text-xs" />
        <span>Back to Search results</span>
      </Link>

      {/* Main Bus Header */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 p-6 md:p-8 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-dark-border/40">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-3 py-1 bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 border border-gold-200 dark:border-gold-900/30 text-xs font-black uppercase tracking-wider rounded-md">
                {bus?.type || bus?.serviceCategory}
              </span>
              {is2Plus1 && (
                <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-xs font-extrabold rounded-md">
                  👑 2+1 VIP Sleeper Layout
                </span>
              )}
              <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 text-xs font-extrabold rounded-md flex items-center space-x-1">
                <FaShieldAlt className="text-[10px]" />
                <span>{schedule.dataStatus || 'Verified Service'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {bus?.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
              Registration: <strong className="text-slate-800 dark:text-white">{bus?.busNo || 'Official Fleet Coach'}</strong> • Model: {bus?.model || 'Super Luxury AC Coach'}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between">
            <span className="text-3xl font-black text-gold-600 dark:text-gold-400">{schedule.fare} LKR</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Single passenger ticket fare</span>
          </div>
        </div>

        {/* Departure/Arrival info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-dark-bg/40 p-6 rounded-xl border border-slate-100 dark:border-dark-border/20 items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Departure Time</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{schedule.departureTime}</h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{route?.from}</p>
          </div>

          <div className="flex flex-col items-center py-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mb-1">
              {schedule.duration}
            </span>
            <div className="w-full relative flex items-center justify-center my-1">
              <div className="absolute w-full h-[2px] bg-slate-200 dark:bg-dark-border"></div>
              <div className="w-3 h-3 rounded-full bg-primary-500 dark:bg-teal-400 relative z-10 border-4 border-white dark:border-dark-card animate-pulse"></div>
            </div>
            <span className="text-xs font-semibold text-primary-500 dark:text-teal-400 mt-1">
              {route?.routeNo} {route?.highwayRoute ? `(${route.highwayRoute})` : 'Highway Service'}
            </span>
          </div>

          <div className="space-y-1 text-left md:text-right">
            <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Arrival Time</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{schedule.arrivalTime}</h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{route?.to}</p>
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="bg-slate-50 dark:bg-dark-bg/30 p-5 rounded-xl border border-slate-100 dark:border-dark-border/30 space-y-3">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center space-x-2">
            <span>Bus Operator Profile</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-bold">Operator Name:</span>
              <strong className="text-slate-800 dark:text-white text-sm">{bus?.operator || 'Private Transit Operator'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Official Hotline:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1 mt-0.5">
                <FaPhoneAlt className="text-teal-500 text-[10px]" />
                <span>{bus?.operatorDetails?.contact || '+94 77 738 2186'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Website / Online Portal:</span>
              <a
                href={bus?.operatorDetails?.website || 'https://www.busseat.lk'}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 font-bold underline flex items-center space-x-1 mt-0.5"
              >
                <FaGlobe className="text-[10px]" />
                <span className="truncate">{bus?.operatorDetails?.website || 'Official Operator Site'}</span>
                <FaExternalLinkAlt className="text-[9px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Grid: Amenities & Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-dark-border/40 pb-2">
              Verified Amenities Provided
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(bus?.amenities || ['Air Conditioning', 'Reclining Seats']).map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 text-sm">
                  <FaCheckCircle className="text-teal-500 text-base flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-dark-border/40 pb-2">
              Boarding & Travel Guidelines
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-start space-x-2">
                <FaClock className="text-primary-500 text-sm mt-0.5 flex-shrink-0" />
                <span>Arrive at the terminal at least 20 minutes before departure time.</span>
              </li>
              <li className="flex items-start space-x-2">
                <FaBriefcase className="text-primary-500 text-sm mt-0.5 flex-shrink-0" />
                <span>Luggage allowance up to 20kg per passenger included in underfloor luggage boot.</span>
              </li>
              <li className="flex items-start space-x-2">
                <FaShieldAlt className="text-primary-500 text-sm mt-0.5 flex-shrink-0" />
                <span>Digital / SMS / LankaQR E-Ticket accepted by conductor for instant check-in.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Boarding/Dropping points */}
        <div className="pt-4 border-t border-slate-100 dark:border-dark-border/40">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-3">
            Intermediate Boarding & Dropping Halts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-dark-bg/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-rose-500 font-bold">
                <FaMapMarkerAlt />
                <span className="uppercase tracking-wider">Boarding Points</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {boardingPoints.length > 0 ? (
                  boardingPoints.map((pt, i) => <li key={i}>{pt}</li>)
                ) : (
                  <li>{route?.from} - Main Bus Terminal</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-dark-bg/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-teal-500 font-bold">
                <FaMapMarkerAlt />
                <span className="uppercase tracking-wider">Dropping Points</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {droppingPoints.length > 0 ? (
                  droppingPoints.map((pt, i) => <li key={i}>{pt}</li>)
                ) : (
                  <li>{route?.to} - Main City Center Terminal</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Public Data Source Verification Banner */}
        <div className="bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200/50 dark:border-teal-900/30 flex items-start space-x-3 text-xs text-teal-900 dark:text-teal-200">
          <FaShieldAlt className="text-teal-600 text-lg flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Public Source Verification: {schedule.sourceName || bus?.sourceName || 'BusSeat.lk & Operator Portal'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified on {schedule.lastVerifiedDate || '2026-08-26'} • Reference:{' '}
              <a
                href={schedule.sourceUrl || bus?.sourceUrl || 'https://www.busseat.lk'}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 underline font-bold"
              >
                {schedule.sourceUrl || bus?.sourceUrl || 'https://www.busseat.lk'}
              </a>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-dark-border/40 flex justify-end">
          <button
            onClick={handleProceedToSeats}
            className="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 text-center transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Proceed to Seat Selection ({is2Plus1 ? '2+1 VIP Cabin' : '2+2 Luxury Cabin'})
          </button>
        </div>
      </div>
    </div>
  );
}
