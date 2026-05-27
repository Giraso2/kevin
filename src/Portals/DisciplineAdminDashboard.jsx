import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import ChatModal from '../components/ChatModal';

// API Base URL
const API_URL = 'http://localhost:5000/api';

const DisciplineAdminDashboard = () => {
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [disciplineCases, setDisciplineCases] = useState([]);
  const [pendingCases, setPendingCases] = useState([]);
  const [resolvedCases, setResolvedCases] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [schoolAnnouncements, setSchoolAnnouncements] = useState([]);
  const [classDisciplineStats, setClassDisciplineStats] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chat states
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('portalToken');

  const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`http://localhost:5000/api${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  };

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
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    const userId = localStorage.getItem('userId');
    if (userId) newSocket.emit('join', userId);
    newSocket.on('newMessage', () => fetchUnreadCount());
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'discipline_admin') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Discipline Admin');
      fetchAllData();
      fetchUnreadCount();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [casesData, permissionsData, announcementsData, statsData, studentsData] = await Promise.all([
        apiRequest('/discipline-admin/cases').catch(() => []),
        apiRequest('/discipline-admin/permissions').catch(() => []),
        apiRequest('/discipline-admin/announcements').catch(() => []),
        apiRequest('/discipline-admin/class-stats').catch(() => []),
        apiRequest('/discipline-admin/students').catch(() => [])
      ]);
      
      setDisciplineCases(Array.isArray(casesData) ? casesData : []);
      setPendingCases(Array.isArray(casesData) ? casesData.filter(c => c.status === 'pending') : []);
      setResolvedCases(Array.isArray(casesData) ? casesData.filter(c => c.status === 'resolved') : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      setSchoolAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      setClassDisciplineStats(Array.isArray(statsData) ? statsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest('/messages/unread/count');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleOpenChat = (user = null) => {
    if (user) setSelectedChatUser(user);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedChatUser(null);
    fetchUnreadCount();
  };

  // ==================== DISCIPLINE CASE MANAGEMENT ====================
  const handleTakeAction = async (caseItem) => {
    const { value: action } = await Swal.fire({
      title: `Action for ${caseItem.studentName}`,
      html: `<p class="case-desc">📝 ${caseItem.description}</p>`,
      input: 'select',
      inputOptions: {
        'warning': '⚠️ Warning',
        'detention': '📝 Detention',
        'community_service': '🤝 Community Service',
        'suspension': '🚫 Suspension',
        'expulsion': '❌ Expulsion'
      },
      inputPlaceholder: 'Select action',
      showCancelButton: true,
      confirmButtonText: 'Apply Action',
      confirmButtonColor: '#e74c3c'
    });
    
    if (action) {
      const { value: details } = await Swal.fire({
        title: 'Action Details',
        input: 'textarea',
        inputLabel: 'Additional details',
        inputPlaceholder: action === 'suspension' ? 'Number of days suspended...' : 'Additional notes...',
        showCancelButton: true,
        confirmButtonText: 'Submit'
      });
      
      const result = await Swal.fire({
        title: 'Announce to School?',
        text: 'Do you want to announce this disciplinary action to the whole school?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Announce',
        cancelButtonText: 'No, Just Apply'
      });
      
      try {
        await apiRequest(`/discipline-admin/cases/${caseItem._id}/action`, {
          method: 'PUT',
          body: JSON.stringify({ action, actionDetails: details || '', status: 'resolved' })
        });
        
        if (result.isConfirmed) {
          await apiRequest('/discipline-admin/announcements', {
            method: 'POST',
            body: JSON.stringify({
              title: `Disciplinary Action: ${action.toUpperCase()}`,
              content: `${caseItem.studentName} has been ${action}. ${details || ''}`,
              priority: action === 'expulsion' || action === 'suspension' ? 'urgent' : 'high'
            })
          });
          Swal.fire('Action Applied!', `Student has been ${action} and announced to the school.`, 'success');
        } else {
          Swal.fire('Action Applied!', `Student has been ${action}.`, 'success');
        }
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to apply action', 'error');
      }
    }
  };

  // ==================== PERMISSION MANAGEMENT ====================
  const handlePermissionAction = async (permission, status) => {
    const actionText = status === 'approved' ? 'Approve' : 'Reject';
    const result = await Swal.fire({
      title: `${actionText} Permission`,
      text: `${permission.requesterName} requested: ${permission.reason}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: actionText,
      confirmButtonColor: status === 'approved' ? '#27ae60' : '#e74c3c',
      input: status === 'rejected' ? 'textarea' : null,
      inputLabel: status === 'rejected' ? 'Reason for rejection' : ''
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/discipline-admin/permissions/${permission._id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, rejectionReason: result.value || '' })
        });
        
        if (status === 'approved') {
          const { value: print } = await Swal.fire({
            title: 'Permission Approved',
            text: 'Would you like to download the permission slip?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Download Slip',
            cancelButtonText: 'No'
          });
          
          if (print) {
            generatePermissionSlip(permission);
          }
        }
        
        Swal.fire(`Permission ${status}!`, '', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to update permission', 'error');
      }
    }
  };

  const generatePermissionSlip = (permission) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Permission Slip</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .slip { max-width: 600px; margin: 0 auto; border: 2px solid #1a3a5c; padding: 20px; border-radius: 10px; }
          .header { text-align: center; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #1a3a5c; margin: 0; }
          .content { margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; }
          .stamp { text-align: center; margin-top: 30px; }
          .stamp span { border: 2px solid #e74c3c; padding: 5px 20px; color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="header">
            <h1>ESSA Nyarugunga School</h1>
            <p>Permission Slip</p>
          </div>
          <div class="content">
            <p><strong>Student Name:</strong> ${permission.studentName || permission.requesterName}</p>
            <p><strong>Class:</strong> ${permission.className || 'N/A'}</p>
            <p><strong>Permission Type:</strong> ${permission.type}</p>
            <p><strong>Reason:</strong> ${permission.reason}</p>
            <p><strong>Date:</strong> ${new Date(permission.fromDate).toLocaleDateString()} to ${new Date(permission.toDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: green;">APPROVED</span></p>
            <p><strong>Approved By:</strong> ${userName} (Discipline Admin)</p>
          </div>
          <div class="stamp">
            <span>APPROVED</span>
          </div>
          <div class="footer">
            <p>This is an official permission slip from ESSA Nyarugunga School.</p>
            <p>Please present this slip when required.</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ==================== ANNOUNCEMENT MANAGEMENT ====================
  const handlePostAnnouncement = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Post School Announcement',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-heading"></i>
            <input type="text" id="title" placeholder="Title" required>
          </div>
          <div class="form-group">
            <i class="fas fa-align-left"></i>
            <textarea id="content" placeholder="Announcement content" required rows="4"></textarea>
          </div>
          <div class="form-group">
            <i class="fas fa-flag"></i>
            <select id="priority">
              <option value="normal">ℹ️ Normal</option>
              <option value="high">⚠️ High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Post Announcement',
      confirmButtonColor: '#3498db',
      showCancelButton: true,
      width: '500px',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        if (!title || !content) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return {
          title, content,
          priority: document.getElementById('priority').value,
          audience: ['all']
        };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/super-admin/announcements', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Posted!', 'Announcement sent to all users', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to post announcement', 'error');
      }
    }
  };

  // ==================== REPORT STUDENT ====================
  const handleReportStudent = async () => {
    const studentsList = students.map(s => ({ id: s._id, name: s.fullName, class: s.className }));
    
    const { value: formValues } = await Swal.fire({
      title: 'Report Student Misconduct',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-user"></i>
            <select id="studentId">
              <option value="">Select Student</option>
              ${studentsList.map(s => `<option value="${s.id}">${s.name} - ${s.class}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <i class="fas fa-tag"></i>
            <select id="category">
              <option value="Misconduct">Misconduct</option>
              <option value="Uniform Violation">Uniform Violation</option>
              <option value="Truancy">Truancy</option>
              <option value="Disrespect">Disrespect</option>
              <option value="Fighting">Fighting</option>
              <option value="Cheating">Cheating</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <i class="fas fa-align-left"></i>
            <textarea id="description" placeholder="Detailed description of the incident" required rows="4"></textarea>
          </div>
        </div>
      `,
      confirmButtonText: 'Report Student',
      confirmButtonColor: '#e74c3c',
      showCancelButton: true,
      width: '500px',
      preConfirm: () => {
        const studentId = document.getElementById('studentId').value;
        const description = document.getElementById('description').value;
        if (!studentId || !description) {
          Swal.showValidationMessage('Please select student and provide description');
          return false;
        }
        const student = studentsList.find(s => s.id === studentId);
        return {
          studentId,
          studentName: student.name,
          category: document.getElementById('category').value,
          description
        };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/discipline-admin/cases/report', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Reported!', 'Case has been recorded for review', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to report student', 'error');
      }
    }
  };

  const filteredCases = disciplineCases.filter(c => {
    const matchesClass = selectedClass === 'all' || c.className === selectedClass;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSearch = c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesStatus && matchesSearch;
  });

  const pendingPermissions = permissions.filter(p => p.status === 'pending');
  const classOptions = ['all', ...new Set(disciplineCases.map(c => c.className).filter(Boolean))];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'cases', label: 'Cases', icon: 'fas fa-gavel', color: '#e74c3c' },
    { id: 'permissions', label: 'Permissions', icon: 'fas fa-file-alt', color: '#9b59b6' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', color: '#f39c12' },
    { id: 'students', label: 'Students', icon: 'fas fa-users', color: '#27ae60' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-circle', color: '#34495e' }
  ];

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';
  const sidebarWidthMobile = mobileMenuOpen ? sidebarWidth : '0px';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="discipline-admin-dashboard">
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: isMobile ? sidebarWidthMobile : sidebarWidth }}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="logo-area">
              <div className="logo-icon"><i className="fas fa-gavel"></i></div>
              <div className="logo-text"><h3>ESSA Portal</h3><p>Discipline Admin</p></div>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar"><i className="fas fa-gavel"></i></div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <h4>{userName}</h4>
              <span className="user-role">Discipline Administrator</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); if (isMobile) setMobileMenuOpen(false); }}>
              <i className={item.icon} style={{ color: item.color }}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.id === 'permissions' && pendingPermissions.length > 0 && !sidebarCollapsed && (
                <span className="nav-badge">{pendingPermissions.length}</span>
              )}
              {item.id === 'cases' && pendingCases.length > 0 && !sidebarCollapsed && (
                <span className="nav-badge urgent">{pendingCases.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="chat-btn" onClick={() => handleOpenChat()}>
            <i className="fas fa-comments"></i>
            {!sidebarCollapsed && <span>Messages</span>}
            {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ marginLeft: isMobile ? '0' : sidebarWidth }}>
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <h2>Discipline Admin Dashboard</h2>
          </div>
          <div className="top-bar-right">
            <div className="notification-bell" onClick={() => handleOpenChat()}>
              <i className="fas fa-envelope"></i>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            <div className="user-menu">
              <div className="user-avatar-small"><i className="fas fa-gavel"></i></div>
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role-badge">Discipline Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome, {userName.split(' ')[0]}! ⚖️</h1>
            <p>Manage disciplinary cases, permissions, and school announcements.</p>
          </div>
          <div className="welcome-date">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon" style={{ background: '#fdecea' }}><i className="fas fa-gavel" style={{ color: '#e74c3c' }}></i></div>
                <div className="stat-info"><h3>{disciplineCases.length}</h3><p>Total Cases</p></div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><i className="fas fa-clock" style={{ color: '#f39c12' }}></i></div>
                <div className="stat-info"><h3>{pendingCases.length}</h3><p>Pending Cases</p></div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><i className="fas fa-check-circle" style={{ color: '#27ae60' }}></i></div>
                <div className="stat-info"><h3>{resolvedCases.length}</h3><p>Resolved Cases</p></div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><i className="fas fa-file-alt" style={{ color: '#9b59b6' }}></i></div>
                <div className="stat-info"><h3>{pendingPermissions.length}</h3><p>Pending Permissions</p><span className="stat-trend">Awaiting approval</span></div></div>
            </div>

            <div className="quick-actions">
              <button onClick={handleReportStudent} className="action-btn danger"><i className="fas fa-exclamation-triangle"></i> Report Student</button>
              <button onClick={handlePostAnnouncement} className="action-btn warning"><i className="fas fa-bullhorn"></i> Make Announcement</button>
              <button onClick={() => handleOpenChat()} className="action-btn info"><i className="fas fa-comments"></i> Messages {unreadCount > 0 && `(${unreadCount})`}</button>
            </div>

            <div className="stats-cards">
              <div className="stats-card">
                <h3><i className="fas fa-chart-bar"></i> Discipline by Class</h3>
                {classDisciplineStats.map(stat => (
                  <div key={stat.className} className="class-stat">
                    <span>{stat.className}</span>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stat.cases / Math.max(...classDisciplineStats.map(s => s.cases), 1)) * 100}%`, background: stat.cases > 10 ? '#e74c3c' : stat.cases > 5 ? '#f39c12' : '#27ae60' }}></div></div>
                    <span className="count">{stat.cases} cases</span>
                  </div>
                ))}
              </div>
              <div className="stats-card">
                <h3><i className="fas fa-chart-pie"></i> Case Categories</h3>
                {[...new Set(disciplineCases.map(c => c.category))].map(cat => {
                  const count = disciplineCases.filter(c => c.category === cat).length;
                  return (<div key={cat} className="category-stat"><span>{cat}</span><span className="count">{count}</span></div>);
                })}
              </div>
            </div>

            <div className="recent-activities">
              <h3><i className="fas fa-history"></i> Recent Activities</h3>
              {disciplineCases.slice(0, 5).map(c => (
                <div key={c._id} className="activity-item"><i className={`fas ${c.status === 'resolved' ? 'fa-check-circle' : 'fa-clock'}`} style={{ color: c.status === 'resolved' ? '#27ae60' : '#f39c12' }}></i>
                  <div><strong>{c.studentName}</strong> - {c.category}<br/><small>{new Date(c.createdAt).toLocaleDateString()}</small></div>
                  <span className={`status ${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div className="data-card">
            <div className="card-header"><h2><i className="fas fa-gavel"></i> Discipline Cases</h2>
              <button onClick={handleReportStudent} className="btn-primary-sm"><i className="fas fa-plus"></i> Report Student</button>
            </div>
            <div className="filters"><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classOptions.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}</select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="all">All Status</option><option value="pending">Pending</option><option value="resolved">Resolved</option></select>
              <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="table-responsive"><table className="data-table"><thead><tr><th>Student</th><th>Class</th><th>Category</th><th>Description</th><th>Reported</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filteredCases.map(c => (<tr key={c._id}><td><strong>{c.studentName}</strong></td><td>{c.className || 'N/A'}</td><td>{c.category}</td><td>{c.description?.substring(0, 50)}...</td><td><small>{new Date(c.createdAt).toLocaleDateString()}</small></td><td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
              <td>{c.status === 'pending' ? <button onClick={() => handleTakeAction(c)} className="review-btn">Take Action</button> : <span className="action-text">{c.action}</span>}</td></tr>))}
              {filteredCases.length === 0 && <tr><td colSpan="7" className="no-data">No cases found</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="data-card">
            <div className="card-header"><h2><i className="fas fa-file-alt"></i> Permission Requests</h2><div className="stats-badge">Pending: {pendingPermissions.length}</div></div>
            <div className="table-responsive"><table className="data-table"><thead><tr><th>Requester</th><th>Role</th><th>Type</th><th>Reason</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {permissions.map(p => (<tr key={p._id}><td><strong>{p.requesterName}</strong></td><td>{p.requesterRole}</td><td>{p.type}</td><td>{p.reason?.substring(0, 40)}...</td><td><small>{new Date(p.fromDate).toLocaleDateString()} to {new Date(p.toDate).toLocaleDateString()}</small></td><td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
              <td>{p.status === 'pending' ? <div className="action-buttons"><button onClick={() => handlePermissionAction(p, 'approved')} className="approve-btn">Approve</button><button onClick={() => handlePermissionAction(p, 'rejected')} className="reject-btn">Reject</button></div> : p.status === 'approved' && <button onClick={() => generatePermissionSlip(p)} className="download-btn"><i className="fas fa-download"></i> Slip</button>}</td></tr>))}
              {permissions.length === 0 && <tr><td colSpan="7" className="no-data">No permission requests</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="data-card">
            <div className="card-header"><h2><i className="fas fa-bullhorn"></i> School Announcements</h2><button onClick={handlePostAnnouncement} className="btn-primary-sm"><i className="fas fa-plus"></i> Post Announcement</button></div>
            <div className="announcements-list">{schoolAnnouncements.map(ann => (<div key={ann._id} className={`announcement-item ${ann.priority}`}><div className="announcement-header"><div><h3>{ann.title}</h3><span className={`priority-badge ${ann.priority}`}>{ann.priority === 'urgent' ? '🔴 URGENT' : ann.priority === 'high' ? '⚠️ HIGH' : 'ℹ️ NORMAL'}</span></div></div><p>{ann.content}</p><div className="announcement-footer"><span><i className="fas fa-clock"></i> {new Date(ann.createdAt).toLocaleDateString()}</span><span><i className="fas fa-user"></i> {ann.author || 'Discipline Admin'}</span></div></div>))}
            {schoolAnnouncements.length === 0 && <p className="no-data">No announcements yet</p>}</div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="data-card"><div className="card-header"><h2><i className="fas fa-users"></i> Student Directory</h2><input type="text" placeholder="Search students..." className="search-input" onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="table-responsive"><table className="data-table"><thead><tr><th>Student Name</th><th>Class</th><th>Parent Contact</th><th>Cases</th><th>Actions</th></tr></thead><tbody>
              {students.filter(s => s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (<tr key={s._id}><td><strong>{s.fullName}</strong></td><td>{s.className || 'N/A'}</td><td>{s.parentPhone || 'N/A'}</td><td><span className={`case-count ${disciplineCases.filter(c => c.studentId === s._id).length > 0 ? 'has-cases' : ''}`}>{disciplineCases.filter(c => c.studentId === s._id).length} cases</span></td><td><button onClick={() => handleReportStudent(s)} className="report-btn">Report</button></td></tr>))}
              {students.length === 0 && <tr><td colSpan="5" className="no-data">No students found</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-card"><div className="profile-header"><div className="profile-avatar"><i className="fas fa-gavel"></i></div><h2>{userName}</h2><p className="profile-role">Discipline Administrator</p></div>
            <div className="profile-details"><div className="detail-item"><i className="fas fa-envelope"></i><div><label>Email</label><p>{localStorage.getItem('userEmail') || 'discipline@essa.rw'}</p></div></div>
            <div className="detail-item"><i className="fas fa-shield-alt"></i><div><label>Role</label><p>Discipline Administrator</p></div></div>
            <div className="detail-item"><i className="fas fa-gavel"></i><div><label>Permissions</label><p>Manage cases, approve permissions, post announcements</p></div></div></div>
            <button className="change-password-btn" onClick={() => Swal.fire({ title: 'Change Password', html: `<input type="password" id="current" class="swal2-input" placeholder="Current"><input type="password" id="new" class="swal2-input" placeholder="New"><input type="password" id="confirm" class="swal2-input" placeholder="Confirm">`, confirmButtonText: 'Update', preConfirm: () => { const newPass = document.getElementById('new').value; const confirm = document.getElementById('confirm').value; if (newPass !== confirm) { Swal.showValidationMessage('Passwords do not match'); return false; } return { newPassword: newPass }; } }).then(result => { if (result.isConfirmed) Swal.fire('Success', 'Password updated', 'success'); })}>Change Password</button>
          </div>
        )}
      </main>

      <ChatModal isOpen={isChatModalOpen} onClose={handleCloseChat} recipient={selectedChatUser} onMessageSent={fetchUnreadCount} />

      <style>{`
        .discipline-admin-dashboard { font-family: 'Inter', sans-serif; background: #f0f2f5; min-height: 100vh; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1a3a5c, #0d2b42); color: white; }
        .loading-spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #ffc107; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 998; }
        .sidebar { position: fixed; left: 0; top: 0; bottom: 0; background: linear-gradient(180deg, #1a3a5c 0%, #0d2b42 100%); color: white; transition: width 0.3s ease; overflow: hidden; display: flex; flex-direction: column; z-index: 999; box-shadow: 2px 0 10px rgba(0,0,0,0.1); }
        .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); position: relative; }
        .logo-area { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 45px; height: 45px; background: #ffc107; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .logo-icon i { font-size: 1.5rem; color: #1a3a5c; }
        .logo-text h3 { margin: 0; font-size: 1rem; }
        .logo-text p { margin: 0; font-size: 0.7rem; opacity: 0.8; }
        .collapse-btn { position: absolute; bottom: -12px; right: -12px; width: 24px; height: 24px; background: #ffc107; border: none; border-radius: 50%; cursor: pointer; color: #1a3a5c; }
        .user-profile { padding: 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .user-avatar { width: 60px; height: 60px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; }
        .user-avatar i { font-size: 1.8rem; color: #ffc107; }
        .user-info h4 { margin: 0; font-size: 0.9rem; }
        .user-role { font-size: 0.7rem; opacity: 0.8; }
        .sidebar-nav { flex: 1; padding: 1rem 0; }
        .nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 20px; background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 0.9rem; transition: all 0.3s; position: relative; }
        .nav-item i { width: 20px; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: #ffc107; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #ffc107; border-right: 3px solid #ffc107; }
        .nav-badge { position: absolute; right: 20px; background: #27ae60; color: white; border-radius: 10px; padding: 2px 6px; font-size: 0.7rem; }
        .nav-badge.urgent { background: #e74c3c; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 8px; }
        .chat-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; background: #3498db; border: none; border-radius: 8px; color: white; cursor: pointer; position: relative; }
        .chat-badge { position: absolute; right: 10px; background: #e74c3c; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; }
        .logout-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; background: #e74c3c; border: none; border-radius: 8px; color: white; cursor: pointer; }
        .main-content { transition: margin-left 0.3s ease; padding: 20px; min-height: 100vh; }
        .top-bar { background: white; padding: 12px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .top-bar-left { display: flex; align-items: center; gap: 15px; }
        .mobile-menu-btn { display: none; background: #1a3a5c; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .top-bar-right { display: flex; align-items: center; gap: 20px; }
        .notification-bell { position: relative; cursor: pointer; font-size: 1.2rem; color: #666; }
        .notification-badge { position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 50%; }
        .user-menu { display: flex; align-items: center; gap: 10px; }
        .user-avatar-small { width: 35px; height: 35px; background: #1a3a5c; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
        .user-details { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; font-size: 0.85rem; }
        .user-role-badge { font-size: 0.7rem; color: #ffc107; }
        .welcome-banner { background: linear-gradient(135deg, #1a3a5c, #2c5f8a); border-radius: 16px; padding: 25px 30px; margin-bottom: 25px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .welcome-text h1 { font-size: 1.5rem; margin-bottom: 5px; }
        .welcome-date { background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 30px; font-size: 0.85rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .stat-icon { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .stat-icon i { font-size: 1.5rem; }
        .stat-info h3 { font-size: 1.8rem; margin: 0; color: #1a3a5c; }
        .stat-info p { margin: 5px 0 0; color: #666; }
        .quick-actions { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; }
        .action-btn { padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
        .action-btn.danger { background: #e74c3c; color: white; }
        .action-btn.warning { background: #f39c12; color: white; }
        .action-btn.info { background: #3498db; color: white; }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .stats-card { background: white; border-radius: 16px; padding: 20px; }
        .stats-card h3 { margin-bottom: 15px; color: #1a3a5c; }
        .class-stat { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .class-stat span:first-child { width: 80px; font-size: 0.85rem; }
        .progress-bar { flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .class-stat .count { font-size: 0.75rem; color: #666; width: 50px; text-align: right; }
        .category-stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .recent-activities { background: white; border-radius: 16px; padding: 20px; }
        .recent-activities h3 { margin-bottom: 15px; color: #1a3a5c; }
        .activity-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #eee; }
        .activity-item .status { margin-left: auto; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; }
        .activity-item .status.pending { background: #fff3e0; color: #f39c12; }
        .activity-item .status.resolved { background: #e8f5e9; color: #27ae60; }
        .data-card { background: white; border-radius: 16px; padding: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .btn-primary-sm { background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .filters select, .filters input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; }
        .table-responsive { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #1a3a5c; font-weight: 600; }
        .data-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
        .status-badge.pending { background: #fff3e0; color: #f39c12; }
        .status-badge.resolved { background: #e8f5e9; color: #27ae60; }
        .status-badge.approved { background: #e8f5e9; color: #27ae60; }
        .status-badge.rejected { background: #fdecea; color: #e74c3c; }
        .review-btn { background: #f39c12; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
        .approve-btn { background: #27ae60; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
        .reject-btn { background: #e74c3c; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
        .download-btn { background: #3498db; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
        .report-btn { background: #e74c3c; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
        .action-buttons { display: flex; gap: 8px; }
        .announcements-list { display: flex; flex-direction: column; gap: 15px; }
        .announcement-item { padding: 15px; border-radius: 12px; background: #f8f9fa; }
        .announcement-item.urgent { background: #fdecea; border-left: 4px solid #e74c3c; }
        .announcement-item.high { background: #fff3e0; border-left: 4px solid #f39c12; }
        .priority-badge { font-size: 0.7rem; margin-left: 10px; }
        .announcement-footer { margin-top: 10px; display: flex; gap: 15px; font-size: 0.7rem; color: #999; }
        .search-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; width: 250px; }
        .case-count { font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; background: #f8f9fa; }
        .case-count.has-cases { background: #fdecea; color: #e74c3c; }
        .stats-badge { background: #e8f5e9; color: #27ae60; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
        .profile-card { background: white; border-radius: 20px; overflow: hidden; max-width: 600px; margin: 0 auto; }
        .profile-header { background: linear-gradient(135deg, #1a3a5c, #2c5f8a); color: white; padding: 40px; text-align: center; }
        .profile-avatar { width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
        .profile-avatar i { font-size: 3rem; color: #ffc107; }
        .profile-details { padding: 30px; }
        .detail-item { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee; }
        .detail-item i { font-size: 1.2rem; color: #1a3a5c; width: 30px; }
        .change-password-btn { width: calc(100% - 60px); margin: 0 30px 30px; padding: 12px; background: #1a3a5c; color: white; border: none; border-radius: 8px; cursor: pointer; }
        .no-data { text-align: center; padding: 40px; color: #999; }
        @media (max-width: 768px) { .mobile-menu-btn { display: block; } .welcome-text h1 { font-size: 1.2rem; } .stats-grid { grid-template-columns: 1fr; } .quick-actions { flex-direction: column; } .stats-cards { grid-template-columns: 1fr; } .filters { flex-direction: column; } .search-input { width: 100%; } }
      `}</style>
    </div>
  );
};

export default DisciplineAdminDashboard;