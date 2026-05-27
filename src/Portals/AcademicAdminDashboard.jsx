import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import ChatModal from '../components/ChatModal';

// API Base URL
const API_URL = 'http://localhost:5000/api';

const AcademicAdminDashboard = () => {
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Chat states
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('portalToken');

  // Helper function for API calls
  const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
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

  // Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    const userId = localStorage.getItem('userId');
    if (userId) newSocket.emit('join', userId);
    newSocket.on('newMessage', () => {
      fetchUnreadCount();
    });
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'academic_admin') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Academic Admin');
      fetchAllData();
      fetchUnreadCount();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [teachersData, classesData, newsData, galleryData, perfData, classPerfData, annData] = await Promise.all([
        apiRequest('/academic-admin/teachers-list').catch(() => []),
        apiRequest('/academic-admin/classes').catch(() => []),
        apiRequest('/academic-admin/news').catch(() => []),
        apiRequest('/academic-admin/gallery').catch(() => []),
        apiRequest('/academic-admin/students-performance').catch(() => []),
        apiRequest('/academic-admin/class-performance').catch(() => []),
        apiRequest('/announcements').catch(() => [])
      ]);
      
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setNews(Array.isArray(newsData) ? newsData : []);
      setGallery(Array.isArray(galleryData) ? galleryData : []);
      setStudentPerformance(Array.isArray(perfData) ? perfData : []);
      setClassPerformance(Array.isArray(classPerfData) ? classPerfData : []);
      setAnnouncements(Array.isArray(annData) ? annData : []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to load data', 'error');
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

  // ==================== TEACHER MANAGEMENT ====================
  const handleCreateTeacher = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create Teacher Account',
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
            <input type="password" id="password" placeholder="Password (default: teacher123)">
          </div>
          <div class="form-group">
            <i class="fas fa-book"></i>
            <input type="text" id="subject" placeholder="Subject">
          </div>
          <div class="form-group">
            <i class="fas fa-phone"></i>
            <input type="tel" id="phone" placeholder="Phone Number">
          </div>
        </div>
      `,
      confirmButtonText: 'Create Teacher',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      width: '500px',
      preConfirm: () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        if (!fullName || !email) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address');
          return false;
        }
        return {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: document.getElementById('password').value || 'teacher123',
          subject: document.getElementById('subject').value || 'General',
          phone: document.getElementById('phone').value || ''
        };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/academic-admin/create-teacher-credentials', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire({
          title: '✅ Teacher Created!',
          html: `
            <div class="credentials-box">
              <p><strong>Name:</strong> ${formValues.fullName}</p>
              <p><strong>Email:</strong> ${formValues.email}</p>
              <p><strong>Password:</strong> <code>${formValues.password}</code></p>
              <p><strong>Subject:</strong> ${formValues.subject}</p>
            </div>
          `,
          icon: 'success'
        });
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to create teacher', 'error');
      }
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const result = await Swal.fire({
      title: 'Delete Teacher?',
      text: `Remove ${teacher.fullName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/teachers/${teacher._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'Teacher removed successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete teacher', 'error');
      }
    }
  };

  // ==================== CLASS MANAGEMENT ====================
  const handleCreateClass = async () => {
    if (teachers.length === 0) {
      Swal.fire('No Teachers', 'Please create teachers first.', 'warning');
      return;
    }
    
    const teacherOptions = { '': '-- Select Teacher (Optional) --' };
    teachers.forEach(teacher => {
      teacherOptions[teacher._id] = `${teacher.fullName} (${teacher.subject || 'General'})`;
    });
    
    const { value: formValues } = await Swal.fire({
      title: 'Create Class',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-tag"></i>
            <input type="text" id="className" placeholder="Class Name (e.g., A, B, C)" required>
          </div>
          <div class="form-group">
            <i class="fas fa-layer-group"></i>
            <select id="grade">
              <option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
              <option value="S4">S4</option><option value="S5">S5</option><option value="S6">S6</option>
            </select>
          </div>
          <div class="form-group">
            <i class="fas fa-calendar"></i>
            <input type="text" id="academicYear" placeholder="Academic Year (e.g., 2026)" required>
          </div>
          <div class="form-group">
            <i class="fas fa-chalkboard-user"></i>
            <select id="teacherId">
              ${Object.entries(teacherOptions).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Create Class',
      confirmButtonColor: '#3498db',
      showCancelButton: true,
      width: '500px',
      preConfirm: () => {
        const className = document.getElementById('className').value;
        const grade = document.getElementById('grade').value;
        const academicYear = document.getElementById('academicYear').value;
        if (!className || !grade || !academicYear) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        return { className, grade, academicYear, teacherId: document.getElementById('teacherId').value || null };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/academic-admin/classes', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Success!', 'Class created successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to create class', 'error');
      }
    }
  };

  const handleDeleteClass = async (classItem) => {
    const result = await Swal.fire({
      title: 'Delete Class?',
      text: `Remove ${classItem.grade} ${classItem.className}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/classes/${classItem._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'Class removed successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete class', 'error');
      }
    }
  };

  const handleAssignTeacher = async (classItem) => {
    if (teachers.length === 0) {
      Swal.fire({ title: 'No Teachers', text: 'Please create teachers first.', icon: 'warning' });
      return;
    }
    
    const teacherOptions = {};
    teachers.forEach(teacher => {
      teacherOptions[teacher._id] = `${teacher.fullName} (${teacher.subject || 'General'})`;
    });
    teacherOptions['none'] = '-- Remove Teacher --';
    
    const { value: selectedTeacherId } = await Swal.fire({
      title: `Assign Teacher to ${classItem.grade} ${classItem.className}`,
      text: 'Select a teacher:',
      input: 'select',
      inputOptions: teacherOptions,
      showCancelButton: true,
      confirmButtonText: 'Assign',
      confirmButtonColor: '#27ae60',
      preConfirm: (selected) => {
        if (!selected) {
          Swal.showValidationMessage('Please select a teacher');
          return false;
        }
        return selected;
      }
    });
    
    if (selectedTeacherId) {
      const teacherIdToAssign = selectedTeacherId === 'none' ? null : selectedTeacherId;
      
      try {
        Swal.fire({ title: 'Assigning...', allowOutsideClick: false, showConfirmButton: false, willOpen: () => Swal.showLoading() });
        
        const data = await apiRequest(`/academic-admin/classes/${classItem._id}/assign-teacher`, {
          method: 'PUT',
          body: JSON.stringify({ teacherId: teacherIdToAssign })
        });
        
        Swal.close();
        
        if (data.success) {
          setClasses(prevClasses => prevClasses.map(c => c._id === data.class._id ? data.class : c));
          Swal.fire({ title: 'Success!', text: teacherIdToAssign ? 'Teacher assigned successfully' : 'Teacher removed', icon: 'success', timer: 2000 });
        }
      } catch (error) {
        Swal.close();
        Swal.fire({ title: 'Error', text: error.message || 'Failed to assign teacher', icon: 'error' });
      }
    }
  };

  const handleRefreshClasses = async () => {
    Swal.fire({ title: 'Refreshing...', allowOutsideClick: false, showConfirmButton: false, willOpen: () => Swal.showLoading() });
    
    try {
      const classesData = await apiRequest('/academic-admin/classes');
      setClasses(Array.isArray(classesData) ? classesData : []);
      Swal.close();
      Swal.fire({ title: 'Refreshed!', text: 'Class list updated', icon: 'success', timer: 1500 });
    } catch (error) {
      Swal.close();
      Swal.fire('Error', 'Failed to refresh', 'error');
    }
  };

  // ==================== NEWS MANAGEMENT ====================
  const handleCreateNews = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create News/Event',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-heading"></i>
            <input type="text" id="title" placeholder="Title" required>
          </div>
          <div class="form-group">
            <i class="fas fa-align-left"></i>
            <textarea id="summary" placeholder="Short Summary" required rows="3"></textarea>
          </div>
          <div class="form-group">
            <i class="fas fa-file-alt"></i>
            <textarea id="content" placeholder="Full Content (optional)" rows="4"></textarea>
          </div>
          <div class="form-group">
            <i class="fas fa-image"></i>
            <input type="text" id="image" placeholder="Image URL">
          </div>
          <div class="form-group">
            <i class="fas fa-tag"></i>
            <select id="category">
              <option value="news">📰 News</option>
              <option value="event">🎉 Event</option>
              <option value="announcement">📢 Announcement</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Publish',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      width: '550px',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const summary = document.getElementById('summary').value;
        if (!title || !summary) {
          Swal.showValidationMessage('Please fill title and summary');
          return false;
        }
        return {
          title, summary,
          content: document.getElementById('content').value || summary,
          image: document.getElementById('image').value || 'https://via.placeholder.com/800x400/1a3a5c/ffffff?text=News',
          category: document.getElementById('category').value
        };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/academic-admin/news', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Published!', 'News/Event added successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to publish news', 'error');
      }
    }
  };

  const handleDeleteNews = async (newsItem) => {
    const result = await Swal.fire({
      title: 'Delete News?',
      text: `Remove "${newsItem.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/news/${newsItem._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'News removed successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete news', 'error');
      }
    }
  };

  // ==================== GALLERY MANAGEMENT ====================
  const handleAddGalleryImage = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Gallery Image',
      html: `
        <div class="admin-form">
          <div class="form-group">
            <i class="fas fa-heading"></i>
            <input type="text" id="title" placeholder="Image Title" required>
          </div>
          <div class="form-group">
            <i class="fas fa-image"></i>
            <input type="text" id="image" placeholder="Image URL" required>
          </div>
          <div class="form-group">
            <i class="fas fa-tag"></i>
            <select id="category">
              <option value="academic">📚 Academic</option>
              <option value="sports">⚽ Sports</option>
              <option value="cultural">🎭 Cultural</option>
              <option value="events">🎪 Events</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Add Image',
      confirmButtonColor: '#3498db',
      showCancelButton: true,
      width: '500px',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const image = document.getElementById('image').value;
        if (!title || !image) {
          Swal.showValidationMessage('Please fill title and image URL');
          return false;
        }
        return { title, image, category: document.getElementById('category').value };
      }
    });

    if (formValues) {
      try {
        await apiRequest('/academic-admin/gallery', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Added!', 'Image added to gallery', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to add image', 'error');
      }
    }
  };

  const handleDeleteGalleryImage = async (image) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: `Remove "${image.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/gallery/${image._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'Image removed successfully', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete image', 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-user', color: '#27ae60' },
    { id: 'classes', label: 'Classes', icon: 'fas fa-school', color: '#9b59b6' },
    { id: 'news', label: 'News & Events', icon: 'fas fa-newspaper', color: '#f39c12' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images', color: '#e74c3c' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', color: '#1abc9c' },
    { id: 'performance', label: 'Performance', icon: 'fas fa-chart-bar', color: '#1abc9c' },
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
    <div className="academic-admin-dashboard">
      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: isMobile ? sidebarWidthMobile : sidebarWidth }}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="logo-area">
              <div className="logo-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="logo-text">
                <h3>ESSA Portal</h3>
                <p>Academic Admin</p>
              </div>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <i className="fas fa-user-graduate"></i>
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <h4>{userName}</h4>
              <span className="user-role">Academic Administrator</span>
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
            <h2>Academic Admin Dashboard</h2>
          </div>
          <div className="top-bar-right">
            <div className="notification-bell" onClick={() => handleOpenChat()}>
              <i className="fas fa-envelope"></i>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            <div className="user-menu">
              <div className="user-avatar-small">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role-badge">Academic Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome back, {userName.split(' ')[0]}! 📚</h1>
            <p>Manage teachers, classes, and academic content from your dashboard.</p>
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
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                  <i className="fas fa-chalkboard-user" style={{ color: '#27ae60' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{teachers.length}</h3>
                  <p>Teachers</p>
                  <span className="stat-trend">Active educators</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                  <i className="fas fa-school" style={{ color: '#3498db' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{classes.length}</h3>
                  <p>Classes</p>
                  <span className="stat-trend">Active classes</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fff3e0' }}>
                  <i className="fas fa-newspaper" style={{ color: '#f39c12' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{news.length}</h3>
                  <p>News & Events</p>
                  <span className="stat-trend">Published articles</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fdecea' }}>
                  <i className="fas fa-images" style={{ color: '#e74c3c' }}></i>
                </div>
                <div className="stat-info">
                  <h3>{gallery.length}</h3>
                  <p>Gallery Images</p>
                  <span className="stat-trend">Captured moments</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <button onClick={handleCreateTeacher} className="action-btn primary">
                <i className="fas fa-user-plus"></i> Add Teacher
              </button>
              <button onClick={handleCreateClass} className="action-btn secondary">
                <i className="fas fa-plus-circle"></i> Create Class
              </button>
              <button onClick={handleCreateNews} className="action-btn warning">
                <i className="fas fa-newspaper"></i> Post News
              </button>
              <button onClick={handleAddGalleryImage} className="action-btn danger">
                <i className="fas fa-image"></i> Add to Gallery
              </button>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-chalkboard-user"></i> Teachers</h2>
              <button onClick={handleCreateTeacher} className="btn-primary-sm">
                <i className="fas fa-plus"></i> Add Teacher
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.fullName}</strong></td>
                      <td>{t.email}</td>
                      <td>{t.subject || '-'}</td>
                      <td>{t.phone || '-'}</td>
                      <td>
                        <button onClick={() => handleDeleteTeacher(t)} className="delete-btn-sm">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr><td colSpan="5" className="no-data">No teachers yet. Click "Add Teacher" to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-school"></i> Classes</h2>
              <div className="header-actions">
                <button onClick={handleRefreshClasses} className="btn-secondary-sm">
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                <button onClick={handleCreateClass} className="btn-primary-sm">
                  <i className="fas fa-plus"></i> Create Class
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Class Name</th>
                    <th>Academic Year</th>
                    <th>Teacher</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.grade}</strong></td>
                      <td>{c.className}</td>
                      <td>{c.academicYear}</td>
                      <td>
                        {c.teacherId && typeof c.teacherId === 'object' && c.teacherId.fullName ? (
                          <span className="assigned-badge">
                            <i className="fas fa-chalkboard-user"></i> {c.teacherId.fullName}
                          </span>
                        ) : (
                          <span className="unassigned-badge">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleAssignTeacher(c)} className="assign-btn">
                            <i className="fas fa-user-plus"></i> Assign
                          </button>
                          <button onClick={() => handleDeleteClass(c)} className="delete-btn-sm">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr><td colSpan="5" className="no-data">No classes yet. Click "Create Class" to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-newspaper"></i> News & Events</h2>
              <button onClick={handleCreateNews} className="btn-primary-sm">
                <i className="fas fa-plus"></i> Post News
              </button>
            </div>
            <div className="news-list">
              {news.map(item => (
                <div key={item._id} className="news-item">
                  <div className="news-content">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="news-meta">
                      <span className={`category-badge ${item.category}`}>
                        <i className={`fas ${item.category === 'news' ? 'fa-newspaper' : item.category === 'event' ? 'fa-calendar' : 'fa-bullhorn'}`}></i>
                        {item.category}
                      </span>
                      <span><i className="fas fa-calendar"></i> {new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteNews(item)} className="delete-btn-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              {news.length === 0 && (
                <p className="no-data">No news articles yet. Click "Post News" to create one.</p>
              )}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="data-card">
            <div className="card-header">
              <h2><i className="fas fa-images"></i> Gallery</h2>
              <button onClick={handleAddGalleryImage} className="btn-primary-sm">
                <i className="fas fa-plus"></i> Add Image
              </button>
            </div>
            {gallery.length === 0 ? (
              <p className="no-data">No images in gallery. Click "Add Image" to upload.</p>
            ) : (
              <div className="gallery-grid">
                {gallery.map(img => (
                  <div key={img._id} className="gallery-item">
                    <img src={img.image} alt={img.title} />
                    <div className="gallery-overlay">
                      <h4>{img.title}</h4>
                      <span className="category-tag">{img.category}</span>
                      <button onClick={() => handleDeleteGalleryImage(img)} className="delete-btn">
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="data-card">
            <h2><i className="fas fa-bullhorn"></i> School Announcements</h2>
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
                  </div>
                  <p>{ann.content}</p>
                  <div className="announcement-footer">
                    <span><i className="fas fa-clock"></i> {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="no-data">No announcements yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <div className="data-card" style={{ marginBottom: '20px' }}>
              <h2><i className="fas fa-chart-line"></i> Class Performance</h2>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Teacher</th>
                      <th>Students</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classPerformance.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.className}</strong></td>
                        <td>{c.teacher}</td>
                        <td>{c.studentCount}</td>
                        <td><span className="score-badge">{c.averageScore}%</span></td>
                      </tr>
                    ))}
                    {classPerformance.length === 0 && (
                      <tr><td colSpan="4" className="no-data">No performance data available yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="data-card">
              <h2><i className="fas fa-trophy"></i> Top Students</h2>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPerformance.slice(0, 10).map((s, i) => (
                      <tr key={i}>
                        <td>{s.studentId}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.class}</td>
                        <td><span className="score-badge success">{s.averageScore}%</span></td>
                      </tr>
                    ))}
                    {studentPerformance.length === 0 && (
                      <tr><td colSpan="4" className="no-data">No student performance data available yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h2>{userName}</h2>
              <p className="profile-role">Academic Administrator</p>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <label>Email Address</label>
                  <p>{localStorage.getItem('userEmail') || 'academic@essa.rw'}</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <label>Role</label>
                  <p>Academic Administrator</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <label>Member Since</label>
                  <p>2024</p>
                </div>
              </div>
            </div>
            <button className="change-password-btn" onClick={() => {
              Swal.fire({
                title: 'Change Password',
                html: `
                  <input type="password" id="currentPassword" class="swal2-input" placeholder="Current Password">
                  <input type="password" id="newPassword" class="swal2-input" placeholder="New Password">
                  <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm New Password">
                `,
                confirmButtonText: 'Update',
                showCancelButton: true,
                preConfirm: () => {
                  const current = document.getElementById('currentPassword').value;
                  const newPass = document.getElementById('newPassword').value;
                  const confirm = document.getElementById('confirmPassword').value;
                  if (!current || !newPass || !confirm) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                  }
                  if (newPass !== confirm) {
                    Swal.showValidationMessage('New passwords do not match');
                    return false;
                  }
                  if (newPass.length < 6) {
                    Swal.showValidationMessage('Password must be at least 6 characters');
                    return false;
                  }
                  return { current, newPassword: newPass };
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire('Success', 'Password updated successfully!', 'success');
                }
              });
            }}>
              <i className="fas fa-key"></i> Change Password
            </button>
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
        .academic-admin-dashboard {
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
        .welcome-text h1 { font-size: 1.5rem; margin-bottom: 5px; }
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

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
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
        .action-btn.warning { background: #f39c12; color: white; }
        .action-btn.danger { background: #e74c3c; color: white; }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }

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
        .btn-secondary-sm {
          background: #3498db;
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
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .assign-btn {
          background: #f39c12;
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
        }
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
        .no-data { text-align: center; padding: 40px; color: #999; }
        .assigned-badge { color: #27ae60; font-weight: 500; }
        .unassigned-badge { color: #e74c3c; }
        .score-badge {
          background: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        .score-badge.success { background: #27ae60; }

        /* News List */
        .news-list { display: flex; flex-direction: column; gap: 15px; }
        .news-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 12px;
        }
        .news-content { flex: 1; }
        .news-content h3 { margin: 0 0 8px; color: #1a3a5c; }
        .news-content p { margin: 0 0 10px; color: #666; }
        .news-meta { display: flex; gap: 15px; font-size: 0.75rem; color: #999; }
        .category-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        .category-badge.news { background: #e3f2fd; color: #3498db; }
        .category-badge.event { background: #fff3e0; color: #f39c12; }
        .category-badge.announcement { background: #e8f5e9; color: #27ae60; }

        /* Gallery Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .gallery-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 1;
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .gallery-item:hover img { transform: scale(1.05); }
        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 15px;
          color: white;
          transform: translateY(100%);
          transition: transform 0.3s;
        }
        .gallery-item:hover .gallery-overlay { transform: translateY(0); }
        .gallery-overlay h4 { margin: 0 0 5px; font-size: 0.9rem; }
        .category-tag {
          display: inline-block;
          padding: 2px 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          font-size: 0.7rem;
          margin-bottom: 8px;
        }
        .delete-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.7rem;
        }

        /* Announcements */
        .announcements-list { display: flex; flex-direction: column; gap: 15px; }
        .announcement-item {
          padding: 15px;
          border-radius: 12px;
          background: #f8f9fa;
        }
        .announcement-item.urgent { background: #fdecea; border-left: 4px solid #e74c3c; }
        .announcement-item.high { background: #fff3e0; border-left: 4px solid #f39c12; }
        .announcement-header { margin-bottom: 10px; }
        .announcement-header h3 { margin: 0; font-size: 1rem; }
        .priority-badge { font-size: 0.7rem; margin-left: 10px; }
        .announcement-footer { margin-top: 10px; font-size: 0.7rem; color: #999; }

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
        .change-password-btn {
          width: calc(100% - 60px);
          margin: 0 30px 30px;
          padding: 12px;
          background: #1a3a5c;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .change-password-btn:hover { background: #2c5f8a; }

        /* Action Buttons */
        .action-buttons { display: flex; gap: 8px; }

        /* Responsive */
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block; }
          .welcome-text h1 { font-size: 1.2rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .quick-actions { flex-direction: column; }
          .action-btn { justify-content: center; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
};

export default AcademicAdminDashboard;