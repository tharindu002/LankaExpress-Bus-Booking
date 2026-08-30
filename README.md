# LankaExpressway - Bus Ticket Booking System with Digital Wallet & Executive Admin Panel

> **University Research Project**: A Production-Style Intercity Express Bus Reservation, Digital Wallet Ledger & Comprehensive Admin Portal Web Application for Sri Lankan Transit.

---

## 🏗️ System Architecture

- **User Frontend App**: React.js (Vite) + Tailwind CSS + Lucide Icons (`tharidu/frontend`, Port `5173`)
- **Admin Panel App**: React.js (Vite) + Tailwind CSS + Lucide Icons (`tharidu/Admin`, Port `5174`)
- **Backend API**: Node.js + Express.js REST API (`tharidu/backend`, Port `5000`)
- **Database**: MongoDB Atlas Cloud + Mongoose ODM (Atomic Transactions, Indexes, Audit Log)
- **Authentication & Security**: JWT (JSON Web Tokens) with `protect` & `adminOnly` Role Guards
- **Payment Gateway**: PayHere Webhook MD5 Signature Verification & Digital Wallet Engine

---

## 🚀 Quick Start Guide

### 1. Start Express Backend
```bash
cd tharidu/backend
npm install
npm run dev
```
Backend API runs at `http://localhost:5000`.

### 2. Start Passenger React Frontend
```bash
cd tharidu/frontend
npm install
npm run dev
```
User App runs at `http://localhost:5173`.

### 3. Start Executive Admin Panel & Backend (`Admin` Folder)
```bash
cd tharidu/Admin
npm install

# Option A: Start Admin Frontend (Port 5174)
npm run dev

# Option B: Run Admin Backend Server Directly from Admin Folder (Port 5000)
npm run server
```
Admin Portal Frontend runs at `http://localhost:5174`.
Admin Backend Server runs at `http://localhost:5000`.

---

## 🔐 Admin Authorization & Credentials

All `/api/admin/*` endpoints require HTTP Header `Authorization: Bearer <JWT_TOKEN>` with `req.user.role === 'admin'`.

### Default Admin Login
- **Email**: `admin@lankaexpressway.lk`
- **Password**: `admin123`
- **Role**: `admin`

---

## 📊 Admin Panel Features Summary

1. **Executive Dashboard**:
   - Total Users, Total Bookings, Today's Bookings, Ticket Revenue (Sales), Active Buses, Pending Payments, Cancelled Bookings.
   - Wallet Top-Ups stats (Separated from ticket revenue).
   - Popular routes breakdown, recent bookings & payments widgets.

2. **User Management**:
   - Filterable & searchable user accounts table.
   - Activate / Suspend passenger accounts with mandatory audit log reason.
   - Passwords strictly protected and never exposed in API responses.
   - Non-admin users blocked from accessing `/api/admin/*`.

3. **Bus Fleet Management**:
   - Full CRUD for buses (Bus Number, Operator, Model, Type, Service Category, Seat Layout, Total Seats, Facilities, Status).
   - All actions generate immutable audit log records.

4. **Operator Management**:
   - Full CRUD for transport operating companies (Name, Contact Hotline, Email, Website, Category, Status).

5. **Route Management**:
   - Full CRUD for expressway transit corridors (From/To City, Boarding/Dropping Points, Highway Route, Distance, Toll Fee, Status).

6. **Schedule & Seat Management**:
   - Timetable CRUD (Bus, Route, Departure/Arrival Times, Operating Days, Fare, Status).
   - **Interactive Visual Seat Layout Manager**: 2+2 and 2+1 layout visualizer. Displays Available, Booked, Reserved, and Disabled seats.
   - Safety checks guard against manual release of active paid seats to prevent double bookings.

7. **Booking Management & QR Verification**:
   - Searchable booking records table.
   - Booking detail view with passenger details, schedule info, seats, payment status, and QR verification payload.
   - Cancel & Refund to Digital Wallet with duplicate refund guard.

8. **Digital Wallet Management (Single Source of Truth)**:
   - `Wallet.balance` acts as the authoritative balance across all endpoints.
   - Displays user wallets, balance float, total top-ups, ticket spending, and refunds.

9. **PayHere Payments & Refunds**:
   - PayHere payment gateway records.
   - **Immutable Security**: Admin CANNOT manually alter PayHere gateway status to SUCCESS. Payment success strictly derives from verified PayHere server notifications (`md5sig`).
   - Duplicate refund prevention guard on cancellation refunds.

10. **Reports & Data Export**:
    - Revenue reports, refund reports, wallet top-up vs ticket spending breakdown.
    - Popular travel times distribution ranking.
    - Date range filter and CSV report exporter.

11. **System Activity Notifications**:
    - Real-time event notifications for new bookings, payment events, cancellations, and refunds.

12. **System Audit Logs (`AuditLog` Collection)**:
    - Records Admin ID, Admin Name, Admin Email, Action, Target Resource, Target ID, Reason, Timestamp, and IP Address.
    - Audit logs are read-only and cannot be deleted by ordinary admins.

13. **Admin Wallet Adjustment**:
    - Admin CREDIT or DEBIT to user digital wallet with mandatory audit reason.
    - Atomic update of `Wallet.balance`, creation of `WalletTransaction` + `AuditLog`.
    - Negative wallet balance prevention check.

14. **Admin Profile**:
    - Update profile info, update password, secure logout.

15. **Conductor Management & Boarding Subsystem**:
    - **Conductor CRUD & Status Toggle**: Manage conductor profiles, active/inactive employment status, and schedule assignments.
    - **30-Minute Booking Cutoff Rule**: Strict enforcement preventing passenger bookings within 30 minutes of departure.
    - **Dedicated Mobile Conductor Portal (`/conductor`)**: Shift summary dashboard, assigned schedule view, filterable passenger manifest.
    - **Mobile QR Code Scanner**: Integrated camera scanner (`html5-qrcode`) & manual reference lookup.
    - **Atomic Boarding Verification**: Mark ticket as `BOARDED` with duplicate scan prevention and audit log tracking.
    - **Real-Time Conductor Notifications & Socket.IO**: Instant alerts for new passenger bookings and cancellations.
    - **Admin Live Boarding Monitor (`/boarding`)**: Operations room monitor showing schedule boarding progress bars and verified counts.

---

## 🧪 Automated Test Suites

Run automated test suites in `tharidu/backend`:

```bash
# Test 1: Admin Panel Test Suite (17 Assertions)
node src/tests/runAdminTests.js

# Test 2: Digital Wallet & PayHere Test Suite (13 Assertions)
node src/tests/runWalletTests.js
```

---

## 📁 Created & Modified Files List

1. **Admin Frontend Application (`tharidu/Admin/`)**:
   - [`Admin/package.json`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/package.json)
   - [`Admin/server.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/server.js)
   - [`Admin/vite.config.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/vite.config.js)
   - [`Admin/index.html`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/index.html)
   - [`Admin/src/index.css`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/index.css)
   - [`Admin/src/main.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/main.jsx)
   - [`Admin/src/App.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/App.jsx)
   - [`Admin/src/context/AuthContext.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/context/AuthContext.jsx)
   - [`Admin/src/components/Sidebar.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/Sidebar.jsx)
   - [`Admin/src/components/Header.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/Header.jsx)
   - [`Admin/src/components/DataTable.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/DataTable.jsx)
   - [`Admin/src/components/Modal.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/Modal.jsx)
   - [`Admin/src/components/StatusBadge.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/StatusBadge.jsx)
   - [`Admin/src/components/VisualSeatMap.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/VisualSeatMap.jsx)
   - [`Admin/src/components/Toast.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/components/Toast.jsx)
   - [`Admin/src/pages/Login.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/Login.jsx)
   - [`Admin/src/pages/Dashboard.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/Dashboard.jsx)
   - [`Admin/src/pages/UserManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/UserManagement.jsx)
   - [`Admin/src/pages/UserDetail.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/UserDetail.jsx)
   - [`Admin/src/pages/BusManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/BusManagement.jsx)
   - [`Admin/src/pages/OperatorManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/OperatorManagement.jsx)
   - [`Admin/src/pages/RouteManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/RouteManagement.jsx)
   - [`Admin/src/pages/ScheduleManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/ScheduleManagement.jsx)
   - [`Admin/src/pages/SeatManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/SeatManagement.jsx)
   - [`Admin/src/pages/BookingManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/BookingManagement.jsx)
   - [`Admin/src/pages/BookingDetail.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/BookingDetail.jsx)
   - [`Admin/src/pages/WalletManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/WalletManagement.jsx)
   - [`Admin/src/pages/PaymentManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/PaymentManagement.jsx)
   - [`Admin/src/pages/RefundManagement.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/RefundManagement.jsx)
   - [`Admin/src/pages/Reports.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/Reports.jsx)
   - [`Admin/src/pages/Notifications.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/Notifications.jsx)
   - [`Admin/src/pages/AuditLogPage.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/AuditLogPage.jsx)
   - [`Admin/src/pages/AdminProfile.jsx`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/Admin/src/pages/AdminProfile.jsx)

2. **Backend Engine & Models**:
   - [`backend/src/models/AuditLog.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/backend/src/models/AuditLog.js)
   - [`backend/src/controllers/adminController.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/backend/src/controllers/adminController.js)
   - [`backend/src/routes/adminRoutes.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/backend/src/routes/adminRoutes.js)
   - [`backend/src/controllers/authController.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/backend/src/controllers/authController.js)
   - [`backend/src/tests/runAdminTests.js`](file:///d:/UNIVERSITY/Lanka%20Expressway/tharidu/backend/src/tests/runAdminTests.js)
