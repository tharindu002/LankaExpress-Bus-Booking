import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <FaBus className="text-2xl text-gold-500" />
              <span className="font-extrabold text-xl tracking-wider text-teal-400">
                LANKA<span className="text-gold-500 font-bold">EXPRESS</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              Premium Expressway & Luxury coach reservation network in Sri Lanka. Connecting major hubs with absolute comfort, safety, and reliability.
            </p>
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg p-2.5 max-w-xs">
              <FaPhoneAlt className="text-sm animate-bounce" />
              <div className="text-xs">
                <span className="font-extrabold text-white block">Expressway Hotline: 1969</span>
                For active roadside assistance & toll alerts.
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/search" className="hover:text-gold-400 transition-colors">Book Expressway Tickets</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gold-400 transition-colors">User Authentication</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gold-400 transition-colors">Passenger Dashboard</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold-400 transition-colors">Operator Panel</Link>
              </li>
            </ul>
          </div>

          {/* Popular Hubs */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">Key Terminals</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-1.5">
                <FaMapMarkerAlt className="text-teal-400 text-xs flex-shrink-0" />
                <span>Makumbura Multimodal Center</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <FaMapMarkerAlt className="text-teal-400 text-xs flex-shrink-0" />
                <span>Bastian Mawatha, Pettah</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <FaMapMarkerAlt className="text-teal-400 text-xs flex-shrink-0" />
                <span>Galle MMC (Expressway Bus Stand)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <FaMapMarkerAlt className="text-teal-400 text-xs flex-shrink-0" />
                <span>Goods Shed Bus Stand, Kandy</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">Contact Us</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2 text-slate-400">
                <FaEnvelope className="text-teal-400" />
                <span>support@lankaexpress.lk</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <FaPhoneAlt className="text-teal-400" />
                <span>+94 11 234 5678</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs text-slate-400 font-bold uppercase mb-2">Our Payment Partners</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-200 border border-slate-700 rounded font-bold">LankaQR</span>
                <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-200 border border-slate-700 rounded font-bold">eZ Cash</span>
                <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-200 border border-slate-700 rounded font-bold">Genie</span>
                <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-200 border border-slate-700 rounded font-bold">Visa / Master</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lanka Expressway Transit System. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="flex items-center space-x-1">
              <FaShieldAlt className="text-teal-500" />
              <span>SSL Secured Reservation</span>
            </span>
            <span className="flex items-center space-x-1">
              <FaQuestionCircle className="text-gold-500" />
              <span>Passenger Rights Policy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
