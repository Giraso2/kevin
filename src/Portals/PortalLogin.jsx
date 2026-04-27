// src/portals/PortalLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PortalLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Demo credentials for different roles
  const demoCredentials = {
    student: { email: 'student@essa.rw', password: 'student123', name: 'Jean Paul', dashboard: '/portal/student', grade: 'S6', class: 'Software Development' },
    teacher: { email: 'teacher@essa.rw', password: 'teacher123', name: 'Mukansanga Marie', dashboard: '/portal/teacher', subject: 'Mathematics', department: 'Science' },
    parent: { email: 'parent@essa.rw', password: 'parent123', name: 'Habimana Jean', dashboard: '/portal/parent', childName: 'Alice Habimana', childClass: 'S4' },
    admin: { email: 'kevin@1234', password: 'kevin1', name: 'Dr. Uwimana', dashboard: '/portal/admin', role: 'Administrator' }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const creds = demoCredentials[selectedRole];
    
    if (email === creds.email && password === creds.password) {
      // Store user data in localStorage
      localStorage.setItem('portalToken', 'demo-token-' + Date.now());
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userName', creds.name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userData', JSON.stringify(creds));
      
      Swal.fire({
        title: 'Login Successful!',
        text: `Welcome back, ${creds.name}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate(creds.dashboard);
    } else {
      Swal.fire({
        title: 'Login Failed',
        text: 'Invalid email or password. Please check your credentials.',
        icon: 'error',
        confirmButtonColor: '#1e3c72'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="portal-login-page">
        <div className="container">
          <div className="login-container">
            <div className="login-header">
              <i className="fas fa-graduation-cap"></i>
              <h1>Portal Login</h1>
              <p>Access your personalized dashboard</p>
            </div>
            
            <div className="role-selector">
              <button 
                className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
                onClick={() => setSelectedRole('student')}
              >
                <i className="fas fa-user-graduate"></i> Student
              </button>
              <button 
                className={`role-btn ${selectedRole === 'teacher' ? 'active' : ''}`}
                onClick={() => setSelectedRole('teacher')}
              >
                <i className="fas fa-chalkboard-user"></i> Teacher
              </button>
              <button 
                className={`role-btn ${selectedRole === 'parent' ? 'active' : ''}`}
                onClick={() => setSelectedRole('parent')}
              >
                <i className="fas fa-users"></i> Parent
              </button>
              <button 
                className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                <i className="fas fa-user-shield"></i> Admin
              </button>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>

            <div className="demo-info">
              <p><i className="fas fa-info-circle"></i> Demo Credentials:</p>
              <div className="demo-creds">
                <p><strong>Student:</strong> student@essa.rw / student123</p>
                <p><strong>Teacher:</strong> teacher@essa.rw / teacher123</p>
                <p><strong>Parent:</strong> parent@essa.rw / parent123</p>
                <p><strong>Admin:</strong> admin@essa.rw / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PortalLogin;