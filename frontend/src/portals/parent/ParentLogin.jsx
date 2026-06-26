import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:5000/api';

const ParentLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // login, otp, link, dashboard
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [parentData, setParentData] = useState(null);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('portalToken');
    const role = localStorage.getItem('userRole');
    if (token && role === 'parent') {
      navigate('/portal/parent');
    }
  }, [navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!identifier) {
      Swal.fire('Error', 'Please enter your phone number or email', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/parent/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: identifier.includes('@') ? undefined : identifier,
          email: identifier.includes('@') ? identifier : undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // For testing, show OTP in console
        console.log('OTP:', data.otp);
        // Show OTP in alert for testing
        Swal.fire({
          title: 'OTP Sent!',
          html: `Your OTP is: <strong style="font-size:24px;color:#1a3a5c;">${data.otp}</strong><br/><br/><span style="font-size:12px;color:#888;">(For testing purposes only. In production, this will be sent via SMS/Email.)</span>`,
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: '#00bcd4'
        });
        setStep('otp');
        setTimer(60);
        Swal.fire('OTP Sent!', 'Please check your phone/email for the OTP.', 'success');
      } else {
        Swal.fire('Error', data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      Swal.fire('Error', 'Please enter a valid 6-digit OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/parent/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: identifier.includes('@') ? undefined : identifier,
          email: identifier.includes('@') ? identifier : undefined,
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('portalToken', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userName', data.user.fullName);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userPhone', data.user.phone);
        
        setAuthToken(data.token);
        setParentData(data.user);

        if (data.hasLinkedStudents) {
          // Already has linked students - go to dashboard
          Swal.fire('✅ Welcome!', `Welcome back, ${data.user.fullName}!`, 'success');
          navigate('/portal/parent');
        } else {
          // No linked students - show link form
          setLinkedStudents([]);
          setStep('link');
          Swal.fire('Welcome!', 'Please link your child\'s student ID to continue.', 'info');
        }
      } else {
        Swal.fire('Error', data.message || 'Invalid OTP', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to verify OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/parent/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: identifier.includes('@') ? undefined : identifier,
          email: identifier.includes('@') ? identifier : undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('New OTP:', data.otp);
        Swal.fire({
          title: 'New OTP Sent!',
          html: `Your new OTP is: <strong style="font-size:24px;color:#1a3a5c;">${data.otp}</strong>`,
          icon: 'info',
          timer: 3000,
          showConfirmButton: false
        });
        setTimer(60);
        Swal.fire('OTP Resent!', 'Please check your phone/email.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async (e) => {
    e.preventDefault();
    if (!studentId) {
      Swal.fire('Error', 'Please enter the student ID', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/parent/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ studentId: studentId.toUpperCase() })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire('✅ Student Linked!', `Successfully linked ${data.student.fullName} (${data.student.studentId})`, 'success');
        setStudentId('');
        // Show the linked student
        setLinkedStudents(prev => [...prev, data.student]);
        setShowLinkForm(false);
        
        // Ask if they want to add another
        const { value: addAnother } = await Swal.fire({
          title: 'Link Another Student?',
          text: 'Would you like to link another child?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Add Another',
          cancelButtonText: 'No, Go to Dashboard',
          confirmButtonColor: '#00bcd4'
        });

        if (addAnother) {
          setShowLinkForm(true);
        } else {
          navigate('/portal/parent');
        }
      } else {
        Swal.fire('Error', data.message || 'Failed to link student', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to link student. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLinking = () => {
    Swal.fire({
      title: 'Skip Linking?',
      text: 'You can always link your child later from the dashboard.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Skip',
      cancelButtonText: 'Stay'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/portal/parent');
      }
    });
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d2b42 0%, #1a3a5c 100%)',
      padding: '20px',
    },
    loginBox: {
      background: 'white',
      borderRadius: '20px',
      padding: '40px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    logo: {
      width: '70px',
      height: '70px',
      background: '#ffc107',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 15px',
      fontSize: '32px',
      color: '#1a3a5c',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#1a3a5c',
      fontFamily: 'Georgia, serif',
      margin: 0,
    },
    subtitle: {
      color: '#888',
      fontSize: '14px',
      marginTop: '5px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      padding: '12px 16px',
      border: '1.5px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    button: {
      padding: '14px',
      background: '#00bcd4',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.2s',
      marginTop: '8px',
    },
    buttonDisabled: {
      background: '#ccc',
      cursor: 'not-allowed',
    },
    link: {
      color: '#00bcd4',
      cursor: 'pointer',
      fontWeight: 600,
      textDecoration: 'none',
    },
    backLink: {
      display: 'inline-block',
      marginTop: '16px',
      color: '#888',
      cursor: 'pointer',
      fontSize: '14px',
    },
    studentCard: {
      padding: '16px',
      background: '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '12px',
      border: '1px solid #e0e0e0',
    },
    infoBox: {
      background: '#e8f5e9',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '13px',
      color: '#2e7d32',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  };

  // Login Step
  if (step === 'login') {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <i className="fas fa-users"></i>
            </div>
            <h1 style={styles.title}>Parent Portal</h1>
            <p style={styles.subtitle}>Login with your phone number</p>
          </div>

          <form onSubmit={handleSendOTP} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. +250 788 123 456"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00bcd4'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? '⏳ Sending...' : '📱 Send OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                By continuing, you agree to our Terms of Service
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // OTP Verification Step
  if (step === 'otp') {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1 style={styles.title}>Verify OTP</h1>
            <p style={styles.subtitle}>Enter the 6-digit code sent to your phone</p>
          </div>

          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00bcd4'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                disabled={loading}
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? '⏳ Verifying...' : '🔓 Verify OTP'}
            </button>

            <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <span
                onClick={handleResendOTP}
                style={{
                  ...styles.link,
                  opacity: timer > 0 ? 0.5 : 1,
                  cursor: timer > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
              </span>
              <span
                onClick={() => setStep('login')}
                style={styles.backLink}
              >
                ← Back
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Link Student Step
  if (step === 'link') {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.loginBox, maxWidth: '500px' }}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <i className="fas fa-child"></i>
            </div>
            <h1 style={styles.title}>Link Your Child</h1>
            <p style={styles.subtitle}>Enter your child's Student ID to link their account</p>
          </div>

          <div style={styles.infoBox}>
            <i className="fas fa-info-circle"></i>
            <span>Student ID can be found on the student's ID card or report card.</span>
          </div>

          {linkedStudents.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a3a5c' }}>
                Linked Students:
              </p>
              {linkedStudents.map(s => (
                <div key={s._id} style={styles.studentCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{s.fullName}</strong>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        ID: {s.studentId} · {s.className}
                      </div>
                    </div>
                    <i className="fas fa-check-circle" style={{ color: '#27ae60' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {showLinkForm ? (
            <form onSubmit={handleLinkStudent} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="e.g. STU20260001"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#00bcd4'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                disabled={loading}
              >
                {loading ? '⏳ Linking...' : '🔗 Link Student'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLinkForm(true)}
                style={{
                  ...styles.button,
                  flex: 1,
                  background: '#00bcd4',
                }}
              >
                ➕ Add Another Student
              </button>
              <button
                onClick={handleSkipLinking}
                style={{
                  ...styles.button,
                  flex: 1,
                  background: '#27ae60',
                }}
              >
                🚀 Go to Dashboard
              </button>
            </div>
          )}

          {linkedStudents.length === 0 && !showLinkForm && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span
                onClick={handleSkipLinking}
                style={styles.link}
              >
                Skip for now
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ParentLogin;