import axios from 'axios';

const getBackendUrl = () => {
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalDev) {
    const localUrl = (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      'http://localhost:5000'
    ).trim();
    let cleanLocal = localUrl.replace(/\/+$/, '');
    if (cleanLocal.endsWith('/api')) cleanLocal = cleanLocal.slice(0, -4);
    return cleanLocal;
  }

  // PRODUCTION / VERCEL: ALWAYS USE RENDER BACKEND
  let prodUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  ).trim();

  if (!prodUrl || prodUrl.includes('localhost') || prodUrl.includes('127.0.0.1')) {
    prodUrl = 'https://lankaexpress-bus-booking-backend.onrender.com';
  }

  let cleanProd = prodUrl.replace(/\/+$/, '');
  if (cleanProd.endsWith('/api')) cleanProd = cleanProd.slice(0, -4);
  return cleanProd;
};

const BACKEND_URL = getBackendUrl();
axios.defaults.baseURL = BACKEND_URL;

export const api = {
  // Conductor Management (Admin)
  getConductors: async () => {
    const res = await axios.get('/api/admin/conductors');
    return res.data;
  },

  createConductor: async (data) => {
    const res = await axios.post('/api/admin/conductors', data);
    return res.data;
  },

  updateConductor: async (id, data) => {
    const res = await axios.patch(`/api/admin/conductors/${id}`, data);
    return res.data;
  },

  updateConductorStatus: async (id, status) => {
    const res = await axios.patch(`/api/admin/conductors/${id}/status`, { status });
    return res.data;
  },

  assignConductorToSchedule: async (scheduleId, conductorId) => {
    const res = await axios.post(`/api/admin/schedules/${scheduleId}/assign-conductor`, { conductorId });
    return res.data;
  },

  getBoardingMonitoring: async () => {
    const res = await axios.get('/api/admin/boarding');
    return res.data;
  },

  // Conductor Portal APIs
  getConductorDashboard: async () => {
    const res = await axios.get('/api/conductor/dashboard');
    return res.data;
  },

  getConductorSchedules: async () => {
    const res = await axios.get('/api/conductor/schedules');
    return res.data;
  },

  getConductorBookings: async (scheduleId = '', status = 'ALL') => {
    let url = '/api/conductor/bookings?';
    if (scheduleId) url += `scheduleId=${scheduleId}&`;
    if (status && status !== 'ALL') url += `status=${status}&`;
    const res = await axios.get(url);
    return res.data;
  },

  scanConductorTicket: async (bookingRef) => {
    const res = await axios.post('/api/conductor/scan-ticket', { bookingRef });
    return res.data;
  },

  boardPassenger: async (id) => {
    const res = await axios.post(`/api/conductor/bookings/${id}/board`);
    return res.data;
  },

  getConductorNotifications: async () => {
    const res = await axios.get('/api/conductor/notifications');
    return res.data;
  },

  // Buses List helper for admin selector
  getBuses: async () => {
    const res = await axios.get('/api/admin/buses');
    return res.data;
  },

  // SuperAdmin Admin Access Management
  getAdmins: async () => {
    const res = await axios.get('/api/admin/admins');
    return res.data;
  },

  createAdmin: async (data) => {
    const res = await axios.post('/api/admin/admins', data);
    return res.data;
  },

  updateAdminPermissions: async (id, data) => {
    const res = await axios.patch(`/api/admin/admins/${id}/permissions`, data);
    return res.data;
  },
};
