import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Layouts & Guards
import ProtectedRoute  from './components/ProtectedRoute.jsx';
import AdminRoute      from './components/AdminRoute.jsx';
import UserLayout      from './components/UserLayout.jsx';
import AdminLayout     from './components/AdminLayout.jsx';

// Auth pages
import Landing  from './pages/auth/Landing.jsx';
import Login    from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// User pages
import Dashboard       from './pages/user/Dashboard.jsx';
import FindRoute       from './pages/user/FindRoute.jsx';
import RouteResults    from './pages/user/RouteResults.jsx';
import RouteDetails    from './pages/user/RouteDetails.jsx';
import ReportLocation  from './pages/user/ReportLocation.jsx';
import MyReports       from './pages/user/MyReports.jsx';
import Profile         from './pages/user/Profile.jsx';

// Admin pages
import AdminLogin      from './pages/admin/AdminLogin.jsx';
import AdminDashboard  from './pages/admin/AdminDashboard.jsx';
import AdminReports    from './pages/admin/AdminReports.jsx';
import SafetyLocations from './pages/admin/SafetyLocations.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Landing />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User — protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/find-route"   element={<FindRoute />} />
              <Route path="/route-results" element={<RouteResults />} />
              <Route path="/route-details/:id" element={<RouteDetails />} />
              <Route path="/report"       element={<ReportLocation />} />
              <Route path="/my-reports"   element={<MyReports />} />
              <Route path="/profile"      element={<Profile />} />
            </Route>
          </Route>

          {/* Admin — protected + admin role */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard"        element={<AdminDashboard />} />
              <Route path="/admin/reports"          element={<AdminReports />} />
              <Route path="/admin/safety-locations" element={<SafetyLocations />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
