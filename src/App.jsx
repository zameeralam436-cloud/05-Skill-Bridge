import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerProfile from './pages/EmployerProfile';
import AdminDashboard from './pages/AdminDashboard';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Role-Protected Dashboard & Profile Routes */}
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <ErrorBoundary>
                      <StudentDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <ErrorBoundary>
                      <StudentProfile />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <ErrorBoundary>
                      <EmployerDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer-profile"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <ErrorBoundary>
                      <EmployerProfile />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ErrorBoundary>
                      <AdminDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
