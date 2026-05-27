import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const PortalLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        title: 'Missing Credentials',
        text: 'Please enter both email and password.',
        icon: 'warning',
        confirmButtonColor: '#1a3a5c'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('portalToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.fullName);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userId', data._id);
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        Swal.fire({
          title: 'Login Successful!',
          text: `Welcome back, ${data.fullName}!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#fff',
          backdrop: true
        });
        
        setTimeout(() => {
          const dashboards = {
            super_admin: '/portal/super-admin',
            academic_admin: '/portal/academic-admin',
            teacher: '/portal/teacher',
            student: '/portal/student',
            parent: '/portal/parent'
          };
          navigate(dashboards[data.role] || '/portal/login');
        }, 1500);
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: data.message || 'Invalid email or password. Please try again.',
          icon: 'error',
          confirmButtonColor: '#1a3a5c'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Connection Error',
        text: 'Unable to connect to the server. Please check your internet connection.',
        icon: 'error',
        confirmButtonColor: '#1a3a5c'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="portal-login-page">
      {/* Background Animated Elements */}
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      
      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1>ESSA Nyarugunga</h1>
            <p>Student & Staff Portal</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link" onClick={(e) => {
                e.preventDefault();
                Swal.fire({
                  title: 'Reset Password',
                  text: 'Please contact your system administrator to reset your password.',
                  icon: 'info',
                  confirmButtonColor: '#1a3a5c'
                });
              }}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login to Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              <i className="fas fa-shield-alt"></i> 
              Secure Portal Access
            </p>
            <p className="copyright">
              © {new Date().getFullYear()} ESSA Nyarugunga School
            </p>
          </div>
        </div>

        {/* Features Side */}
        <div className="features-side">
          <div className="features-content">
            <h2>Welcome to the Portal</h2>
            <p>Access your personalized dashboard to manage academic activities, track progress, and stay connected.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="feature-text">
                  <h4>Track Progress</h4>
                  <p>Monitor academic performance and attendance</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="feature-text">
                  <h4>Manage Assignments</h4>
                  <p>Submit work and track deadlines</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="feature-text">
                  <h4>View Schedule</h4>
                  <p>Access class timetables and events</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="feature-text">
                  <h4>Stay Connected</h4>
                  <p>Communicate with teachers and staff</p>
                </div>
              </div>
            </div>

            <div className="support-badge">
              <i className="fas fa-headset"></i>
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Reset & Base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .portal-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Animated Background Shapes */
        .bg-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 20s infinite ease-in-out;
        }

        .bg-shape-1 {
          width: 300px;
          height: 300px;
          background: white;
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .bg-shape-2 {
          width: 200px;
          height: 200px;
          background: white;
          bottom: -50px;
          left: -50px;
          animation-delay: 5s;
        }

        .bg-shape-3 {
          width: 150px;
          height: 150px;
          background: white;
          bottom: 30%;
          right: 10%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        /* Login Wrapper */
        .login-wrapper {
          display: flex;
          max-width: 1100px;
          width: 100%;
          background: white;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Login Card */
        .login-card {
          flex: 1;
          padding: 3rem;
          background: white;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .logo-icon i {
          font-size: 2rem;
          color: white;
        }

        .logo-section h1 {
          font-size: 1.5rem;
          color: #1a3a5c;
          margin-bottom: 0.3rem;
        }

        .logo-section p {
          color: #666;
          font-size: 0.85rem;
        }

        /* Form Styles */
        .login-form {
          margin-top: 1.5rem;
        }

        .input-group {
          margin-bottom: 1.2rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.85rem;
          color: #333;
        }

        .input-field {
          position: relative;
        }

        .input-field i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 1rem;
          z-index: 1;
        }

        .input-field input {
          width: 100%;
          padding: 14px 15px 14px 45px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .input-field input:focus {
          outline: none;
          border-color: #1a3a5c;
          box-shadow: 0 0 0 3px rgba(26, 58, 92, 0.1);
        }

        .toggle-password {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }

        .toggle-password:hover {
          color: #1a3a5c;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1.5rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          position: relative;
          padding-left: 5px;
        }

        .checkbox-label input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          background-color: white;
          border: 2px solid #ddd;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .checkbox-label input:checked ~ .checkmark {
          background-color: #1a3a5c;
          border-color: #1a3a5c;
        }

        .checkbox-label input:checked ~ .checkmark::after {
          content: '✓';
          position: absolute;
          left: 4px;
          top: 0;
          color: white;
          font-size: 12px;
        }

        .checkbox-label span:last-child {
          font-size: 0.85rem;
          color: #555;
        }

        .forgot-link {
          font-size: 0.85rem;
          color: #ffc107;
          text-decoration: none;
          transition: color 0.3s;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        /* Login Button */
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(26, 58, 92, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Footer */
        .login-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
          text-align: center;
        }

        .login-footer p {
          font-size: 0.75rem;
          color: #888;
          margin: 5px 0;
        }

        .login-footer p i {
          margin-right: 5px;
        }

        /* Features Side */
        .features-side {
          flex: 1;
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          padding: 3rem;
          color: white;
          display: flex;
          align-items: center;
        }

        .features-content {
          width: 100%;
        }

        .features-content h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .features-content > p {
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .feature-icon {
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon i {
          font-size: 1.2rem;
          color: #ffc107;
        }

        .feature-text h4 {
          margin-bottom: 0.3rem;
          font-size: 1rem;
        }

        .feature-text p {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .support-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 900px) {
          .login-wrapper {
            flex-direction: column;
            max-width: 500px;
          }
          
          .features-side {
            display: none;
          }
          
          .login-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .portal-login-page {
            padding: 15px;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .logo-icon {
            width: 55px;
            height: 55px;
          }
          
          .logo-icon i {
            font-size: 1.5rem;
          }
          
          .logo-section h1 {
            font-size: 1.3rem;
          }
          
          .input-field input {
            padding: 12px 15px 12px 40px;
            font-size: 0.9rem;
          }
          
          .form-options {
            flex-direction: column;
            gap: 0.8rem;
            align-items: flex-start;
          }
          
          .login-btn {
            padding: 12px;
            font-size: 0.9rem;
          }
        }

        /* Loading Animation */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fa-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PortalLogin;