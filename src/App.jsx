import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Imported styles
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import PlaceholderPage from './components/PlaceholderPage';
import AttendanceView from './pages/AttendanceView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/view-edit" element={<AttendanceView />} />
        <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
        <Route path="/help" element={<PlaceholderPage title="Help & Support" />} />
      </Routes>
    </Router>
  );
}

export default App;
