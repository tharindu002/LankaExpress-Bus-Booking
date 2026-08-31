import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBus, FaRoute, FaCalendarAlt, FaTicketAlt, FaUsers, 
  FaPlus, FaTrash, FaEdit, FaChartBar, FaShieldAlt, FaTimes, 
  FaBuilding, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route security guard
  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (!user || (role !== 'admin' && role !== 'superadmin')) {
      navigate('/login');
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState('stats'); // stats, operators, buses, routes, schedules, bookings, users
  const [stats, setStats] = useState(null);
  const [operators, setOperators] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal forms
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // operator, bus, route, schedule
  const [modalAction, setModalAction] = useState('add'); // add, edit
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [operatorForm, setOperatorForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    website: '',
    operatorType: 'Private',
    serviceCategory: 'Super Luxury',
    status: 'Active',
    sourceName: '',
    sourceUrl: '',
    dataStatus: 'Verified',
    notes: ''
  });

  const [busForm, setBusForm] = useState({
    operatorId: '',
    busNo: '',
    name: '',
    model: '',
    type: 'Super Luxury Volvo',
    serviceCategory: 'Super Luxury',
    seatLayout: '2+2',
    totalSeats: 40,
    amenities: ['Air Conditioning', 'Reclining Seats', 'USB Charging', 'Wi-Fi'],
    rating: 4.8,
    status: 'Active',
    sourceName: '',
    sourceUrl: '',
    dataStatus: 'Verified',
    notes: ''
  });

  const [routeForm, setRouteForm] = useState({
    routeNo: '',
    name: '',
    from: '',
    to: '',
    boardingPointsText: '',
    droppingPointsText: '',
    highwayRoute: 'Southern Expressway (E01)',
    distance: '',
    tollFee: 0,
    status: 'Active',
    sourceName: '',
    sourceUrl: '',
    dataStatus: 'Verified',
    notes: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    busId: '',
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    operatingDays: 'Daily',
    fare: '',
    status: 'Active',
    sourceName: '',
    sourceUrl: '',
    dataStatus: 'Verified',
    notes: ''
  });

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin' || role === 'superadmin') {
      refreshData();
    }
  }, [user, activeTab]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const statsData = await api.adminGetStats();
      setStats(statsData);

      const operatorsData = await api.getOperators();
      setOperators(operatorsData);

      const busesData = await api.getBuses();
      setBuses(busesData);

      const routesData = await api.getRoutes();
      setRoutes(routesData);

      const schedulesData = await api.getSchedules();
      setSchedules(schedulesData);

      const bookingsData = await api.getBookings();
      setBookings(bookingsData);

      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, action, item = null) => {
    setModalType(type);
    setModalAction(action);
    setSelectedItem(item);

    if (type === 'operator') {
      setOperatorForm(
        item
          ? {
              ...item,
              contactNumber: item.contactNumber || item.contact_number || '',
              operatorType: item.operatorType || item.operator_type || 'Private',
              serviceCategory: item.serviceCategory || item.service_category || 'Super Luxury',
              sourceName: item.sourceName || item.source_name || '',
              sourceUrl: item.sourceUrl || item.source_url || '',
              dataStatus: item.dataStatus || item.data_status || 'Verified',
              notes: item.notes || ''
            }
          : {
              name: '',
              contactNumber: '',
              email: '',
              website: '',
              operatorType: 'Private',
              serviceCategory: 'Super Luxury',
              status: 'Active',
              sourceName: 'BusSeat.lk / Operator Portal',
              sourceUrl: 'https://www.busseat.lk',
              dataStatus: 'Verified',
              notes: ''
            }
      );
    } else if (type === 'bus') {
      setBusForm(
        item
          ? {
              ...item,
              operatorId: item.operatorId || item.operator_id || operators[0]?.id || '',
              busNo: item.busNo || item.bus_no || '',
              type: item.type || item.bus_type || 'Super Luxury Volvo',
              serviceCategory: item.serviceCategory || item.service_category || 'Super Luxury',
              seatLayout: item.seatLayout || item.seat_layout || '2+2',
              totalSeats: item.totalSeats || item.total_seats || 40,
              amenities: item.amenities || item.facilities || ['Air Conditioning', 'Reclining Seats'],
              sourceName: item.sourceName || item.source_name || '',
              sourceUrl: item.sourceUrl || item.source_url || '',
              dataStatus: item.dataStatus || item.data_status || 'Verified',
              notes: item.notes || ''
            }
          : {
              operatorId: operators[0]?.id || '',
              busNo: '',
              name: '',
              model: '',
              type: 'Super Luxury Volvo',
              serviceCategory: 'Super Luxury',
              seatLayout: '2+2',
              totalSeats: 40,
              amenities: ['Air Conditioning', 'Reclining Seats', 'USB Charging', 'Wi-Fi'],
              rating: 4.8,
              status: 'Active',
              sourceName: 'Operator Official Fleet',
              sourceUrl: 'https://www.busseat.lk',
              dataStatus: 'Verified',
              notes: ''
            }
      );
    } else if (type === 'route') {
      setRouteForm(
        item
          ? {
              ...item,
              routeNo: item.routeNo || item.route_no || '',
              from: item.from || item.from_city || '',
              to: item.to || item.to_city || '',
              boardingPointsText: (item.boardingPoints || item.boarding_points || []).join(', '),
              droppingPointsText: (item.droppingPoints || item.dropping_points || []).join(', '),
              highwayRoute: item.highwayRoute || item.highway_route || '',
              distance: item.distance || item.distance_km || '',
              tollFee: item.tollFee || item.toll_fee || 0,
              sourceName: item.sourceName || item.source_name || '',
              sourceUrl: item.sourceUrl || item.source_url || '',
              dataStatus: item.dataStatus || item.data_status || 'Verified',
              notes: item.notes || ''
            }
          : {
              routeNo: '',
              name: '',
              from: '',
              to: '',
              boardingPointsText: '',
              droppingPointsText: '',
              highwayRoute: 'Southern Expressway (E01)',
              distance: '',
              tollFee: 0,
              status: 'Active',
              sourceName: 'NTC Official Schedule',
              sourceUrl: 'https://www.ntc.gov.lk',
              dataStatus: 'Verified',
              notes: ''
            }
      );
    } else if (type === 'schedule') {
      setScheduleForm(
        item
          ? {
              ...item,
              busId: item.busId || item.bus_id || buses[0]?.id || '',
              routeId: item.routeId || item.route_id || routes[0]?.id || '',
              departureTime: item.departureTime || item.departure_time || '',
              arrivalTime: item.arrivalTime || item.arrival_time || '',
              duration: item.duration || '',
              operatingDays: item.operatingDays || item.operating_days || 'Daily',
              fare: item.fare || '',
              sourceName: item.sourceName || item.source_name || '',
              sourceUrl: item.sourceUrl || item.source_url || '',
              dataStatus: item.dataStatus || item.data_status || 'Verified',
              notes: item.notes || ''
            }
          : {
              busId: buses[0]?.id || '',
              routeId: routes[0]?.id || '',
              departureTime: '06:30 AM',
              arrivalTime: '08:00 AM',
              duration: '1h 30m',
              operatingDays: 'Daily',
              fare: '550',
              status: 'Active',
              sourceName: 'Official Timetable',
              sourceUrl: 'https://www.ntc.gov.lk',
              dataStatus: 'Verified',
              notes: ''
            }
      );
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'operator') {
        if (modalAction === 'add') await api.createOperator(operatorForm);
        else await api.updateOperator(operatorForm);
      } else if (modalType === 'bus') {
        if (modalAction === 'add') await api.createBus(busForm);
        else await api.updateBus(busForm);
      } else if (modalType === 'route') {
        const payload = {
          ...routeForm,
          boardingPoints: routeForm.boardingPointsText.split(',').map((s) => s.trim()).filter(Boolean),
          droppingPoints: routeForm.droppingPointsText.split(',').map((s) => s.trim()).filter(Boolean)
        };
        if (modalAction === 'add') await api.createRoute(payload);
        else await api.updateRoute(payload);
      } else if (modalType === 'schedule') {
        if (modalAction === 'add') await api.createSchedule(scheduleForm);
        else await api.updateSchedule(scheduleForm);
      }
      setShowModal(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'operator') await api.deleteOperator(id);
      else if (type === 'bus') await api.deleteBus(id);
      else if (type === 'route') await api.deleteRoute(id);
      else if (type === 'schedule') await api.deleteSchedule(id);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (ref) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${ref}?`)) return;
    try {
      await api.cancelBooking(ref);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserRole = async (userId) => {
    try {
      await api.toggleUserRole(userId);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.updateUserStatus(userId, nextStatus);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'admin' && userRole !== 'superadmin')) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin header */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest block flex items-center space-x-1">
            <FaShieldAlt className="animate-pulse" />
            <span>LankaExpressway Administration Center</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Transport Operations Console</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage real verified Sri Lankan luxury bus operators, expressway routes, schedules, seat configurations and passenger bookings.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="text-xs font-extrabold text-emerald-400">Live Database Connected</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-dark-border scrollbar-none">
        {[
          { id: 'stats', label: 'Dashboard Overview', icon: FaChartBar },
          { id: 'operators', label: `Operators (${operators.length})`, icon: FaBuilding },
          { id: 'buses', label: `Buses & Fleets (${buses.length})`, icon: FaBus },
          { id: 'routes', label: `Routes (${routes.length})`, icon: FaRoute },
          { id: 'schedules', label: `Schedules (${schedules.length})`, icon: FaCalendarAlt },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: FaTicketAlt },
          { id: 'users', label: `Users (${users.length})`, icon: FaUsers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-100 dark:border-dark-border/40'
              }`}
            >
              <Icon className="text-xs" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
              <h3 className="text-2xl font-black text-gold-500">{stats.kpis.totalRevenue.toLocaleString()} LKR</h3>
              <p className="text-[11px] text-teal-600 font-semibold">Active booking payments</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Bookings</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.kpis.activeBookings}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Tickets confirmed</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Operators & Buses</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.kpis.operatorCount || operators.length} / {stats.kpis.busCount}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Verified fleets</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Routes & Schedules</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.kpis.routeCount} / {stats.kpis.scheduleCount}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Expressway & intercity</p>
            </div>
          </div>

          {/* Revenue by Route Breakdown */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Route Performance & Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.revenueByRoute.map((r, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded">
                      {r.routeNo}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1">{r.label}</h4>
                  </div>
                  <strong className="text-sm font-black text-gold-500">{r.revenue.toLocaleString()} LKR</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATORS MANAGEMENT */}
      {activeTab === 'operators' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Registered Bus Operators</h3>
              <p className="text-xs text-slate-400">Verified Sri Lankan private and expressway public franchise transport operators.</p>
            </div>
            <button
              onClick={() => handleOpenModal('operator', 'add')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Add Operator</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Contact / Email</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Data Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4">
                      <strong className="text-slate-800 dark:text-white block font-extrabold">{op.name}</strong>
                      <span className="text-[10px] text-slate-400">{op.id}</span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="font-semibold">{op.contactNumber || op.contact_number || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{op.email || op.website || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 font-bold rounded">
                        {op.serviceCategory || op.service_category || 'Super Luxury'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{op.operatorType || op.operator_type || 'Private'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 font-bold rounded">
                        <FaCheckCircle className="text-[9px]" />
                        <span>{op.dataStatus || op.data_status || 'Verified'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal('operator', 'edit', op)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded cursor-pointer"
                        title="Edit Operator"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('operator', op.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                        title="Delete Operator"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BUSES TAB */}
      {activeTab === 'buses' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Bus Fleet & Cabin Configuration</h3>
              <p className="text-xs text-slate-400">Configure 2+2 and 2+1 VIP layouts, models, capacity, and amenities.</p>
            </div>
            <button
              onClick={() => handleOpenModal('bus', 'add')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Add Bus</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Bus Name / No</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Model & Class</th>
                  <th className="py-3 px-4">Seat Layout</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4">
                      <strong className="text-slate-800 dark:text-white block font-extrabold">{bus.name}</strong>
                      <span className="text-[10px] text-slate-400">{bus.busNo || bus.bus_no || 'Plate undisclosed'}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {bus.operator || bus.operator_name || 'Assigned Operator'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold">{bus.model || bus.type}</div>
                      <div className="text-[10px] text-slate-400">{bus.serviceCategory || bus.service_category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        (bus.seatLayout || bus.seat_layout) === '2+1'
                          ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600'
                          : 'bg-teal-50 dark:bg-teal-950/20 text-teal-600'
                      }`}>
                        {bus.seatLayout || bus.seat_layout || '2+2'} Layout
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black">{bus.totalSeats || bus.total_seats} Seats</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded text-[10px]">
                        {bus.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal('bus', 'edit', bus)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('bus', bus.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROUTES TAB */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Expressway & Highway Routes</h3>
              <p className="text-xs text-slate-400">Manage route numbers, origin, destination hubs, and expressway toll fees.</p>
            </div>
            <button
              onClick={() => handleOpenModal('route', 'add')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Add Route</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Route No</th>
                  <th className="py-3 px-4">Origin ➔ Destination</th>
                  <th className="py-3 px-4">Highway Highway Tag</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Toll Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4 font-black text-primary-500">{r.routeNo || r.route_no}</td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-800 dark:text-white block font-bold">
                        {r.from || r.from_city} ➔ {r.to || r.to_city}
                      </strong>
                      <span className="text-[10px] text-slate-400">{r.name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{r.highwayRoute || r.highway_route || 'Standard Highway'}</td>
                    <td className="py-3 px-4">{r.distance || r.distance_km || 'N/A'}</td>
                    <td className="py-3 px-4 font-black text-gold-500">{r.tollFee || r.toll_fee || 0} LKR</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal('route', 'edit', r)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('route', r.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULES TAB */}
      {activeTab === 'schedules' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Active Bus Schedules & Timetables</h3>
              <p className="text-xs text-slate-400">Timetable slots, assigned coaches, fares, and real-time seat status.</p>
            </div>
            <button
              onClick={() => handleOpenModal('schedule', 'add')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Add Schedule</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Departure / Arrival</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Coach & Operator</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Fare (LKR)</th>
                  <th className="py-3 px-4">Booked Seats</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4">
                      <strong className="text-slate-800 dark:text-white block font-black">{s.departureTime}</strong>
                      <span className="text-[10px] text-slate-400">Arrives: {s.arrivalTime}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {s.route?.from.split(' ')[0]} ➔ {s.route?.to.split(' ')[0]}
                      <span className="block text-[10px] text-slate-400 font-semibold">{s.route?.routeNo}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-white">{s.bus?.name}</div>
                      <div className="text-[10px] text-slate-400">{s.bus?.operator}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{s.duration}</td>
                    <td className="py-3 px-4 font-black text-gold-500">{s.fare} LKR</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded text-[10px]">
                        {(s.reservedSeats || []).length} Booked
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal('schedule', 'edit', s)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('schedule', s.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Customer Reservation Records</h3>
            <p className="text-xs text-slate-400">View real passenger bookings, check QR validity, and process cancellations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Passenger Details</th>
                  <th className="py-3 px-4">Schedule / Route</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Total (LKR)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {bookings.map((b) => (
                  <tr key={b.id || b.bookingRef} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4 font-mono font-black text-gold-500">{b.bookingRef}</td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-800 dark:text-white block font-bold">{b.passengerName}</strong>
                      <span className="text-[10px] text-slate-400">{b.passengerPhone} • {b.passengerNic || 'NIC'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {b.schedule?.route?.from?.split(' ')[0]} ➔ {b.schedule?.route?.to?.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400">{b.schedule?.departureTime}</div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-teal-600">{b.seats.join(', ')}</td>
                    <td className="py-3 px-4 font-black">{b.totalAmount} LKR</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded text-[10px]">
                        {b.paymentMethod || 'Card'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        b.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'Active' && (
                        <button
                          onClick={() => handleCancelBooking(b.bookingRef)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border/40">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Registered Users & Roles</h3>
            <p className="text-xs text-slate-400">Manage administrator privileges and passenger account statuses.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-dark-bg/60 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] cursor-pointer"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded text-[10px] cursor-pointer"
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DYNAMIC MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-dark-border/40 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-slate-800 dark:text-white capitalize">
                {modalAction} {modalType}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* OPERATOR FORM */}
              {modalType === 'operator' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Operator Name *</label>
                    <input
                      type="text"
                      required
                      value={operatorForm.name}
                      onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Superline Travels"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={operatorForm.contactNumber}
                        onChange={(e) => setOperatorForm({ ...operatorForm, contactNumber: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="+94 77 738 2186"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={operatorForm.email}
                        onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="info@superline.lk"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Operator Type</label>
                      <select
                        value={operatorForm.operatorType}
                        onChange={(e) => setOperatorForm({ ...operatorForm, operatorType: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      >
                        <option value="Private">Private</option>
                        <option value="Public">Public / Franchise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Service Category</label>
                      <select
                        value={operatorForm.serviceCategory}
                        onChange={(e) => setOperatorForm({ ...operatorForm, serviceCategory: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      >
                        <option value="Super Luxury">Super Luxury</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Source Name & Public URL</label>
                    <input
                      type="url"
                      value={operatorForm.sourceUrl}
                      onChange={(e) => setOperatorForm({ ...operatorForm, sourceUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      placeholder="https://superline.lk"
                    />
                  </div>
                </>
              )}

              {/* BUS FORM */}
              {modalType === 'bus' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Assigned Operator *</label>
                    <select
                      required
                      value={busForm.operatorId}
                      onChange={(e) => setBusForm({ ...busForm, operatorId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                    >
                      {operators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.name} ({op.serviceCategory || op.service_category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Bus Service Name *</label>
                      <input
                        type="text"
                        required
                        value={busForm.name}
                        onChange={(e) => setBusForm({ ...busForm, name: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="e.g. Royal Platinum Coach"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Registration Plate No</label>
                      <input
                        type="text"
                        value={busForm.busNo}
                        onChange={(e) => setBusForm({ ...busForm, busNo: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="e.g. WP ND-6821"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Seat Layout *</label>
                      <select
                        value={busForm.seatLayout}
                        onChange={(e) => setBusForm({ ...busForm, seatLayout: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white font-bold"
                      >
                        <option value="2+2">2+2 Standard Luxury (40-44 Seats)</option>
                        <option value="2+1">2+1 VIP Executive Suite (28-36 Seats)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Total Capacity *</label>
                      <input
                        type="number"
                        required
                        value={busForm.totalSeats}
                        onChange={(e) => setBusForm({ ...busForm, totalSeats: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Bus Model</label>
                    <input
                      type="text"
                      value={busForm.model}
                      onChange={(e) => setBusForm({ ...busForm, model: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Volvo B11R / Yutong ZK6122H"
                    />
                  </div>
                </>
              )}

              {/* ROUTE FORM */}
              {modalType === 'route' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Route No *</label>
                      <input
                        type="text"
                        required
                        value={routeForm.routeNo}
                        onChange={(e) => setRouteForm({ ...routeForm, routeNo: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="e.g. EX 1-1"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Highway Route</label>
                      <input
                        type="text"
                        value={routeForm.highwayRoute}
                        onChange={(e) => setRouteForm({ ...routeForm, highwayRoute: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="Southern Expressway (E01)"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">From (Origin) *</label>
                      <input
                        type="text"
                        required
                        value={routeForm.from}
                        onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="Colombo (Makumbura)"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">To (Destination) *</label>
                      <input
                        type="text"
                        required
                        value={routeForm.to}
                        onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="Galle (MMC)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Boarding Points (comma-separated)</label>
                    <input
                      type="text"
                      value={routeForm.boardingPointsText}
                      onChange={(e) => setRouteForm({ ...routeForm, boardingPointsText: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      placeholder="Makumbura MMC, Kottawa Interchange"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Distance (km)</label>
                      <input
                        type="text"
                        value={routeForm.distance}
                        onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="116 km"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Toll Fee (LKR)</label>
                      <input
                        type="number"
                        value={routeForm.tollFee}
                        onChange={(e) => setRouteForm({ ...routeForm, tollFee: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SCHEDULE FORM */}
              {modalType === 'schedule' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Select Bus *</label>
                    <select
                      required
                      value={scheduleForm.busId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, busId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                    >
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.operator}) - {b.seatLayout || b.seat_layout || '2+2'} Layout
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Select Route *</label>
                    <select
                      required
                      value={scheduleForm.routeId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, routeId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                    >
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.routeNo || r.route_no}: {r.from || r.from_city} ➔ {r.to || r.to_city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Departure Time *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.departureTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="06:30 AM"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Arrival Time *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.arrivalTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="08:00 AM"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Duration *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.duration}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                        placeholder="1h 30m"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Ticket Fare (LKR) *</label>
                      <input
                        type="number"
                        required
                        value={scheduleForm.fare}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, fare: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white font-bold"
                        placeholder="550"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Save {modalType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
