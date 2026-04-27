// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import NewsPage from './pages/NewsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';

// Portals
import PortalLogin from './portals/PortalLogin';
import StudentDashboard from './portals/StudentDashboard';
import TeacherDashboard from './portals/TeacherDashboard';
import ParentDashboard from './portals/ParentDashboard';
import AdminDashboard from './portals/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Portal Login */}
        <Route path="/portal/login" element={<PortalLogin />} />
        
        {/* Protected Portal Dashboards */}
        <Route path="/portal/student" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/portal/teacher" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/portal/parent" element={
          <ProtectedRoute role="parent">
            <ParentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/portal/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        // In App.jsx, update the portal routes:
import ProtectedRoute from './components/ProtectedRoute';

// Then wrap the dashboard routes:
<Route path="/portal/student" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentDashboard />
  </ProtectedRoute>
} />
<Route path="/portal/teacher" element={
  <ProtectedRoute allowedRoles={['teacher']}>
    <TeacherDashboard />
  </ProtectedRoute>
} />
<Route path="/portal/parent" element={
  <ProtectedRoute allowedRoles={['parent']}>
    <ParentDashboard />
  </ProtectedRoute>
} />
<Route path="/portal/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
      </Routes>
    </Router>
  );
}


export default App;