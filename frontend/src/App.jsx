import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import SearchBuses from './pages/SearchBuses';
import BusDetails from './pages/BusDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyWallet from './pages/MyWallet';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/search" element={<SearchBuses />} />
                <Route path="/bus/:id" element={<BusDetails />} />
                <Route path="/seats" element={
                  <ProtectedRoute>
                    <SeatSelection />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <MyWallet />
                  </ProtectedRoute>
                } />
                <Route path="/success" element={
                  <ProtectedRoute>
                    <BookingSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </Layout>
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
