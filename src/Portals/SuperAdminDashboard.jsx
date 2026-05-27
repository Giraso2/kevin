import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import ChatModal from '../components/ChatModal';

// Import images
import profileBg from '../assets/hero-bg.jpg';

const SuperAdminDashboard = () => {
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [admins, setAdmins] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [disciplineCases, setDisciplineCases] = useState([]);
  const [disciplineStats, setDisciplineStats] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [permissionTrends, setPermissionTrends] = useState({});
  
  // Chat states
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
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

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      newSocket.emit('join', userId);
    }
    
    newSocket.on('newMessage', (message) => {
      fetchUnreadCount();
    });
    
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'super_admin') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Super Administrator');
      fetchAllData();
      fetchUnreadCount();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    const token = getToken();
    try {
      const [adminsRes, announcementsRes, casesRes, permissionsRes] = await Promise.all([
        fetch(`${API_URL}/super-admin/admins`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/super-admin/announcements`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/super-admin/discipline-cases`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/super-admin/permissions`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (adminsRes.ok) setAdmins(await adminsRes.json());
      if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
      if (casesRes.ok) {
        const data = await casesRes.json();
        setDisciplineCases(data.cases || []);
        setDisciplineStats(data.stats || {});
      }
      if (permissionsRes.ok) {
        const data = await permissionsRes.json();
        setPermissions(data.permissions || []);
        setPermissionTrends(data.trends || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/messages/unread/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleOpenChat = (user = null) => {
    if (user) {
      setSelectedChatUser(user);
    }
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedChatUser(null);
    fetchUnreadCount();
  };

  // Create Sub-Admin
  const handleCreateAdmin = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create Sub-Admin',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-user"></i>
            <input type="text" id="fullName" placeholder="Full Name *" required>
          </div>
          <div class="form-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" placeholder="Email *" required>
          </div>
          <div class="form-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" placeholder="Password (default: admin123)">
          </div>
          <div class="form-group">
            <i class="fas fa-phone"></i>
            <input type="tel" id="phone" placeholder="Phone Number">
          </div>
          <div class="form-group">
            <i class="fas fa-user-tag"></i>
            <select id="role">
              <option value="academic_admin">📚 Academic Admin</option>
              <option value="discipline_admin">⚖️ Discipline Admin</option>
              <option value="accounts_admin">💰 Accounts Admin</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Create Admin',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      width: '500px',
      customClass: {
        popup: 'admin-swal-popup'
      },
      preConfirm: () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        if (!fullName || !email) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return {
          fullName, email,
          password: document.getElementById('password').value || 'admin123',
          phone: document.getElementById('phone').value,
          role: document.getElementById('role').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/super-admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire({
          title: '✅ Admin Created!',
          html: `
            <div class="admin-credentials">
              <p><strong>Name:</strong> ${formValues.fullName}</p>
              <p><strong>Email:</strong> ${formValues.email}</p>
              <p><strong>Password:</strong> <code>${formValues.password}</code></p>
              <p><strong>Role:</strong> ${formValues.role.replace('_', ' ').toUpperCase()}</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#27ae60'
        });
        fetchAllData();
      } else {
        const error = await response.json();
        Swal.fire('Error', error.message || 'Failed to create admin', 'error');
      }
    }
  };

  // Post Announcement
  const handlePostAnnouncement = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Post Announcement',
      html: `
        <div class="announcement-form">
          <div class="form-group">
            <i class="fas fa-heading"></i>
            <input type="text" id="title" placeholder="Title *" required>
          </div>
          <div class="form-group">
            <i class="fas fa-align-left"></i>
            <textarea id="content" placeholder="Content *" required rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <i class="fas fa-users"></i>
              <select id="audience">
                <option value="all">📢 All Users</option>
                <option value="students">🎓 Students</option>
                <option value="teachers">👨‍🏫 Teachers</option>
                <option value="parents">👪 Parents</option>
                <option value="admins">👑 Admins</option>
              </select>
            </div>
            <div class="form-group half">
              <i class="fas fa-flag"></i>
              <select id="priority">
                <option value="normal">ℹ️ Normal</option>
                <option value="high">⚠️ High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: '📢 Post Announcement',
      confirmButtonColor: '#3498db',
      showCancelButton: true,
      width: '550px',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        if (!title || !content) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return {
          title, content,
          audience: document.getElementById('audience').value,
          priority: document.getElementById('priority').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/super-admin/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('✅ Success!', 'Announcement posted successfully', 'success');
        fetchAllData();
      } else {
        Swal.fire('Error', 'Failed to post announcement', 'error');
      }
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const result = await Swal.fire({
      title: 'Delete Admin?',
      text: `Remove ${admin.fullName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/super-admin/admins/${admin._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Admin removed successfully', 'success');
      fetchAllData();
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Announcement?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/super-admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Announcement removed', 'success');
      fetchAllData();
    }
  };

  const handleDisciplineAction = async (disciplineCase) => {
    const { value: action } = await Swal.fire({
      title: `Action for ${disciplineCase.studentName || 'Student'}`,
      html: `<p class="case-description">📝 ${disciplineCase.description}</p>`,
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
        inputPlaceholder: 'e.g., Suspended for 3 days...',
        showCancelButton: true,
        confirmButtonText: 'Submit'
      });
      
      const token = getToken();
      await fetch(`${API_URL}/super-admin/discipline-cases/${disciplineCase._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          action,
          actionDetails: details || '',
          status: 'resolved'
        })
      });
      
      Swal.fire('Action Applied!', `Student has been ${action}`, 'success');
      fetchAllData();
    }
  };

  const handlePermissionAction = async (permission, status) => {
    const result = await Swal.fire({
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Permission`,
      text: `${permission.requesterName} requested: ${permission.reason}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: status === 'approved' ? '✅ Approve' : '❌ Reject',
      confirmButtonColor: status === 'approved' ? '#27ae60' : '#e74c3c',
      input: status === 'rejected' ? 'textarea' : null,
      inputLabel: status === 'rejected' ? 'Reason for rejection' : ''
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/super-admin/permissions/${permission._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, rejectionReason: result.value || '' })
      });
      Swal.fire(`Permission ${status}!`, '', 'success');
      fetchAllData();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'admins', label: 'Sub-Admins', icon: 'fas fa-users-cog', color: '#27ae60' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', color: '#f39c12' },
    { id: 'discipline', label: 'Discipline', icon: 'fas fa-gavel', color: '#e74c3c' },
    { id: 'permissions', label: 'Permissions', icon: 'fas fa-file-alt', color: '#9b59b6' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-cog', color: '#34495e' }
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
    <div className="super-admin-dashboard">
      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: isMobile ? sidebarWidthMobile : sidebarWidth }}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="logo-area">
              <div className="logo-icon">
                <i className="fas fa-crown"></i>
              </div>
              <div className="logo-text">
                <h3>ESSA Portal</h3>
                <p>Super Admin</p>
              </div>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <i className="fas fa-crown"></i>
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <h4>{userName}</h4>
              <span className="user-role">Super Administrator</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); if (isMobile) setMobileMenuOpen(false); }}
            >
              <i className={item.icon} style={{ color: item.color }}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: isMobile ? '0' : sidebarWidth }}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <h2>Super Admin Dashboard</h2>
          </div>
          <div className="top-bar-right">
            <div className="notification-bell" onClick={() => handleOpenChat()}>
              <i className="fas fa-envelope"></i>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            <div className="user-menu">
              <div className="user-avatar-small">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role-badge">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome back, {userName.split(' ')[0]}! 👑</h1>
            <p>Here's what's happening across your school management system today.</p>
          </div>
          <div className="welcome-date">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                  <i className="fas fa-users-cog" style={{ color: '#27ae60' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{admins.length}</h3>
                  <p>Sub-Admins</p>
                  <span className="stat-trend positive">+{admins.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length} this month</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fff3e0' }}>
                  <i className="fas fa-bullhorn" style={{ color: '#f39c12' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{announcements.length}</h3>
                  <p>Announcements</p>
                  <span className="stat-trend">{announcements.filter(a => a.priority === 'urgent').length} urgent</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fdecea' }}>
                  <i className="fas fa-gavel" style={{ color: '#e74c3c' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{disciplineStats.total || 0}</h3>
                  <p>Discipline Cases</p>
                  <span className="stat-trend negative">{disciplineStats.pending || 0} pending</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f3e5f5' }}>
                  <i className="fas fa-file-alt" style={{ color: '#9b59b6' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{permissionTrends.total || 0}</h3>
                  <p>Permissions</p>
                  <span className="stat-trend">{permissionTrends.approved || 0} approved</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button onClick={handleCreateAdmin} className="action-btn primary">
                <i className="fas fa-user-plus"></i> Create Sub-Admin
              </button>
              <button onClick={handlePostAnnouncement} className="action-btn secondary">
                <i className="fas fa-bullhorn"></i> Post Announcement
              </button>
              <button onClick={() => handleOpenChat()} className="action-btn info">
                <i className="fas fa-comment-dots"></i> Messages
                {unreadCount > 0 && <span className="btn-badge">{unreadCount}</span>}
              </button>
            </div>

            {/* Pending Items */}
            <div className="pending-items-grid">
              <div className="pending-card">
                <h3><i className="fas fa-gavel"></i> Pending Discipline Cases</h3>
                {disciplineCases.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                  <div key={c._id} className="pending-item">
                    <div className="item-info">
                      <strong>{c.studentName || 'Student'}</strong>
                      <p>{c.category}</p>
                    </div>
                    <button onClick={() => handleDisciplineAction(c)} className="item-action">Review</button>
                  </div>
                ))}
                {disciplineCases.filter(c => c.status === 'pending').length === 0 && (
                  <p className="no-items">No pending discipline cases</p>
                )}
              </div>
              <div className="pending-card">
                <h3><i className="fas fa-file-alt"></i> Pending Permissions</h3>
                {permissions.filter(p => p.status === 'pending').slice(0, 5).map(p => (
                  <div key={p._id} className="pending-item">
                    <div className="item-info">
                      <strong>{p.requesterName}</strong>
                      <p>{p.type}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handlePermissionAction(p, 'approved')} className="approve-btn">✓</button>
                      <button onClick={() => handlePermissionAction(p, 'rejected')} className="reject-btn">✗</button>
                    </div>
                  </div>
                ))}
                {permissions.filter(p => p.status === 'pending').length === 0 && (
                  <p className="no-items">No pending permissions</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-users-cog"></i> System Administrators</h2>
              <button onClick={handleCreateAdmin} className="btn-primary-sm">
                <i className="fas fa-plus"></i> Add Admin
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin._id}>
                      <td><strong>{admin.fullName}</strong></td>
                      <td>{admin.email}</td>
                      <td><span className={`role-badge ${admin.role}`}>{admin.role.replace('_', ' ')}</span></td>
                      <td>{admin.phone || '-'}</td>
                      <td>
                        <button onClick={() => handleDeleteAdmin(admin)} className="delete-btn-sm">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-bullhorn"></i> School Announcements</h2>
              <button onClick={handlePostAnnouncement} className="btn-primary-sm">
                <i className="fas fa-plus"></i> Post Announcement
              </button>
            </div>
            <div className="announcements-list">
              {announcements.map(ann => (
                <div key={ann._id} className={`announcement-item ${ann.priority}`}>
                  <div className="announcement-header">
                    <div>
                      <h3>{ann.title}</h3>
                      <span className={`priority-badge ${ann.priority}`}>
                        {ann.priority === 'urgent' ? '🔴 URGENT' : ann.priority === 'high' ? '⚠️ HIGH' : 'ℹ️ NORMAL'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(ann._id)} className="delete-btn-sm">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p>{ann.content}</p>
                  <div className="announcement-footer">
                    <span><i className="fas fa-users"></i> {ann.audience === 'all' ? 'All Users' : ann.audience}</span>
                    <span><i className="fas fa-calendar"></i> {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="no-data">No announcements yet. Click "Post Announcement" to create one.</p>
              )}
            </div>
          </div>
        )}

        {/* Discipline Tab */}
        {activeTab === 'discipline' && (
          <div className="data-card">
            <h2><i className="fas fa-gavel"></i> Discipline Cases</h2>
            <div className="discipline-stats">
              <div className="stat-chip">Total: {disciplineStats.total || 0}</div>
              <div className="stat-chip pending">Pending: {disciplineStats.pending || 0}</div>
              <div className="stat-chip resolved">Resolved: {disciplineStats.resolved || 0}</div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Reported By</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplineCases.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.studentName || 'Student'}</strong></td>
                      <td>{c.category}</td>
                      <td>{c.description?.substring(0, 60)}...</td>
                      <td>{c.reporterName || 'Teacher'}</td>
                      <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                      <td>
                        {c.status === 'pending' ? (
                          <button onClick={() => handleDisciplineAction(c)} className="review-btn">Review</button>
                        ) : (
                          <span className="action-text">{c.action}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="data-card">
            <h2><i className="fas fa-file-alt"></i> Permission Requests</h2>
            <div className="permission-stats">
              <div className="stat-chip approved">Approved: {permissionTrends.approved || 0}</div>
              <div className="stat-chip pending">Pending: {permissionTrends.pending || 0}</div>
              <div className="stat-chip rejected">Rejected: {permissionTrends.rejected || 0}</div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.requesterName}</strong><br/><small>{p.requesterRole}</small></td>
                      <td>{p.type}</td>
                      <td>{p.reason?.substring(0, 50)}...</td>
                      <td><small>{new Date(p.fromDate).toLocaleDateString()}<br/>to<br/>{new Date(p.toDate).toLocaleDateString()}</small></td>
                      <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                      <td>
                        {p.status === 'pending' ? (
                          <div className="action-buttons">
                            <button onClick={() => handlePermissionAction(p, 'approved')} className="approve-btn-sm">Approve</button>
                            <button onClick={() => handlePermissionAction(p, 'rejected')} className="reject-btn-sm">Reject</button>
                          </div>
                        ) : (
                          <span className="action-text">{p.action || p.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fas fa-crown"></i>
              </div>
              <h2>{userName}</h2>
              <p className="profile-role">Super Administrator</p>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <label>Email Address</label>
                  <p>{localStorage.getItem('userEmail')}</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <label>Role</label>
                  <p>Super Administrator</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-key"></i>
                <div>
                  <label>Permissions</label>
                  <p>Full System Access</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <div>
                  <label>Member Since</label>
                  <p>2024</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChat}
        recipient={selectedChatUser}
        onMessageSent={fetchUnreadCount}
      />

      <style>{`
        /* Global Styles */
        .super-admin-dashboard {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f0f2f5;
          min-height: 100vh;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #1a3a5c, #0d2b42);
          color: white;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.2);
          border-top-color: #ffc107;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(180deg, #1a3a5c 0%, #0d2b42 100%);
          color: white;
          transition: width 0.3s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 999;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          position: relative;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 45px;
          height: 45px;
          background: #ffc107;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-icon i { font-size: 1.5rem; color: #1a3a5c; }
        .logo-text h3 { margin: 0; font-size: 1rem; }
        .logo-text p { margin: 0; font-size: 0.7rem; opacity: 0.8; }
        .collapse-btn {
          position: absolute;
          bottom: -12px;
          right: -12px;
          width: 24px;
          height: 24px;
          background: #ffc107;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #1a3a5c;
        }
        .user-profile {
          padding: 1.5rem;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .user-avatar {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
        }
        .user-avatar i { font-size: 1.8rem; color: #ffc107; }
        .user-info h4 { margin: 0; font-size: 0.9rem; }
        .user-role { font-size: 0.7rem; opacity: 0.8; }
        .sidebar-nav { flex: 1; padding: 1rem 0; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .nav-item i { width: 20px; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: #ffc107; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #ffc107; border-right: 3px solid #ffc107; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: #e74c3c;
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .logout-btn:hover { opacity: 0.9; transform: translateY(-2px); }

        /* Main Content */
        .main-content {
          transition: margin-left 0.3s ease;
          padding: 20px;
          min-height: 100vh;
        }
        .top-bar {
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .mobile-menu-btn {
          display: none;
          background: #1a3a5c;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .notification-bell {
          position: relative;
          cursor: pointer;
          font-size: 1.2rem;
          color: #666;
        }
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e74c3c;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 50%;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-avatar-small {
          width: 35px;
          height: 35px;
          background: #1a3a5c;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .user-details { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; font-size: 0.85rem; }
        .user-role-badge { font-size: 0.7rem; color: #ffc107; }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          border-radius: 16px;
          padding: 25px 30px;
          margin-bottom: 25px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .welcome-text h1 { font-size: 1.8rem; margin-bottom: 5px; }
        .welcome-text p { opacity: 0.9; }
        .welcome-date {
          background: rgba(255,255,255,0.15);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.85rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .stat-icon {
          width: 55px;
          height: 55px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon i { font-size: 1.5rem; }
        .stat-info h3 { font-size: 1.8rem; margin: 0; color: #1a3a5c; }
        .stat-info p { margin: 5px 0 0; color: #666; font-size: 0.85rem; }
        .stat-trend { font-size: 0.7rem; color: #27ae60; display: block; margin-top: 5px; }
        .stat-trend.negative { color: #e74c3c; }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }
        .action-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .action-btn.primary { background: #27ae60; color: white; }
        .action-btn.secondary { background: #3498db; color: white; }
        .action-btn.info { background: #9b59b6; color: white; position: relative; }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .btn-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.7rem;
        }

        /* Pending Items */
        .pending-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .pending-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
        }
        .pending-card h3 { margin-bottom: 15px; color: #1a3a5c; }
        .pending-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .item-info strong { display: block; font-size: 0.85rem; }
        .item-info p { font-size: 0.75rem; color: #666; margin: 2px 0 0; }
        .item-action { background: #f39c12; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; color: white; }
        .item-actions { display: flex; gap: 5px; }
        .approve-btn { background: #27ae60; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; }
        .reject-btn { background: #e74c3c; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; }
        .no-items { text-align: center; padding: 20px; color: #999; }

        /* Data Card */
        .data-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .card-header h2 { margin: 0; color: #1a3a5c; }
        .btn-primary-sm {
          background: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delete-btn-sm {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .review-btn {
          background: #f39c12;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .approve-btn-sm {
          background: #27ae60;
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .reject-btn-sm {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .action-buttons { display: flex; gap: 5px; }

        /* Tables */
        .table-responsive { overflow-x: auto; }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          text-align: left;
          padding: 12px;
          background: #f8f9fa;
          color: #1a3a5c;
          font-weight: 600;
        }
        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }
        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .role-badge.academic_admin { background: #e8f5e9; color: #27ae60; }
        .role-badge.discipline_admin { background: #fdecea; color: #e74c3c; }
        .role-badge.accounts_admin { background: #e3f2fd; color: #3498db; }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .status-badge.pending { background: #fff3e0; color: #f39c12; }
        .status-badge.approved { background: #e8f5e9; color: #27ae60; }
        .status-badge.rejected { background: #fdecea; color: #e74c3c; }
        .status-badge.resolved { background: #e8f5e9; color: #27ae60; }

        /* Announcements */
        .announcements-list { display: flex; flex-direction: column; gap: 15px; }
        .announcement-item {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 15px;
        }
        .announcement-item.urgent { background: #fdecea; border-left: 4px solid #e74c3c; }
        .announcement-item.high { background: #fff3e0; border-left: 4px solid #f39c12; }
        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .announcement-header h3 { margin: 0; }
        .priority-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 10px;
        }
        .priority-badge.urgent { background: #e74c3c; color: white; }
        .priority-badge.high { background: #f39c12; color: white; }
        .priority-badge.normal { background: #27ae60; color: white; }
        .announcement-footer {
          margin-top: 10px;
          display: flex;
          gap: 15px;
          font-size: 0.7rem;
          color: #999;
        }

        /* Profile Card */
        .profile-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          max-width: 600px;
          margin: 0 auto;
        }
        .profile-header {
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          color: white;
          padding: 40px;
          text-align: center;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }
        .profile-avatar i { font-size: 3rem; color: #ffc107; }
        .profile-header h2 { margin: 0; }
        .profile-role { opacity: 0.9; margin-top: 5px; }
        .profile-details { padding: 30px; }
        .detail-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-item i { font-size: 1.2rem; color: #1a3a5c; width: 30px; }
        .detail-item label { display: block; font-size: 0.7rem; color: #999; }
        .detail-item p { margin: 0; font-weight: 500; }

        /* Chips */
        .discipline-stats, .permission-stats {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .stat-chip {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
        }
        .stat-chip.pending { background: #fff3e0; color: #f39c12; }
        .stat-chip.resolved, .stat-chip.approved { background: #e8f5e9; color: #27ae60; }
        .stat-chip.rejected { background: #fdecea; color: #e74c3c; }

        /* Responsive */
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block; }
          .sidebar { width: ${sidebarWidthMobile}; }
          .welcome-text h1 { font-size: 1.4rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .pending-items-grid { grid-template-columns: 1fr; }
          .quick-actions { flex-direction: column; }
          .action-btn { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;