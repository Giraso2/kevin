import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const TeacherDashboard = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('portalToken');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    
    if (!token || role !== 'teacher') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Teacher');
      setUserEmail(email || 'teacher@essa.rw');
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    const token = getToken();
    try {
      const [studentsRes, classesRes, assessmentsRes, attendanceRes] = await Promise.all([
        fetch(`${API_URL}/teacher/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/teacher/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/teacher/assessments`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/teacher/attendance`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (assessmentsRes.ok) setAssessments(await assessmentsRes.json());
      if (attendanceRes.ok) setAttendanceRecords(await attendanceRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create Student with custom password and parent linking
  const handleCreateStudent = async () => {
    if (classes.length === 0) {
      Swal.fire('No Classes', 'Please create a class first', 'warning');
      return;
    }
    
    const { value: formValues } = await Swal.fire({
      title: 'Create New Student',
      html: `
        <div style="text-align: left;">
          <h4>Student Information</h4>
          <input type="text" id="fullName" class="swal2-input" placeholder="Full Name *" required>
          <input type="email" id="email" class="swal2-input" placeholder="Email Address *" required>
          <input type="password" id="password" class="swal2-input" placeholder="Password *" required>
          <input type="text" id="studentId" class="swal2-input" placeholder="Student ID *" required>
          <select id="classId" class="swal2-select" required>
            <option value="">Select Class *</option>
            ${classes.map(c => `<option value="${c._id}">${c.grade} ${c.className}</option>`).join('')}
          </select>
          
          <h4 style="margin-top: 15px;">Parent/Guardian Information</h4>
          <input type="text" id="parentName" class="swal2-input" placeholder="Parent Full Name">
          <input type="email" id="parentEmail" class="swal2-input" placeholder="Parent Email">
          <input type="tel" id="parentPhone" class="swal2-input" placeholder="Parent Phone Number">
          <input type="text" id="parentOccupation" class="swal2-input" placeholder="Parent Occupation">
        </div>
      `,
      confirmButtonText: 'Create Student',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      width: '550px',
      preConfirm: () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const studentId = document.getElementById('studentId').value;
        const classId = document.getElementById('classId').value;
        
        if (!fullName || !email || !password || !studentId || !classId) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        
        return {
          fullName, email, password, studentId, classId,
          parentName: document.getElementById('parentName').value,
          parentEmail: document.getElementById('parentEmail').value,
          parentPhone: document.getElementById('parentPhone').value,
          parentOccupation: document.getElementById('parentOccupation').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/teacher/create-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          title: 'Student Created!',
          html: `
            <div style="text-align:left">
              <p><strong>Student Login Credentials:</strong></p>
              <p>Email: ${formValues.email}</p>
              <p>Password: ${formValues.password}</p>
              <hr>
              <p><strong>Parent Info:</strong></p>
              <p>${formValues.parentName || 'Not provided'}</p>
              <p>${formValues.parentPhone || ''}</p>
            </div>
          `,
          icon: 'success'
        });
        fetchData();
      } else {
        const error = await response.json();
        Swal.fire('Error', error.message || 'Failed to create student', 'error');
      }
    }
  };

  // Create Assessment with file upload
  const handleCreateAssessment = async () => {
    if (classes.length === 0) {
      Swal.fire('No Classes', 'Please create a class first', 'warning');
      return;
    }
    
    const { value: formValues } = await Swal.fire({
      title: 'Create Assessment',
      html: `
        <div style="text-align: left;">
          <input type="text" id="title" class="swal2-input" placeholder="Assessment Title *" required>
          <textarea id="description" class="swal2-textarea" placeholder="Description" rows="3"></textarea>
          <select id="type" class="swal2-select">
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
          </select>
          <input type="text" id="subject" class="swal2-input" placeholder="Subject *" required>
          <select id="classId" class="swal2-select" required>
            <option value="">Select Class *</option>
            ${classes.map(c => `<option value="${c._id}">${c.grade} ${c.className}</option>`).join('')}
          </select>
          <input type="number" id="totalPoints" class="swal2-input" placeholder="Total Points" value="100">
          <input type="date" id="dueDate" class="swal2-input" placeholder="Due Date">
          
          <h4 style="margin-top: 15px;">Attachments</h4>
          <input type="file" id="file1" class="swal2-file" accept=".pdf,.doc,.docx,.zip">
          <small style="display: block;">Upload question paper, resources, or materials</small>
        </div>
      `,
      confirmButtonText: 'Create Assessment',
      confirmButtonColor: '#3498db',
      showCancelButton: true,
      width: '600px',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const subject = document.getElementById('subject').value;
        const classId = document.getElementById('classId').value;
        
        if (!title || !subject || !classId) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        
        const fileInput = document.getElementById('file1');
        const file = fileInput.files[0];
        
        return {
          title,
          description: document.getElementById('description').value,
          type: document.getElementById('type').value,
          subject,
          classId,
          totalPoints: parseInt(document.getElementById('totalPoints').value) || 100,
          dueDate: document.getElementById('dueDate').value,
          fileName: file ? file.name : null
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/teacher/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Success!', 'Assessment created successfully', 'success');
        fetchData();
      } else {
        Swal.fire('Error', 'Failed to create assessment', 'error');
      }
    }
  };

  // Mark Attendance
  const handleMarkAttendance = async () => {
    if (classes.length === 0) {
      Swal.fire('No Classes', 'Please create a class first', 'warning');
      return;
    }
    
    // First select class
    const { value: classId } = await Swal.fire({
      title: 'Select Class',
      input: 'select',
      inputOptions: Object.fromEntries(classes.map(c => [c._id, `${c.grade} ${c.className}`])),
      inputPlaceholder: 'Select a class',
      showCancelButton: true
    });
    
    if (classId) {
      setSelectedClass(classId);
      const classStudents = students.filter(s => s.classId === classId);
      
      if (classStudents.length === 0) {
        Swal.fire('No Students', 'No students in this class', 'info');
        return;
      }
      
      const { value: attendanceData } = await Swal.fire({
        title: 'Mark Attendance',
        html: `
          <input type="date" id="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}" required>
          <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
            ${classStudents.map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <span><strong>${s.user?.fullName || s.fullName}</strong><br/><small>${s.studentId}</small></span>
                <select id="attendance-${s._id}" style="padding: 6px 12px; border-radius: 6px;">
                  <option value="Present">✅ Present</option>
                  <option value="Absent">❌ Absent</option>
                  <option value="Late">⏰ Late</option>
                  <option value="Excused">📝 Excused</option>
                </select>
              </div>
            `).join('')}
          </div>
        `,
        confirmButtonText: 'Save Attendance',
        confirmButtonColor: '#27ae60',
        showCancelButton: true,
        width: '500px',
        preConfirm: () => {
          const date = document.getElementById('date').value;
          if (!date) {
            Swal.showValidationMessage('Please select date');
            return false;
          }
          
          const records = classStudents.map(s => ({
            studentId: s._id,
            status: document.getElementById(`attendance-${s._id}`).value
          }));
          
          return { classId, date, records };
        }
      });
      
      if (attendanceData) {
        const token = getToken();
        const response = await fetch(`${API_URL}/teacher/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(attendanceData)
        });
        
        if (response.ok) {
          Swal.fire('Success!', 'Attendance marked successfully', 'success');
          fetchData();
        } else {
          Swal.fire('Error', 'Failed to mark attendance', 'error');
        }
      }
    }
  };

  const handleDeleteStudent = async (student) => {
    const result = await Swal.fire({
      title: 'Delete Student?',
      text: `Remove ${student.user?.fullName || student.fullName}? This will also delete their account.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      const response = await fetch(`${API_URL}/teacher/students/${student._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        Swal.fire('Deleted!', 'Student removed', 'success');
        fetchData();
      } else {
        Swal.fire('Error', 'Failed to delete student', 'error');
      }
    }
  };

  const handleResetPassword = async (student) => {
    const { value: newPassword } = await Swal.fire({
      title: `Reset Password for ${student.user?.fullName || student.fullName}`,
      input: 'password',
      inputLabel: 'New password',
      inputPlaceholder: 'Enter new password',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      confirmButtonColor: '#e74c3c',
      preConfirm: (pwd) => {
        if (!pwd || pwd.length < 6) {
          Swal.showValidationMessage('Password must be at least 6 characters');
          return false;
        }
        return pwd;
      }
    });
    
    if (newPassword) {
      const token = getToken();
      const response = await fetch(`${API_URL}/teacher/students/${student._id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword })
      });
      
      if (response.ok) {
        Swal.fire('Success!', `New password: ${newPassword}`, 'success');
      } else {
        Swal.fire('Error', 'Failed to reset password', 'error');
      }
    }
  };

  const handleViewCredentials = (student) => {
    Swal.fire({
      title: `${student.user?.fullName || student.fullName}'s Credentials`,
      html: `
        <div style="text-align:left">
          <p><strong>Email:</strong> ${student.user?.email || student.email}</p>
          <p><strong>Student ID:</strong> ${student.studentId}</p>
          <p><strong>Login URL:</strong> ${window.location.origin}/portal/login</p>
          <hr>
          <p><strong>Parent Contact:</strong></p>
          <p>${student.parentName || 'Not provided'}</p>
          <p>${student.parentPhone || ''}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'students', label: 'Students', icon: 'fas fa-users', color: '#9b59b6' },
    { id: 'assessments', label: 'Assessments', icon: 'fas fa-tasks', color: '#f39c12' },
    { id: 'attendance', label: 'Attendance', icon: 'fas fa-clock', color: '#e74c3c' },
    { id: 'classes', label: 'Classes', icon: 'fas fa-school', color: '#27ae60' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-circle', color: '#34495e' }
  ];

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#1a3a5c' }}></i>
        <p style={{ marginLeft: '10px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 998
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? (mobileMenuOpen ? sidebarWidth : '0px') : sidebarWidth,
        background: 'linear-gradient(180deg, #1a3a5c 0%, #0d2b42 100%)',
        color: 'white', position: 'fixed', left: 0, top: 0, bottom: 0,
        transition: 'width 0.3s ease', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', zIndex: 999
      }}>
        <div style={{ padding: sidebarCollapsed ? '1rem 0' : '1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!sidebarCollapsed && (
            <>
              <div style={{ width: '60px', height: '60px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="fas fa-chalkboard-user" style={{ fontSize: '2rem', color: '#1a3a5c' }}></i>
              </div>
              <h3>{userName}</h3>
              <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Teacher</p>
            </>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            position: 'absolute', bottom: '-12px', right: '-12px', width: '24px', height: '24px',
            background: '#ffc107', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#1a3a5c'
          }}>
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: '12px', width: '100%', padding: sidebarCollapsed ? '12px' : '12px 20px',
                background: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.9rem'
              }}>
              <i className={item.icon} style={{ width: '20px', color: item.color }}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '12px', width: '100%', padding: '12px', background: '#e74c3c',
            border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer'
          }}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1, marginLeft: isMobile ? '0' : sidebarWidth,
        transition: 'margin-left 0.3s ease', padding: '20px', width: '100%', overflowX: 'auto'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'white', padding: '10px 20px', borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: isMobile ? 'block' : 'none' }}>
              <i className="fas fa-bars"></i>
            </button>
            <h2 style={{ color: '#1a3a5c', margin: 0 }}>Teacher Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', background: '#1a3a5c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <i className="fas fa-chalkboard-user"></i>
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: '#ffc107' }}>Teacher</div>
            </div>
          </div>
        </div>

        <h1 style={{ color: '#1a3a5c', marginBottom: '20px' }}>Welcome, {userName}! 👋</h1>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: '1rem', marginBottom: '20px' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-users" style={{ fontSize: '2rem', color: '#3498db' }}></i>
                <h3>{students.length}</h3>
                <p>Students</p>
                <button onClick={() => setActiveTab('students')} style={{ marginTop: '10px', background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>View</button>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-tasks" style={{ fontSize: '2rem', color: '#f39c12' }}></i>
                <h3>{assessments.length}</h3>
                <p>Assessments</p>
                <button onClick={() => setActiveTab('assessments')} style={{ marginTop: '10px', background: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>View</button>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-school" style={{ fontSize: '2rem', color: '#27ae60' }}></i>
                <h3>{classes.length}</h3>
                <p>Classes</p>
                <button onClick={() => setActiveTab('classes')} style={{ marginTop: '10px', background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>View</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handleCreateStudent} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-user-plus"></i> Add Student
              </button>
              <button onClick={handleCreateAssessment} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-plus-circle"></i> Create Assessment
              </button>
              <button onClick={handleMarkAttendance} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-calendar-check"></i> Mark Attendance
              </button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2>My Students</h2>
              <button onClick={handleCreateStudent} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Student
              </button>
            </div>
            {students.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No students yet. Click "Add Student" to create one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#1a3a5c', color: 'white' }}>
                    <th style={{ padding: '10px' }}>Student ID</th>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Class</th>
                    <th style={{ padding: '10px' }}>Parent Contact</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const studentClass = classes.find(c => c._id === s.classId);
                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '10px' }}><code>{s.studentId}</code></td>
                        <td style={{ padding: '10px' }}>{s.user?.fullName || s.fullName}</td>
                        <td style={{ padding: '10px' }}>{s.user?.email || s.email}</td>
                        <td style={{ padding: '10px' }}>{studentClass ? `${studentClass.grade} ${studentClass.className}` : '-'}</td>
                        <td style={{ padding: '10px' }}>
                          {s.parentPhone ? (
                            <div>
                              <div>{s.parentName || '-'}</div>
                              <small>{s.parentPhone}</small>
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <button onClick={() => handleViewCredentials(s)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }} title="Credentials">
                              <i className="fas fa-key"></i>
                            </button>
                            <button onClick={() => handleResetPassword(s)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }} title="Reset Password">
                              <i className="fas fa-sync-alt"></i>
                            </button>
                            <button onClick={() => handleDeleteStudent(s)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }} title="Delete">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2>Assessments</h2>
              <button onClick={handleCreateAssessment} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Create Assessment
              </button>
            </div>
            {assessments.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No assessments yet. Click "Create Assessment" to create one.</p>
            ) : (
              assessments.map(a => {
                const targetClass = classes.find(c => c._id === a.classId);
                return (
                  <div key={a._id} style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1a3a5c' }}>{a.title}</h3>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>{a.description}</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#888' }}>
                          <span><strong>Subject:</strong> {a.subject}</span>
                          <span><strong>Type:</strong> {a.type}</span>
                          <span><strong>Points:</strong> {a.totalPoints}</span>
                          <span><strong>Class:</strong> {targetClass ? `${targetClass.grade} ${targetClass.className}` : '-'}</span>
                          {a.dueDate && <span><strong>Due:</strong> {new Date(a.dueDate).toLocaleDateString()}</span>}
                        </div>
                        {a.attachments && a.attachments.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <small>📎 Attachments: {a.attachments.map(f => f.fileName).join(', ')}</small>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ background: '#e8f4fd', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>
                          {a.submissions?.length || 0} Submissions
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <i className="fas fa-clock" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '1rem' }}></i>
            <h3>Attendance Management</h3>
            <p>Mark student attendance for your classes</p>
            <button onClick={handleMarkAttendance} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
              <i className="fas fa-calendar-check"></i> Mark Attendance
            </button>
            {attendanceRecords.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'left', overflowX: 'auto' }}>
                <h4>Recent Attendance Records</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a5c', color: 'white' }}>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px' }}>Student</th>
                      <th style={{ padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.slice(0, 10).map((record, idx) => {
                      const student = students.find(s => s._id === record.studentId);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '8px' }}>{new Date(record.date).toLocaleDateString()}</td>
                          <td style={{ padding: '8px' }}>{student?.user?.fullName || student?.fullName || '-'}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ 
                              background: record.status === 'Present' ? '#d4edda' : record.status === 'Late' ? '#fff3cd' : '#f8d7da',
                              color: record.status === 'Present' ? '#155724' : record.status === 'Late' ? '#856404' : '#721c24',
                              padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem'
                            }}>
                              {record.status === 'Present' ? '✅ Present' : record.status === 'Late' ? '⏰ Late' : '❌ Absent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>My Classes</h2>
              <button onClick={() => setActiveTab('students')} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Student
              </button>
            </div>
            {classes.length === 0 ? (
              <p>No classes yet. Academic Admin needs to assign classes to you.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: '#1a3a5c', color: 'white' }}>
                    <th style={{ padding: '10px' }}>Grade</th>
                    <th style={{ padding: '10px' }}>Class Name</th>
                    <th style={{ padding: '10px' }}>Academic Year</th>
                    <th style={{ padding: '10px' }}>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '10px' }}>{c.grade}</td>
                      <td style={{ padding: '10px' }}>{c.className}</td>
                      <td style={{ padding: '10px' }}>{c.academicYear}</td>
                      <td style={{ padding: '10px' }}>{c.students?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <i className="fas fa-chalkboard-user" style={{ fontSize: '2rem', color: '#1a3a5c' }}></i>
            </div>
            <h2>{userName}</h2>
            <p style={{ color: '#ffc107' }}>Teacher</p>
            <hr style={{ margin: '20px 0' }} />
            <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <p><strong>Email:</strong> {userEmail}</p>
              <p><strong>Role:</strong> Teacher</p>
              <p><strong>Features:</strong> Create students, manage assessments, mark attendance</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;