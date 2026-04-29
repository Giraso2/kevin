import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

const AcademicAdminDashboard = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
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
  const [pageContents, setPageContents] = useState({});
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('portalToken');

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Socket.IO for chat
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      newSocket.emit('join', userId);
    }
    
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
    const email = localStorage.getItem('userEmail');
    
    if (!token || role !== 'academic_admin') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Academic Admin');
      setUserEmail(email || 'academic@essa.rw');
      fetchAllData();
      fetchUsers();
      fetchUnreadCount();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    const token = getToken();
    try {
      const [teachersRes, classesRes, newsRes, galleryRes] = await Promise.all([
        fetch(`${API_URL}/academic-admin/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/academic-admin/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/academic-admin/news`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/academic-admin/gallery`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/messages/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setUsers(await response.json());
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchMessages = async (userId) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/messages/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setMessages(await response.json());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: messageText
        })
      });
      
      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage.message]);
        setMessageText('');
        if (socket) {
          socket.emit('sendMessage', {
            receiverId: selectedUser._id,
            ...newMessage.message
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Teacher Management
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
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return {
          fullName, email,
          password: document.getElementById('password').value || 'teacher123',
          subject: document.getElementById('subject').value,
          phone: document.getElementById('phone').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/create-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire({
          title: 'Teacher Created!',
          html: `
            <div style="text-align: left;">
              <p><strong>Name:</strong> ${formValues.fullName}</p>
              <p><strong>Email:</strong> ${formValues.email}</p>
              <p><strong>Password:</strong> ${formValues.password}</p>
            </div>
          `,
          icon: 'success'
        });
        fetchAllData();
      } else {
        Swal.fire('Error', 'Failed to create teacher', 'error');
      }
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const result = await Swal.fire({
      title: 'Delete Teacher?',
      text: `Remove ${teacher.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/academic-admin/teachers/${teacher._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Teacher removed', 'success');
      fetchAllData();
    }
  };

  // Class Management
  const handleCreateClass = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create Class',
      html: `
        <div style="text-align: left;">
          <input type="text" id="className" class="swal2-input" placeholder="Class Name (A, B, etc.)" required>
          <select id="grade" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
            <option value="S4">S4</option><option value="S5">S5</option><option value="S6">S6</option>
          </select>
          <input type="text" id="academicYear" class="swal2-input" placeholder="Academic Year (2026)" required>
          <select id="teacherId" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="">Select Teacher (Optional)</option>
            ${teachers.map(t => `<option value="${t._id}">${t.fullName}</option>`).join('')}
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
        if (!className || !academicYear) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return { className, grade, academicYear, teacherId: document.getElementById('teacherId').value || null };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Success!', 'Class created', 'success');
        fetchAllData();
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
      const token = getToken();
      await fetch(`${API_URL}/academic-admin/classes/${classItem._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Class removed', 'success');
      fetchAllData();
    }
  };

  // News Management
  const handleCreateNews = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create News/Event',
      html: `
        <div style="text-align: left;">
          <input type="text" id="title" class="swal2-input" placeholder="Title" required>
          <textarea id="summary" class="swal2-textarea" placeholder="Short Summary" required></textarea>
          <textarea id="content" class="swal2-textarea" placeholder="Full Content"></textarea>
          <input type="text" id="image" class="swal2-input" placeholder="Image URL">
          <select id="category" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="news">News</option>
            <option value="event">Event</option>
            <option value="announcement">Announcement</option>
          </select>
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
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return {
          title, summary,
          content: document.getElementById('content').value,
          image: document.getElementById('image').value,
          category: document.getElementById('category').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Published!', 'News/Event added', 'success');
        fetchAllData();
      }
    }
  };

  const handleDeleteNews = async (newsItem) => {
    const result = await Swal.fire({
      title: 'Delete?',
      text: `Remove "${newsItem.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/academic-admin/news/${newsItem._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Item removed', 'success');
      fetchAllData();
    }
  };

  // Gallery Management
  const handleAddGalleryImage = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Gallery Image',
      html: `
        <div style="text-align: left;">
          <input type="text" id="title" class="swal2-input" placeholder="Image Title" required>
          <input type="text" id="image" class="swal2-input" placeholder="Image URL" required>
          <select id="category" class="swal2-select" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="events">Events</option>
          </select>
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
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return { title, image, category: document.getElementById('category').value };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Added!', 'Image added to gallery', 'success');
        fetchAllData();
      }
    }
  };

  const handleDeleteGalleryImage = async (image) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: `Remove "${image.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c'
    });
    
    if (result.isConfirmed) {
      const token = getToken();
      await fetch(`${API_URL}/academic-admin/gallery/${image._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Swal.fire('Deleted!', 'Image removed', 'success');
      fetchAllData();
    }
  };

  // Website Page Management
  const pages = [
    { id: 'home', name: 'Home Page', icon: 'fas fa-home' },
    { id: 'about', name: 'About Page', icon: 'fas fa-info-circle' },
    { id: 'academics', name: 'Academics Page', icon: 'fas fa-graduation-cap' },
    { id: 'admissions', name: 'Admissions Page', icon: 'fas fa-door-open' }
  ];

  const handleEditPage = async (page) => {
    const { value: formValues } = await Swal.fire({
      title: `Edit ${page.name}`,
      html: `
        <div style="text-align: left;">
          <input type="text" id="title" class="swal2-input" placeholder="Page Title" value="${pageContents[page.id]?.title || ''}">
          <textarea id="content" class="swal2-textarea" placeholder="Page Content" rows="8">${pageContents[page.id]?.content || ''}</textarea>
          <input type="text" id="heroImage" class="swal2-input" placeholder="Hero Image URL" value="${pageContents[page.id]?.heroImage || ''}">
        </div>
      `,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      width: '600px',
      preConfirm: () => {
        return {
          title: document.getElementById('title').value,
          content: document.getElementById('content').value,
          heroImage: document.getElementById('heroImage').value
        };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/content/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Saved!', `${page.name} updated`, 'success');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line', color: '#3498db' },
    { id: 'website', label: 'Website Pages', icon: 'fas fa-globe', color: '#1abc9c' },
    { id: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-user', color: '#27ae60' },
    { id: 'classes', label: 'Classes', icon: 'fas fa-school', color: '#9b59b6' },
    { id: 'news', label: 'News & Events', icon: 'fas fa-newspaper', color: '#f39c12' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images', color: '#e74c3c' },
    { id: 'chat', label: 'Messages', icon: 'fas fa-comments', color: '#1abc9c' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-circle', color: '#34495e' }
  ];

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#1a3a5c' }}></i>
        <p style={{ marginLeft: '10px', color: '#666' }}>Loading dashboard...</p>
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
        flexDirection: 'column', zIndex: 999, boxShadow: '2px 0 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ padding: sidebarCollapsed ? '1rem 0' : '1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!sidebarCollapsed && (
            <>
              <div style={{ width: '60px', height: '60px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="fas fa-user-graduate" style={{ fontSize: '2rem', color: '#1a3a5c' }}></i>
              </div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>{userName}</h3>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: '5px 0 0' }}>Academic Admin</p>
            </>
          )}
          {sidebarCollapsed && (
            <div style={{ width: '50px', height: '50px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <i className="fas fa-user-graduate" style={{ fontSize: '1.5rem', color: '#1a3a5c' }}></i>
            </div>
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
                border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}>
              <i className={item.icon} style={{ width: '20px', color: item.color }}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.id === 'chat' && unreadCount > 0 && !sidebarCollapsed && (
                <span style={{ marginLeft: 'auto', background: '#e74c3c', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '12px', width: '100%', padding: '12px', background: '#e74c3c',
            border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
            transition: 'all 0.3s ease'
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
        {/* Top Bar - Responsive */}
        <div style={{
          background: 'white', padding: '12px 20px', borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', flexWrap: 'wrap', gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: isMobile ? 'block' : 'none' }}>
              <i className="fas fa-bars"></i>
            </button>
            <h2 style={{ color: '#1a3a5c', margin: 0, fontSize: isMobile ? '1rem' : '1.2rem' }}>
              <i className="fas fa-chalkboard"></i> Academic Admin Dashboard
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', background: '#1a3a5c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <i className="fas fa-user-graduate"></i>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: '#ffc107' }}>Academic Admin</div>
            </div>
          </div>
        </div>

        <h1 style={{ color: '#1a3a5c', fontSize: isMobile ? '1.3rem' : '1.8rem', marginBottom: '20px' }}>
          Welcome, {userName}! 📚
        </h1>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '150px' : '180px'}, 1fr))`,
              gap: '1rem', marginBottom: '20px'
            }}>
              <div style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-chalkboard-user" style={{ fontSize: '2rem', color: '#3498db' }}></i>
                <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{teachers.length}</h3>
                <p>Teachers</p>
              </div>
              <div style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-school" style={{ fontSize: '2rem', color: '#27ae60' }}></i>
                <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{classes.length}</h3>
                <p>Classes</p>
              </div>
              <div style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-newspaper" style={{ fontSize: '2rem', color: '#f39c12' }}></i>
                <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{news.length}</h3>
                <p>News & Events</p>
              </div>
              <div style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-images" style={{ fontSize: '2rem', color: '#e74c3c' }}></i>
                <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{gallery.length}</h3>
                <p>Gallery Images</p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleCreateTeacher} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  <i className="fas fa-user-plus"></i> Add Teacher
                </button>
                <button onClick={handleCreateClass} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  <i className="fas fa-plus-circle"></i> Create Class
                </button>
                <button onClick={handleCreateNews} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  <i className="fas fa-newspaper"></i> Post News
                </button>
                <button onClick={handleAddGalleryImage} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  <i className="fas fa-image"></i> Add to Gallery
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Website Pages Tab */}
        {activeTab === 'website' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
            <h2>Manage Website Pages</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Edit content for the public website pages</p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100%' : '250px'}, 1fr))`, gap: '1rem' }}>
              {pages.map(page => (
                <div key={page.id} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <i className={page.icon} style={{ fontSize: '2rem', color: '#1a3a5c', marginBottom: '10px' }}></i>
                  <h3>{page.name}</h3>
                  <button onClick={() => handleEditPage(page)} style={{ marginTop: '10px', background: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                    Edit Content
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teachers Tab - Responsive Table */}
        {activeTab === 'teachers' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>Teachers</h2>
              <button onClick={handleCreateTeacher} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Teacher
              </button>
            </div>
            {teachers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No teachers yet. Click "Add Teacher" to create one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: '#1a3a5c', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>{t.fullName}</td>
                      <td style={{ padding: '12px' }}>{t.email}</td>
                      <td style={{ padding: '12px' }}>{t.phone || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: t.isActive ? '#d4edda' : '#f8d7da', color: t.isActive ? '#155724' : '#721c24', padding: '4px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleDeleteTeacher(t)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                          Delete
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>Classes</h2>
              <button onClick={handleCreateClass} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Class
              </button>
            </div>
            {classes.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No classes created yet. Click "Add Class" to create one.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
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
                      <td style={{ padding: '12px' }}>{c.grade}</td>
                      <td style={{ padding: '12px' }}>{c.className}</td>
                      <td style={{ padding: '12px' }}>{c.academicYear}</td>
                      <td style={{ padding: '12px' }}>{c.teacher?.fullName || 'Not Assigned'}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleDeleteClass(c)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                          Delete
                        </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>News & Events</h2>
              <button onClick={handleCreateNews} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add News
              </button>
            </div>
            {news.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No news articles yet. Click "Add News" to create one.</p>
            ) : (
              news.map(item => (
                <div key={item._id} style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: '#1a3a5c', fontSize: isMobile ? '1rem' : '1.2rem' }}>{item.title}</h3>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '0.85rem' }}>{item.summary}</p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#e8f4fd', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>{item.category}</span>
                        <span style={{ color: '#999', fontSize: '0.7rem' }}>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteNews(item)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                      Delete
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>Gallery</h2>
              <button onClick={handleAddGalleryImage} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                <i className="fas fa-plus"></i> Add Image
              </button>
            </div>
            {gallery.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No images in gallery. Click "Add Image" to upload.</p>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '150px' : '200px'}, 1fr))`,
                gap: '1rem'
              }}>
                {gallery.map(img => (
                  <div key={img._id} style={{ background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', textAlign: 'center' }}>
                    <img src={img.image} alt={img.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '0.8rem' }}>{img.title}</p>
                      <p style={{ fontSize: '0.7rem', color: '#666', margin: '0 0 8px 0' }}>{img.category}</p>
                      <button onClick={() => handleDeleteGalleryImage(img)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '70vh' }}>
            {/* Users List */}
            <div style={{
              width: isMobile ? '100%' : '30%',
              borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
              borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
              overflowY: 'auto',
              maxHeight: isMobile ? '200px' : 'auto'
            }}>
              <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                <h3 style={{ margin: 0 }}>Chats ({unreadCount} unread)</h3>
              </div>
              {users.map(user => (
                <div
                  key={user._id}
                  onClick={() => { setSelectedUser(user); fetchMessages(user._id); }}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    background: selectedUser?._id === user._id ? '#f0f4f8' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.role}</div>
                </div>
              ))}
              {users.length === 0 && (
                <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>No users available</p>
              )}
            </div>

            {/* Chat Area */}
            <div style={{ width: isMobile ? '100%' : '70%', display: 'flex', flexDirection: 'column', height: isMobile ? '400px' : '100%' }}>
              {selectedUser ? (
                <>
                  <div style={{ padding: '1rem', background: '#1a3a5c', color: 'white' }}>
                    <h3 style={{ margin: 0 }}>{selectedUser.fullName}</h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {messages.map(msg => (
                      <div key={msg._id} style={{ textAlign: msg.senderId === localStorage.getItem('userId') ? 'right' : 'left', marginBottom: '1rem' }}>
                        <div style={{
                          display: 'inline-block',
                          maxWidth: '70%',
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          background: msg.senderId === localStorage.getItem('userId') ? '#1a3a5c' : '#f0f4f8',
                          color: msg.senderId === localStorage.getItem('userId') ? 'white' : '#333'
                        }}>
                          <div><strong>{msg.senderName}</strong></div>
                          <div>{msg.content}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '1rem', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                    <button onClick={handleSendMessage} style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                  Select a user to start chatting
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <i className="fas fa-user-graduate" style={{ fontSize: '2.5rem', color: '#1a3a5c' }}></i>
            </div>
            <h2>{userName}</h2>
            <p style={{ color: '#ffc107' }}>Academic Administrator</p>
            <hr style={{ margin: '20px 0' }} />
            <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <p><strong>Email:</strong> {userEmail}</p>
              <p><strong>Role:</strong> Academic Admin</p>
              <p><strong>Permissions:</strong> Manage Teachers, Classes, Pages, News, Gallery</p>
              <p><strong>Chat:</strong> Available with all users</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AcademicAdminDashboard;