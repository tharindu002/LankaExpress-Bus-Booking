import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { UserDetail } from './pages/UserDetail';
import { BusManagement } from './pages/BusManagement';
import { OperatorManagement } from './pages/OperatorManagement';
import { RouteManagement } from './pages/RouteManagement';
import { ScheduleManagement } from './pages/ScheduleManagement';
import { SeatManagement } from './pages/SeatManagement';
import { BookingManagement } from './pages/BookingManagement';
import { BookingDetail } from './pages/BookingDetail';
import { WalletManagement } from './pages/WalletManagement';
import { PaymentManagement } from './pages/PaymentManagement';
import { RefundManagement } from './pages/RefundManagement';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { AdminProfile } from './pages/AdminProfile';
import { ConductorManagement } from './pages/ConductorManagement';
import { BoardingMonitoring } from './pages/BoardingMonitoring';
import { AdminAccessManagement } from './pages/AdminAccessManagement';
import { ConductorDashboard } from './pages/conductor/ConductorDashboard';
import { ConductorSchedules } from './pages/conductor/ConductorSchedules';
import { ConductorBookings } from './pages/conductor/ConductorBookings';
import { ConductorQRScanner } from './pages/conductor/ConductorQRScanner';
import { ConductorNotifications } from './pages/conductor/ConductorNotifications';

const ProtectedLayout = ({ children, title }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sidebar with Mobile Support */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main View Area (Full Width, 100% Responsive) */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header 
          title={title} 
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />
        <main className="flex-1 overflow-y-auto w-full px-6 sm:px-8 lg:px-10 py-8">
          <div className="w-full space-y-8 pb-14">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedLayout title="Executive Admin Dashboard">
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedLayout title="Passenger & User Management">
              <UserManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedLayout title="Passenger Account Details">
              <UserDetail />
            </ProtectedLayout>
          }
        />

        <Route
          path="/buses"
          element={
            <ProtectedLayout title="Bus Fleet Management">
              <BusManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/operators"
          element={
            <ProtectedLayout title="Bus Operators Management">
              <OperatorManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/routes"
          element={
            <ProtectedLayout title="Expressway Route Management">
              <RouteManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/schedules"
          element={
            <ProtectedLayout title="Bus Schedules & Timetables">
              <ScheduleManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/seats"
          element={
            <ProtectedLayout title="Interactive Visual Seat Layout">
              <SeatManagement />
            </ProtectedLayout>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedLayout title="Ticket Bookings & QR Verification">
              <BookingManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedLayout title="Ticket Booking Details">
              <BookingDetail />
            </ProtectedLayout>
          }
        />

        <Route
          path="/wallets"
          element={
            <ProtectedLayout title="User Digital Wallets Overview">
              <WalletManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/wallet-transactions"
          element={
            <ProtectedLayout title="Wallet Transaction Ledger">
              <WalletManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedLayout title="PayHere Gateway Payments">
              <PaymentManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/refunds"
          element={
            <ProtectedLayout title="Ticket Refund Log">
              <RefundManagement />
            </ProtectedLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedLayout title="Analytics & Revenue Reports">
              <Reports />
            </ProtectedLayout>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedLayout title="System Activity Feed">
              <Notifications />
            </ProtectedLayout>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedLayout title="Immutable System Audit Logs">
              <AuditLogPage />
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout title="Admin Profile & Settings">
              <AdminProfile />
            </ProtectedLayout>
          }
        />

        <Route
          path="/conductors"
          element={
            <ProtectedLayout title="Conductor Account Management">
              <ConductorManagement />
            </ProtectedLayout>
          }
        />

        <Route
          path="/boarding"
          element={
            <ProtectedLayout title="Real-Time Boarding Operations">
              <BoardingMonitoring />
            </ProtectedLayout>
          }
        />

        <Route
          path="/admin-access"
          element={
            <ProtectedLayout title="SuperAdmin Access Control">
              <AdminAccessManagement />
            </ProtectedLayout>
          }
        />

        {/* Dedicated Conductor Portal Routes */}
        <Route path="/conductor" element={<ConductorDashboard />} />
        <Route path="/conductor/schedules" element={<ConductorSchedules />} />
        <Route path="/conductor/bookings" element={<ConductorBookings />} />
        <Route path="/conductor/scan" element={<ConductorQRScanner />} />
        <Route path="/conductor/notifications" element={<ConductorNotifications />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
