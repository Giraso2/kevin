import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

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
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
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
    newSocket.on('newMessage', (message) => {
      if (selectedUser && message.senderId === selectedUser._id) {
        setMessages(prev => [...prev, message]);
      }
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
      fetchUsers();
      fetchUnreadCount();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      console.log('Fetching all data...');
      
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

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('/messages/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchMessages = async (userId) => {
    try {
      const data = await apiRequest(`/messages/user/${userId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    try {
      const data = await apiRequest('/messages/send', {
        method: 'POST',
        body: JSON.stringify({ receiverId: selectedUser._id, content: messageText })
      });
      if (data.success) {
        setMessages([...messages, data.message]);
        setMessageText('');
        if (socket) {
          socket.emit('sendMessage', { receiverId: selectedUser._id, ...data.message });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire('Error', 'Failed to send message', 'error');
    }
  };

  // ==================== TEACHER MANAGEMENT ====================
  const handleCreateTeacher = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create Teacher Account',
      html: `
        <div style="text-align: left;">
          <input type="text" id="fullName" class="swal2-input" placeholder="Full Name *" required>
          <input type="email" id="email" class="swal2-input" placeholder="Email *" required>
          <input type="password" id="password" class="swal2-input" placeholder="Password (default: teacher123)">
          <input type="text" id="subject" class="swal2-input" placeholder="Subject">
          <input type="tel" id="phone" class="swal2-input" placeholder="Phone Number">
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
          Swal.showValidationMessage('Please fill Full Name and Email');
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
        const data = await apiRequest('/academic-admin/create-teacher-credentials', {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        
        Swal.fire({
          title: 'Teacher Created!',
          html: `<div><p><strong>Name:</strong> ${formValues.fullName}</p><p><strong>Email:</strong> ${formValues.email}</p><p><strong>Password:</strong> ${formValues.password}</p><p><strong>Subject:</strong> ${formValues.subject}</p></div>`,
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
      confirmButtonText: 'Delete'
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
        <div style="text-align: left;">
          <input type="text" id="className" class="swal2-input" placeholder="Class Name (e.g., A, B, C)" required>
          <select id="grade" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
            <option value="S4">S4</option><option value="S5">S5</option><option value="S6">S6</option>
          </select>
          <input type="text" id="academicYear" class="swal2-input" placeholder="Academic Year (e.g., 2026)" required>
          <select id="teacherId" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            ${Object.entries(teacherOptions).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
          </select>
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
        const teacherId = document.getElementById('teacherId').value;
        
        if (!className || !grade || !academicYear) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        return { className, grade, academicYear, teacherId: teacherId || null };
      }
    });

    if (formValues) {
      try {
        const data = await apiRequest('/academic-admin/classes', {
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
      confirmButtonText: 'Delete'
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
        <input type="text" id="title" class="swal2-input" placeholder="Title" required>
        <textarea id="summary" class="swal2-textarea" placeholder="Short Summary" required></textarea>
        <textarea id="content" class="swal2-textarea" placeholder="Full Content"></textarea>
        <input type="text" id="image" class="swal2-input" placeholder="Image URL">
        <select id="category" class="swal2-select">
          <option value="news">News</option>
          <option value="event">Event</option>
          <option value="announcement">Announcement</option>
        </select>
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
        Swal.fire('Published!', 'News/Event added', 'success');
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
      confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/news/${newsItem._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'News removed', 'success');
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
        <input type="text" id="title" class="swal2-input" placeholder="Image Title" required>
        <input type="text" id="image" class="swal2-input" placeholder="Image URL" required>
        <select id="category" class="swal2-select">
          <option value="academic">Academic</option>
          <option value="sports">Sports</option>
          <option value="cultural">Cultural</option>
          <option value="events">Events</option>
        </select>
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
      confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/academic-admin/gallery/${image._id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'Image removed', 'success');
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
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-user', color: '#27ae60' },
    { id: 'classes', label: 'Classes', icon: 'fas fa-school', color: '#9b59b6' },
    { id: 'news', label: 'News & Events', icon: 'fas fa-newspaper', color: '#f39c12' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images', color: '#e74c3c' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', color: '#1abc9c' },
    { id: 'performance', label: 'Performance', icon: 'fas fa-chart-bar', color: '#1abc9c' },
    { id: 'chat', label: 'Messages', icon: 'fas fa-comments', color: '#1abc9c' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-circle', color: '#34495e' }
  ];

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';
  const sidebarWidthMobile = mobileMenuOpen ? sidebarWidth : '0px';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#1a3a5c' }}></i>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? sidebarWidthMobile : sidebarWidth,
        background: 'linear-gradient(180deg, #1a3a5c 0%, #0d2b42 100%)',
        color: 'white', position: 'fixed', left: 0, top: 0, bottom: 0,
        transition: 'width 0.3s ease', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', zIndex: 999
      }}>
        <div style={{ padding: sidebarCollapsed ? '1rem 0' : '1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!sidebarCollapsed && (
            <>
              <div style={{ width: '60px', height: '60px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="fas fa-user-graduate" style={{ fontSize: '2rem', color: '#1a3a5c' }}></i>
              </div>
              <h3>{userName}</h3>
              <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Academic Admin</p>
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
              {item.id === 'chat' && unreadCount > 0 && !sidebarCollapsed && (
                <span style={{ marginLeft: 'auto', background: '#e74c3c', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadCount}</span>
              )}
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
            <h2 style={{ color: '#1a3a5c', margin: 0 }}>Academic Admin Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', background: '#1a3a5c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <i className="fas fa-user-graduate"></i>
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: '#ffc107' }}>Academic Admin</div>
            </div>
          </div>
        </div>

        <h1 style={{ color: '#1a3a5c', marginBottom: '20px' }}>Welcome, {userName}! 📚</h1>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: '1rem', marginBottom: '20px' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-chalkboard-user" style={{ fontSize: '2rem', color: '#27ae60' }}></i>
                <h3>{teachers.length}</h3><p>Teachers</p>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-school" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
                <h3>{classes.length}</h3><p>Classes</p>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-newspaper" style={{ fontSize: '2rem', color: '#f39c12' }}></i>
                <h3>{news.length}</h3><p>News & Events</p>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <i className="fas fa-images" style={{ fontSize: '2rem', color: '#e74c3c' }}></i>
                <h3>{gallery.length}</h3><p>Gallery Images</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handleCreateTeacher} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}><i className="fas fa-user-plus"></i> Add Teacher</button>
              <button onClick={handleCreateClass} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}><i className="fas fa-plus-circle"></i> Create Class</button>
              <button onClick={handleCreateNews} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}><i className="fas fa-newspaper"></i> Post News</button>
              <button onClick={handleAddGalleryImage} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}><i className="fas fa-image"></i> Add to Gallery</button>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <h2>Teachers</h2>
              <button onClick={handleCreateTeacher} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}><i className="fas fa-plus"></i> Add Teacher</button>
            </div>
            {teachers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No teachers yet. Click "Add Teacher" to create one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#1a3a5c', color: 'white' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Subject</th>
                    <th style={{ padding: '12px' }}>Phone</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}><strong>{t.fullName}</strong></td>
                      <td style={{ padding: '12px' }}>{t.email}</td>
                      <td style={{ padding: '12px' }}>{t.subject || '-'}</td>
                      <td style={{ padding: '12px' }}>{t.phone || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleDeleteTeacher(t)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Classes</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleRefreshClasses} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                <button onClick={handleCreateClass} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  <i className="fas fa-plus"></i> Create Class
                </button>
              </div>
            </div>

            {classes.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No classes yet. Click "Create Class" to create one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#1a3a5c', color: 'white' }}>
                    <th style={{ padding: '12px' }}>Grade</th>
                    <th style={{ padding: '12px' }}>Class Name</th>
                    <th style={{ padding: '12px' }}>Academic Year</th>
                    <th style={{ padding: '12px' }}>Teacher</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}><strong>{c.grade}</strong></td>
                      <td style={{ padding: '12px' }}>{c.className}</td>
                      <td style={{ padding: '12px' }}>{c.academicYear}</td>
                      <td style={{ padding: '12px' }}>
                        {c.teacherId && typeof c.teacherId === 'object' && c.teacherId.fullName ? (
                          <span style={{ color: '#27ae60', fontWeight: '500' }}>
                            <i className="fas fa-chalkboard-user"></i> {c.teacherId.fullName}
                          </span>
                        ) : c.teacherId && typeof c.teacherId === 'string' ? (
                          <span style={{ color: '#f39c12' }}>Pending Assignment</span>
                        ) : (
                          <span style={{ color: '#e74c3c' }}>Not Assigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleAssignTeacher(c)}
                            style={{
                              background: c.teacherId ? '#f39c12' : '#27ae60',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <i className={`fas ${c.teacherId ? 'fa-exchange-alt' : 'fa-user-plus'}`}></i>
                            {c.teacherId ? ' Change Teacher' : ' Assign Teacher'}
                          </button>
                          <button
                            onClick={() => handleDeleteClass(c)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <h2>News & Events</h2>
              <button onClick={handleCreateNews} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Post News
              </button>
            </div>
            {news.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No news articles yet. Click "Post News" to create one.</p>
            ) : (
              news.map(item => (
                <div key={item._id} style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: '#1a3a5c' }}>{item.title}</h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>{item.summary}</p>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', color: '#999' }}>
                        <span><i className="fas fa-tag"></i> {item.category}</span>
                        <span><i className="fas fa-calendar"></i> {new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteNews(item)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <h2>Gallery</h2>
              <button onClick={handleAddGalleryImage} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Image
              </button>
            </div>
            {gallery.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No images in gallery. Click "Add Image" to upload.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {gallery.map(img => (
                  <div key={img._id} style={{ background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <img src={img.image} alt={img.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{img.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 10px 0' }}>{img.category}</p>
                      <button onClick={() => handleDeleteGalleryImage(img)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
            <h2>School Announcements</h2>
            {announcements.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No announcements yet.</p>
            ) : (
              announcements.map(ann => (
                <div key={ann._id} style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', marginBottom: '0.5rem', background: ann.priority === 'urgent' ? '#fff3cd' : 'transparent', borderRadius: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1a3a5c' }}>
                      {ann.title}
                      {ann.priority === 'urgent' && <span style={{ marginLeft: '10px', background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>URGENT</span>}
                    </h3>
                    <p style={{ margin: '5px 0', color: '#555' }}>{ann.content}</p>
                    <small style={{ color: '#999' }}><i className="fas fa-clock"></i> Posted on {new Date(ann.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '20px' }}>
              <h2><i className="fas fa-chart-line"></i> Class Performance</h2>
              {classPerformance.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No performance data available yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a5c', color: 'white' }}>
                      <th style={{ padding: '12px' }}>Class</th>
                      <th style={{ padding: '12px' }}>Teacher</th>
                      <th style={{ padding: '12px' }}>Students</th>
                      <th style={{ padding: '12px' }}>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classPerformance.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>{c.className}</td>
                        <td style={{ padding: '12px' }}>{c.teacher}</td>
                        <td style={{ padding: '12px' }}>{c.studentCount}</td>
                        <td style={{ padding: '12px' }}><strong>{c.averageScore}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
              <h2><i className="fas fa-trophy"></i> Top Students</h2>
              {studentPerformance.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No student performance data available yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a5c', color: 'white' }}>
                      <th style={{ padding: '12px' }}>Student ID</th>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Class</th>
                      <th style={{ padding: '12px' }}>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPerformance.slice(0, 10).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>{s.studentId}</td>
                        <td style={{ padding: '12px' }}><strong>{s.name}</strong></td>
                        <td style={{ padding: '12px' }}>{s.class}</td>
                        <td style={{ padding: '12px' }}><span style={{ background: '#27ae60', color: 'white', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem' }}>{s.averageScore}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '70vh' }}>
            <div style={{ width: isMobile ? '100%' : '30%', borderRight: isMobile ? 'none' : '1px solid #e0e0e0', overflowY: 'auto' }}>
              <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
                <i className="fas fa-comments"></i> Chats ({unreadCount} unread)
              </div>
              {users.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No users available</div>
              ) : (
                users.map(user => (
                  <div key={user._id} onClick={() => { setSelectedUser(user); fetchMessages(user._id); }} 
                    style={{ 
                      padding: '1rem', cursor: 'pointer', background: selectedUser?._id === user._id ? '#e3f2fd' : 'white', 
                      borderBottom: '1px solid #e0e0e0', transition: 'background 0.2s'
                    }}>
                    <strong>{user.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                      <i className="fas fa-badge"></i> {user.role}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ width: isMobile ? '100%' : '70%', display: 'flex', flexDirection: 'column' }}>
              {selectedUser ? (
                <>
                  <div style={{ padding: '1rem', background: '#1a3a5c', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-user-circle" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <strong>{selectedUser.fullName}</strong>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{selectedUser.role}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: '300px', maxHeight: '400px' }}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No messages yet. Start a conversation!</div>
                    ) : (
                      messages.map(msg => (
                        <div key={msg._id} style={{ textAlign: msg.senderId === localStorage.getItem('userId') ? 'right' : 'left', marginBottom: '1rem' }}>
                          <div style={{ display: 'inline-block', maxWidth: '70%', padding: '10px 15px', borderRadius: '18px', background: msg.senderId === localStorage.getItem('userId') ? '#1a3a5c' : '#f0f4f8', color: msg.senderId === localStorage.getItem('userId') ? 'white' : '#333' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>{msg.senderName}</div>
                            <div>{msg.content}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '5px' }}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '1rem', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '0.5rem', background: 'white' }}>
                    <input 
                      type="text" 
                      value={messageText} 
                      onChange={(e) => setMessageText(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Type a message..." 
                      style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', outline: 'none' }} 
                    />
                    <button onClick={handleSendMessage} style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>
                      <i className="fas fa-paper-plane"></i> Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', flexDirection: 'column', gap: '10px' }}>
                  <i className="fas fa-comment-dots" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                  <p>Select a user to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <i className="fas fa-user-graduate" style={{ fontSize: '3rem', color: '#1a3a5c' }}></i>
            </div>
            <h2 style={{ color: '#1a3a5c' }}>{userName}</h2>
            <p style={{ color: '#ffc107', fontWeight: '500' }}>Academic Administrator</p>
            <hr style={{ margin: '1.5rem 0', borderColor: '#e0e0e0' }} />
            <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <p><strong><i className="fas fa-envelope"></i> Email:</strong> {localStorage.getItem('userEmail') || 'academic@essa.rw'}</p>
              <p><strong><i className="fas fa-badge"></i> Role:</strong> Academic Administrator</p>
              <p><strong><i className="fas fa-calendar"></i> Member Since:</strong> 2024</p>
            </div>
            <button onClick={() => {
              Swal.fire({
                title: 'Change Password',
                html: `<input type="password" id="currentPassword" class="swal2-input" placeholder="Current Password">
                       <input type="password" id="newPassword" class="swal2-input" placeholder="New Password">
                       <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm New Password">`,
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
            }} style={{ marginTop: '1.5rem', background: '#1a3a5c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              <i className="fas fa-key"></i> Change Password
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AcademicAdminDashboard;