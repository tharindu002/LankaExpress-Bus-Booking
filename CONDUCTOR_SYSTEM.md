# LankaExpressway Conductor Management & Boarding Verification System

## 🚌 System Architecture Overview

The **Conductor Management & Boarding Verification System** is a mission-critical operational subsystem integrated into the LankaExpressway bus ticketing platform. It handles the complete lifecycle of bus conductors, shift schedules, real-time booking alerts, passenger boarding verification via mobile QR code scanning, and live fleet monitoring for administrators.

```
                      +-----------------------------+
                      |       Express Backend       |
                      |  (Node.js + Mongoose + IO)  |
                      +--------------+--------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
         v                                                       v
+-------------------------+                           +-------------------------+
|     Executive Admin     |                           |    Conductor Portal     |
|   - Conductor CRUD      |                           |   - Shift Dashboard     |
|   - Schedule Assignment |                           |   - Passenger Manifest  |
|   - Boarding Monitor    |                           |   - Mobile QR Scanner   |
+-------------------------+                           |   - Mark Boarded Action |
                                                      +-------------------------+
```

---

## 👥 User Roles & Access Control

| Role | Portal Path | Permissions | Restrictions |
|---|---|---|---|
| `USER` | `http://localhost:5173/` | Search schedules, select seats, top-up digital wallet, pay for tickets, view QR e-ticket & boarding status (`PENDING` / `BOARDED`). | Cannot access admin/conductor APIs or edit schedules. |
| `ADMIN` | `http://localhost:5174/` | Full system control: Manage Conductors, Buses, Routes, Schedules, User Wallets, Boarding Operations Monitor, Audit Logs. | Cannot perform boarding scans on behalf of active conductors without logging audit events. |
| `CONDUCTOR` | `http://localhost:5174/conductor` | View assigned schedules only, view assigned passenger manifests, receive real-time booking alerts, scan passenger QR tickets, mark passengers as `BOARDED`. | **STRICT RESTRICTION:** Cannot access Admin dashboard (`/dashboard`, `/users`, `/wallets`), change ticket prices, edit bus schedules, or view other conductors' schedules. |

---

## 🗄️ Database Schemas & Models

### 1. User Schema Extension (`backend/src/models/User.js`)
- `role`: Enum `['user', 'admin', 'conductor']` (or `USER`, `ADMIN`, `CONDUCTOR`).
- `employeeId`: Unique Conductor Employee ID string (e.g., `EMP-101`).

### 2. Schedule Schema Extension (`backend/src/models/Schedule.js`)
- `conductor`: Ref to `User` model (ObjectId).
- `conductorId`: Employee ID or User ID string.

### 3. Booking Schema Extension (`backend/src/models/Booking.js`)
- `boardingStatus`: Enum `['Pending', 'Boarded', 'No_Show', 'Not_Applicable']` (Default: `'Pending'`).
- `boardedAt`: Date timestamp when ticket was verified.
- `verifiedBy`: Ref to conductor `User` model.
- `verifiedByConductorId`: String employee ID.

### 4. Notification Schema (`backend/src/models/Notification.js`)
- `recipient`: Ref to `User` (ObjectId).
- `recipientRole`: `CONDUCTOR` / `USER`.
- `type`: `NEW_BOOKING`, `BOOKING_CANCELLED`, `SCHEDULE_ASSIGNMENT`.
- `title`, `message`, `data`, `read` (Boolean), `createdAt`.

### 5. Boarding Log Schema (`backend/src/models/BoardingLog.js`)
- `bookingId`, `bookingRef`, `scheduleId`, `conductorId`, `conductorName`, `status` (`SUCCESS`, `ALREADY_BOARDED`, `INVALID_SCHEDULE`, `INVALID_STATUS`), `notes`, `timestamp`.

---

## ⏱️ 30-Minute Booking Cutoff Rule

To prevent last-minute double booking while conductors are boarding passengers:
1. **Backend Enforcement (`bookingController.js`)**:
   - Calculates time remaining until schedule departure.
   - If departure time is less than **30 minutes** away (or in the past), returns HTTP status `400 Bad Request`:
     `"Booking closed. Tickets can only be booked until 30 minutes before departure."`
2. **Frontend UI Enforcement (`SearchBuses.jsx`, `SeatSelection.jsx`)**:
   - Disables the `Select Seats` button on the schedule card when remaining time < 30 mins.
   - Renders a red notice: `"Booking closed. Tickets can only be booked until 30 minutes before departure."`

---

## 📱 Conductor QR Scanner & Boarding Verification Workflow

1. **Scan QR Code**:
   - Conductor opens `/conductor/scan` on a mobile device or desktop.
   - Camera scans passenger's QR Code containing `bookingRef` or raw JSON.
2. **6-Step Validation Protocol (`conductorController.js -> scanTicket`)**:
   - Step 1: Lookup booking by `bookingRef`.
   - Step 2: Check payment status (`paymentStatus === 'Paid'`).
   - Step 3: Check booking status (`status === 'Active'`).
   - Step 4: Verify schedule assignment (schedule must belong to logged-in conductor).
   - Step 5: Check duplicate boarding (`boardingStatus === 'Boarded'`).
   - Step 6: Verify departure cutoff / date window.
3. **Atomic Boarding Confirmation**:
   - Clicking **Mark as Boarded** atomically sets `boardingStatus = 'Boarded'`, records `boardedAt` timestamp, and logs the action in `BoardingLog`.
   - Prevents duplicate scans and updates the passenger ticket view immediately via Socket.IO events.

---

## 🔌 API Endpoints Summary

### Conductor Management (Admin Only)
- `GET /api/admin/conductors` - List all registered conductors
- `POST /api/admin/conductors` - Register new conductor account
- `PATCH /api/admin/conductors/:id` - Edit conductor details
- `PATCH /api/admin/conductors/:id/status` - Activate / Deactivate conductor
- `POST /api/admin/schedules/:scheduleId/assign-conductor` - Assign conductor to schedule
- `GET /api/admin/boarding` - Live fleet boarding progress monitoring

### Conductor Portal (`requireConductor` Auth)
- `GET /api/conductor/dashboard` - Conductor shift summary and stats
- `GET /api/conductor/schedules` - Conductor assigned trips
- `GET /api/conductor/bookings` - Passenger manifest for assigned schedules
- `POST /api/conductor/scan-ticket` - Validate scanned QR ticket
- `POST /api/conductor/bookings/:id/board` - Mark passenger ticket as boarded
- `GET /api/conductor/notifications` - Real-time conductor notification list
- `PATCH /api/conductor/notifications/:id/read` - Mark notification as read

---

## 🧪 Quick Test Credentials

- **Demo Conductor Account**:
  - Email: `conductor@lankaexpressway.lk`
  - Password: `password123`
  - Employee ID: `EMP-101`
- **Super Admin Account**:
  - Email: `admin@lankaexpressway.lk`
  - Password: `admin123`
