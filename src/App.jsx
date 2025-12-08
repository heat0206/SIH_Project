import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Imported styles
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TeacherLogin from './pages/TeacherLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import PlaceholderPage from './components/PlaceholderPage';
import AttendanceView from './pages/AttendanceView';
import Reports from './pages/Reports';

import UserProfile from './pages/UserProfile';
import LeaveApplication from './pages/LeaveApplication';
import LeaveManagement from './pages/LeaveManagement';
import ParentDashboard from './pages/ParentDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import FaceTest from './pages/FaceTest';
import HelpSupport from './pages/HelpSupport';
import ForgotPassword from './pages/ForgotPassword';
import Timetable from './pages/Timetable';
import GovernmentReports from './pages/GovernmentReports';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

import AttendanceProcessor from './components/AttendanceProcessor';
import PWAStatus from './components/PWAStatus';

import LearnMore from './pages/LearnMore';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AttendanceProcessor />
        <PWAStatus />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<TeacherLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/attendance/view" element={<AttendanceView />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/leave" element={<LeaveApplication />} />
            <Route path="/student/timetable" element={<Timetable />} />
            <Route path="/leave-management" element={<LeaveManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/government-dashboard" element={<GovernmentDashboard />} />
            <Route path="/government/reports" element={<GovernmentReports />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/logout" element={<PlaceholderPage title="Logout" />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact Teacher" />} />
            <Route path="/face-test" element={<FaceTest />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
