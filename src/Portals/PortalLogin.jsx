import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PortalLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Demo credentials for different roles
  const demoCredentials = {
    student: { 
      email: 'student@essa.rw', 
      password: 'student123', 
      name: 'Jean Paul Ndayisaba', 
      dashboard: '/portal/student', 
      grade: 'S6', 
      class: 'Software Development',
      studentId: 'ESS2024001',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    teacher: { 
      email: 'teacher@essa.rw', 
      password: 'teacher123', 
      name: 'Mukansanga Marie', 
      dashboard: '/portal/teacher', 
      subject: 'Mathematics', 
      department: 'Science',
      teacherId: 'TCH2024001',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    parent: { 
      email: 'parent@essa.rw', 
      password: 'parent123', 
      name: 'Habimana Jean', 
      dashboard: '/portal/parent', 
      childName: 'Alice Habimana', 
      childClass: 'S4',
      parentId: 'PRN2024001',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    admin: { 
      email: 'admin@essa.rw', 
      password: 'admin123', 
      name: 'Dr. Uwimana Jean Paul', 
      dashboard: '/portal/admin', 
      role: 'Head Administrator',
      adminId: 'ADM2024001',
      avatar: 'https://randomuser.me/api/portraits/men/88.jpg'
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const creds = demoCredentials[selectedRole];
    
    if (email === creds.email && password === creds.password) {
      // Store user data in localStorage
      const userData = {
        token: 'demo-token-' + Date.now(),
        role: selectedRole,
        name: creds.name,
        email: email,
        ...creds
      };
      
      localStorage.setItem('portalToken', userData.token);
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userName', creds.name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedRole', selectedRole);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
      }
      
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

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Reset Password',
      html: `
        <input type="email" id="resetEmail" class="swal2-input" placeholder="Enter your email">
        <select id="resetRole" class="swal2-select">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
      `,
      confirmButtonText: 'Send Reset Link',
      confirmButtonColor: '#1e3c72',
      preConfirm: () => {
        const email = document.getElementById('resetEmail').value;
        const role = document.getElementById('resetRole').value;
        if (!email) {
          Swal.showValidationMessage('Please enter your email');
          return false;
        }
        return { email, role };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Reset Link Sent!',
          text: `A password reset link has been sent to ${result.value.email}`,
          icon: 'success',
          confirmButtonColor: '#1e3c72'
        });
      }
    });
  };

  // Load remembered credentials
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedRole = localStorage.getItem('rememberedRole');
    if (rememberedEmail && rememberedRole) {
      setEmail(rememberedEmail);
      setSelectedRole(rememberedRole);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="portal-login-page">
        <div className="container">
          <div className="login-container">
            <div className="login-header">
              <div className="login-logo">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h1>Portal Login</h1>
              <p>Access your personalized dashboard</p>
            </div>
            
            <div className="role-selector">
              <button 
                className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
                onClick={() => setSelectedRole('student')}
              >
                <i className="fas fa-user-graduate"></i>
                <span>Student</span>
              </button>
              <button 
                className={`role-btn ${selectedRole === 'teacher' ? 'active' : ''}`}
                onClick={() => setSelectedRole('teacher')}
              >
                <i className="fas fa-chalkboard-user"></i>
                <span>Teacher</span>
              </button>
              <button 
                className={`role-btn ${selectedRole === 'parent' ? 'active' : ''}`}
                onClick={() => setSelectedRole('parent')}
              >
                <i className="fas fa-users"></i>
                <span>Parent</span>
              </button>
              <button 
                className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                <i className="fas fa-user-shield"></i>
                <span>Admin</span>
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-password" onClick={handleForgotPassword}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>

            <div className="demo-info">
              <p><i className="fas fa-info-circle"></i> Demo Credentials:</p>
              <div className="demo-creds">
                <div className="demo-cred">
                  <span className="role-badge student">Student</span>
                  <code>student@essa.rw / student123</code>
                </div>
                <div className="demo-cred">
                  <span className="role-badge teacher">Teacher</span>
                  <code>teacher@essa.rw / teacher123</code>
                </div>
                <div className="demo-cred">
                  <span className="role-badge parent">Parent</span>
                  <code>parent@essa.rw / parent123</code>
                </div>
                <div className="demo-cred">
                  <span className="role-badge admin">Admin</span>
                  <code>admin@essa.rw / admin123</code>
                </div>
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