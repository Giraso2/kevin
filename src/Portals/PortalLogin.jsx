import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../services/api';  // This should now work

const PortalLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email, password, selectedRole);
      
      // Store user data in localStorage
      localStorage.setItem('portalToken', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userName', response.fullName);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userData', JSON.stringify(response));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedRole', selectedRole);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
      }
      
      Swal.fire({
        title: 'Login Successful!',
        text: `Welcome back, ${response.fullName}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Navigate based on role
      const dashboardPaths = {
        student: '/portal/student',
        teacher: '/portal/teacher',
        parent: '/portal/parent',
        admin: '/portal/admin'
      };
      
      setTimeout(() => {
        navigate(dashboardPaths[response.role]);
      }, 1500);
      
    } catch (error) {
      Swal.fire({
        title: 'Login Failed',
        text: error.message || 'Invalid email or password',
        icon: 'error',
        confirmButtonColor: '#1e3c72'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: 'Reset Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'your@email.com',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      confirmButtonColor: '#1e3c72'
    });
    
    if (email) {
      try {
        await authAPI.forgotPassword(email);
        Swal.fire({
          title: 'Reset Link Sent!',
          text: `A password reset link has been sent to ${email}`,
          icon: 'success',
          confirmButtonColor: '#1e3c72'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#1e3c72'
        });
      }
    }
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

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Login
                  </>
                )}
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