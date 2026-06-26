import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
const getToken = () => localStorage.getItem('portalToken');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' }) : '';

const roleBadge = (role) => {
  const map = {
    super_admin: { label: 'Super Admin', color: '#ffc107', bg: '#fff8e1' },
    academic_admin: { label: 'Academic Admin', color: '#27ae60', bg: '#e8f5e9' },
    discipline_admin: { label: 'Discipline Admin', color: '#e74c3c', bg: '#fdecea' },
    accounts_admin: { label: 'Accounts Admin', color: '#3498db', bg: '#e3f2fd' },
    teacher: { label: 'Teacher', color: '#9b59b6', bg: '#f3e5f5' },
    student: { label: 'Student', color: '#1abc9c', bg: '#e0f7fa' },
    parent: { label: 'Parent', color: '#e67e22', bg: '#fff3e0' },
    secretary_admin: { label: 'Secretary Admin', color: '#00bcd4', bg: '#e0f7fa' },
  };
  return map[role] || { label: role || '—', color: '#666', bg: '#f0f0f0' };
};

// ─── shared UI atoms ─────────────────────────────────────────────────────────
const Badge = ({ text, color, bg, size = 11 }) => (
  <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: size, fontWeight: 700, color, background: bg, whiteSpace: 'nowrap' }}>
    {typeof text === 'string' ? text.replace(/_/g, ' ').toUpperCase() : text}
  </span>
);

const Avatar = ({ name = '?', size = 36, bg = '#1a3a5c', color = '#ffc107', img }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return img
    ? <img src={img} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, letterSpacing: 1 }}>{initials}</div>;
};

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#999', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 5, letterSpacing: 0.5 }}>
      {label?.toUpperCase()}{required && <span style={{ color: '#e74c3c' }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' };
const Inp = (props) => <input {...props} style={{ ...inputStyle, ...props.style }}
  onFocus={e => e.target.style.borderColor = '#1a3a5c'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />;
const Sel = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, background: 'white', ...props.style }}>{children}</select>;
const Txt = (props) => <textarea {...props} style={{ ...inputStyle, resize: 'vertical', minHeight: 80, ...props.style }}
  onFocus={e => e.target.style.borderColor = '#1a3a5c'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />;

const Btn = ({ children, onClick, icon, color = '#1a3a5c', textColor = 'white', small, danger, disabled, style: s }) => {
  const bg = danger ? '#e74c3c' : disabled ? '#ccc' : color;
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: bg, color: textColor, border: 'none', borderRadius: 8, padding: small ? '6px 13px' : '9px 18px', fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'filter .2s, transform .2s', whiteSpace: 'nowrap', ...s }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}>
      {icon && <i className={icon} style={{ fontSize: 13 }} />}{children}
    </button>
  );
};

const StatCard = ({ icon, label, value, sub, accent = '#00bcd4', bg = '#e0f7fa', onClick }) => (
  <div onClick={onClick} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,.06)', cursor: onClick ? 'pointer' : 'default', transition: 'transform .2s, box-shadow .2s', border: '1px solid #f0f0f0' }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.12)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}>
    <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <i className={icon} style={{ fontSize: 20, color: accent }} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c', lineHeight: 1, fontFamily: 'Georgia, serif' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const Table = ({ cols, rows, emptyMsg = 'No data found' }) => (
  <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #f0f0f0' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
      <thead>
        <tr style={{ background: '#f7f9fb' }}>
          {cols.map((c, i) => <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: .8, borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{c.toUpperCase()}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 36, color: '#bbb', fontSize: 13 }}>{emptyMsg}</td></tr>
          : rows.map((row, i) => <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>{row}</tr>)}
      </tbody>
    </table>
  </div>
);
const TD = ({ children, style }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#333', ...style }}>{children}</td>;

// ═══════════════════════════════════════════════════════════════════
const SecretaryAdminDashboard = () => {
  const navigate = useNavigate();
  const msgEndRef = useRef(null);

  // layout
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // data
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [schoolSettings, setSchoolSettings] = useState({});
  const [applications, setApplications] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);

  // modals
  const [studentModal, setStudentModal] = useState(false);
  const [visitorModal, setVisitorModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [newsModal, setNewsModal] = useState(false);
  const [galleryModal, setGalleryModal] = useState(false);

  // forms
  const [studentForm, setStudentForm] = useState({ 
    fullName: '', email: '', classId: '', parentName: '', parentPhone: '', 
    dateOfBirth: '', gender: 'other', address: '', password: '' 
  });
  const [visitorForm, setVisitorForm] = useState({ 
    name: '', email: '', phone: '', purpose: '', personToVisit: '', 
    arrivalTime: new Date().toISOString().slice(0,16), departureTime: '' 
  });
  const [eventForm, setEventForm] = useState({ 
    title: '', description: '', date: '', time: '', location: '', 
    organizer: '', permissionRequired: false 
  });
  const [announcementForm, setAnnouncementForm] = useState({ 
    title: '', content: '', audience: 'all', priority: 'normal' 
  });
  const [contactForm, setContactForm] = useState({ 
    fullName: '', email: '', phone: '', subject: '', message: '' 
  });
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', category: 'news', tags: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', category: 'events', description: '' });
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [galleryImageFile, setGalleryImageFile] = useState(null);

  // messaging
  const [msgUsers, setMsgUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [msgTab, setMsgTab] = useState('inbox');
  const [unread, setUnread] = useState(0);
  const [msgSearch, setMsgSearch] = useState('');
  const [socket, setSocket] = useState(null);
  const [massMessageModal, setMassMessageModal] = useState(false);
  const [massMessageForm, setMassMessageForm] = useState({ subject: '', content: '', audience: 'all' });

  const userName = localStorage.getItem('userName') || 'Secretary Admin';
  const userId = localStorage.getItem('userId');

  // responsive
  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth <= 1024); if (window.innerWidth > 1024) setMobileOpen(false); };
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  // socket
  useEffect(() => {
    const token = getToken(); if (!token) return;
    const sock = io(SOCKET_URL, { auth: { token } });
    setSocket(sock);
    if (userId) sock.emit('join', userId);
    sock.on('new_message', () => { fetchUnread(); fetchMsgUsers(); });
    sock.on('newMessage', () => { fetchUnread(); fetchMsgUsers(); });
    return () => sock.disconnect();
  }, [userId]);

  // auth + load
  useEffect(() => {
    const token = getToken(); const role = localStorage.getItem('userRole');
    if (!token || role !== 'secretary_admin') { navigate('/portal/login'); return; }
    loadAll();
  }, [navigate]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ─── API ──────────────────────────────────────────────────────────
  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_URL}${path}`, { headers: authHeaders(), ...opts });
    if (!res.ok) return Promise.reject(await res.json());
    return res.json();
  }, []);

  const loadAll = () => Promise.all([
    fetchStudents(), fetchClasses(), fetchTeachers(), fetchAnnouncements(),
    fetchContacts(), fetchVisitors(), fetchEvents(), fetchApplications(),
    fetchFeePayments(), fetchSchoolSettings(), fetchMsgUsers(), fetchUnread(),
    fetchNews(), fetchGallery()
  ]).finally(() => setLoading(false));

  const fetchStudents = () => api('/academic-admin/students').then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchClasses = () => api('/academic-admin/classes').then(d => setClasses(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchTeachers = () => api('/academic-admin/teachers-list').then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchAnnouncements = () => api('/announcements').then(d => setAnnouncements(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchContacts = () => api('/admin/contacts').then(d => setContacts(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchVisitors = () => api('/secretary/visitors').then(d => setVisitors(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchEvents = () => api('/secretary/events').then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchApplications = () => api('/secretary/applications').then(d => setApplications(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchFeePayments = () => api('/secretary/payments').then(d => setFeePayments(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchSchoolSettings = () => api('/school-settings').then(d => setSchoolSettings(d || {})).catch(() => {});
  const fetchMsgUsers = () => api('/messages/users').then(d => { const all = Object.values(d.users || d || {}).flat(); setMsgUsers(all); }).catch(() => {});
  const fetchUnread = () => api('/messages/unread-count').then(d => setUnread(d.count || 0)).catch(() => {});
  const fetchConversation = (uid) => api(`/messages/conversation/${uid}`).then(d => setMessages(Array.isArray(d.messages) ? d.messages : [])).catch(() => {});
  const fetchNews = () => api('/secretary/news').then(d => setNews(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchGallery = () => api('/secretary/gallery').then(d => setGallery(Array.isArray(d) ? d : [])).catch(() => {});

 // ─── ACTIONS ──────────────────────────────────────────────────────

// In the Swal.fire html, add a copy button:
const createStudent = async () => {
  if (!studentForm.fullName) { 
    Swal.fire('Missing Fields', 'Student name required', 'warning'); 
    return; 
  }
  setSaving(true);
  try {
    const result = await api('/academic-admin/students', { 
      method: 'POST', 
      body: JSON.stringify({
        ...studentForm,
        password: studentForm.password || undefined
      }) 
    });
    
    const studentId = result.student.studentId;
    const password = result.generatedPassword || 'student123';
    const email = result.student.email || studentForm.email || 'Not provided';
    
    // Display success message with student ID and credentials
    Swal.fire({
      title: '✅ Student Registered Successfully!',
      html: `
        <div style="text-align: left; padding: 10px 0; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;"><strong>Full Name</strong></span>
            <span style="font-weight: 600;">${studentForm.fullName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;"><strong>Student ID</strong></span>
            <span style="background: #1a3a5c; color: white; padding: 2px 12px; border-radius: 4px; font-weight: 700; font-size: 15px;">${studentId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;"><strong>Email</strong></span>
            <span>${email}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;"><strong>Password</strong></span>
            <span style="background: #27ae60; color: white; padding: 2px 12px; border-radius: 4px; font-weight: 700;">${password}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: #666;"><strong>Class</strong></span>
            <span>${studentForm.classId ? classes.find(c => c._id === studentForm.classId)?.grade + ' ' + classes.find(c => c._id === studentForm.classId)?.className : 'Not assigned'}</span>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center;">
          <button onclick="navigator.clipboard.writeText('ID: ${studentId}\\nPassword: ${password}')" 
            style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
            <i class="fas fa-copy"></i> Copy Credentials
          </button>
        </div>
        <div style="margin-top: 10px; padding: 10px; background: #fff3e0; border-radius: 8px; font-size: 12px; color: #e67e22; text-align: left;">
          <i class="fas fa-info-circle" style="margin-right: 6px;"></i> 
          <strong>IMPORTANT:</strong> Please save these credentials and share them with the student.
        </div>
      `,
      icon: 'success',
      confirmButtonText: '✅ Done',
      confirmButtonColor: '#00bcd4',
      width: 520,
      backdrop: 'rgba(0,0,0,0.4)',
      padding: '20px'
    });
    
    // Reset form and close modal
    setStudentModal(false); 
    setStudentForm({ 
      fullName: '', email: '', classId: '', parentName: '', parentPhone: '', 
      dateOfBirth: '', gender: 'other', address: '', password: '' 
    });
    fetchStudents();
    
  } catch (e) { 
    Swal.fire({
      title: '❌ Registration Failed',
      text: e.message || 'Failed to register student. Please try again.',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    }); 
  } finally { 
    setSaving(false); 
  }
};
  // Visitor Management
  const addVisitor = async () => {
    if (!visitorForm.name || !visitorForm.purpose) { Swal.fire('Missing Fields', 'Name and purpose required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/secretary/visitors', { method: 'POST', body: JSON.stringify(visitorForm) });
      Swal.fire('✅ Visitor Registered!', '', 'success');
      setVisitorModal(false);
      setVisitorForm({ name: '', email: '', phone: '', purpose: '', personToVisit: '', arrivalTime: new Date().toISOString().slice(0,16), departureTime: '' });
      fetchVisitors();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const visitorCheckOut = async (id) => {
    const ok = await Swal.fire({ title: 'Check Out Visitor?', icon: 'question', showCancelButton: true, confirmButtonText: 'Yes, Check Out' });
    if (!ok.isConfirmed) return;
    try {
      await api(`/secretary/visitors/${id}/checkout`, { method: 'PUT' });
      Swal.fire('✅ Checked Out!', '', 'success');
      fetchVisitors();
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
  };

  // Event Management
  const addEvent = async () => {
    if (!eventForm.title || !eventForm.date) { Swal.fire('Missing Fields', 'Title and date required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/secretary/events', { method: 'POST', body: JSON.stringify(eventForm) });
      Swal.fire('✅ Event Created!', '', 'success');
      setEventModal(false);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', organizer: '', permissionRequired: false });
      fetchEvents();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteEvent = async (e) => {
    const ok = await Swal.fire({ title: `Delete "${e.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/secretary/events/${e._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchEvents();
  };

  // News Management
  const postNews = async () => {
    if (!newsForm.title || !newsForm.summary) { Swal.fire('Missing Fields', 'Title and summary required', 'warning'); return; }
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      Object.entries(newsForm).forEach(([k, v]) => fd.append(k, v));
      if (newsImageFile) fd.append('image', newsImageFile);
      const res = await fetch(`${API_URL}/secretary/news`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw await res.json();
      Swal.fire('✅ Published!', 'News posted successfully', 'success');
      setNewsModal(false); setNewsForm({ title: '', summary: '', content: '', category: 'news', tags: '' }); setNewsImageFile(null);
      fetchNews();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteNews = async (item) => {
    const ok = await Swal.fire({ title: `Delete "${item.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/secretary/news/${item._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchNews();
  };

  // Gallery Management
  const addGalleryImage = async () => {
    if (!galleryForm.title || !galleryImageFile) { Swal.fire('Missing Fields', 'Title and image required', 'warning'); return; }
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      Object.entries(galleryForm).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', galleryImageFile);
      const res = await fetch(`${API_URL}/secretary/gallery`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw await res.json();
      Swal.fire('✅ Added!', 'Image added to gallery', 'success');
      setGalleryModal(false); setGalleryForm({ title: '', category: 'events', description: '' }); setGalleryImageFile(null);
      fetchGallery();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteGallery = async (img) => {
    const ok = await Swal.fire({ title: `Delete "${img.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/secretary/gallery/${img._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchGallery();
  };

  // Announcement Management
  const postAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      Swal.fire('Missing Fields', 'Title and content required', 'warning');
      return;
    }
    setSaving(true);
    try {
      await api('/announcements', { method: 'POST', body: JSON.stringify(announcementForm) });
      Swal.fire('📢 Posted!', 'Announcement published', 'success');
      setAnnouncementModal(false);
      setAnnouncementForm({ title: '', content: '', audience: 'all', priority: 'normal' });
      fetchAnnouncements();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  // Contact Management
  const replyToContact = async (contact) => {
    const { value: reply } = await Swal.fire({
      title: `Reply to ${contact.fullName}`,
      input: 'textarea',
      inputPlaceholder: 'Type your reply...',
      showCancelButton: true,
      confirmButtonText: 'Send Reply',
      confirmButtonColor: '#00bcd4'
    });
    if (!reply) return;
    try {
      await api(`/admin/contacts/${contact._id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ status: 'replied', reply }) 
      });
      Swal.fire('✅ Reply Sent!', '', 'success');
      fetchContacts();
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
  };

  // Messaging
  const sendMessage = async () => {
    if (!msgText.trim() || !selectedUser) return;
    try {
      const res = await api('/messages/send', { method: 'POST', body: JSON.stringify({ recipientId: selectedUser._id, subject: 'Direct Message', content: msgText.trim() }) });
      setMessages(prev => [...prev, res.message]);
      setMsgText('');
      if (socket) socket.emit('sendMessage', { receiverId: selectedUser._id, ...res.message });
      fetchUnread();
    } catch {}
  };

  const sendMassMessage = async () => {
    if (!massMessageForm.subject || !massMessageForm.content) {
      Swal.fire('Missing Fields', 'Subject and content required', 'warning');
      return;
    }
    setSaving(true);
    try {
      let recipients = [];
      if (massMessageForm.audience === 'all_parents') {
        recipients = students.map(s => ({ id: s.userId, name: s.parentName }));
      } else if (massMessageForm.audience === 'all_teachers') {
        recipients = teachers;
      } else if (massMessageForm.audience === 'all_students') {
        recipients = students;
      } else if (massMessageForm.audience === 'all') {
        recipients = [...teachers, ...students];
      }

      let sentCount = 0;
      for (const recipient of recipients.slice(0, 100)) {
        if (recipient.userId || recipient._id) {
          await api('/messages/send', {
            method: 'POST',
            body: JSON.stringify({
              recipientId: recipient.userId || recipient._id,
              subject: massMessageForm.subject,
              content: massMessageForm.content
            })
          }).catch(() => {});
          sentCount++;
        }
      }
      Swal.fire('✅ Messages Sent!', `Messages sent to ${sentCount} recipients`, 'success');
      setMassMessageModal(false);
      setMassMessageForm({ subject: '', content: '', audience: 'all' });
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Menu Items ──────────────────────────────────────────────────
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'students', label: 'Student Directory', icon: 'fas fa-user-graduate' },
    { id: 'admissions', label: 'Admissions', icon: 'fas fa-file-alt' },
    { id: 'visitors', label: 'Visitor Log', icon: 'fas fa-door-open' },
    { id: 'events', label: 'Events & Calendar', icon: 'fas fa-calendar-alt' },
    { id: 'news', label: 'News & Events', icon: 'fas fa-newspaper' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
    { id: 'contacts', label: 'Contact Inquiries', icon: 'fas fa-envelope' },
    { id: 'messages', label: 'Messages', icon: 'fas fa-comments', badge: unread },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-shield' },
  ];

  const filteredUsers = msgUsers.filter(u =>
    u.fullName?.toLowerCase().includes(msgSearch.toLowerCase()) || u.role?.toLowerCase().includes(msgSearch.toLowerCase())
  );

  const sideW = isMobile ? 0 : sidebarOpen ? 260 : 72;

  // ─── Calculate statistics ────────────────────────────────────────
  const pendingAdmissions = applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length;
  const activeVisitors = visitors.filter(v => !v.departureTime).length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const unreadContacts = contacts.filter(c => c.status === 'unread').length;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg,#0d2b42,#1a3a5c)', color: 'white', gap: 20 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#ffc107', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <p style={{ margin: 0, fontSize: 16 }}>Loading Dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f3f8', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .tab-anim{animation:fadeIn .22s ease}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:10px}
        .sent-bubble{background:#1a3a5c;color:white;border-radius:18px 18px 4px 18px;padding:10px 15px;max-width:70%;align-self:flex-end;font-size:13px}
        .recv-bubble{background:white;color:#333;border-radius:18px 18px 18px 4px;padding:10px 15px;max-width:70%;align-self:flex-start;font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
        @media(max-width:768px){.hide-mobile{display:none!important}.stats-g{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998 }} />}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999, width: isMobile ? (mobileOpen ? 260 : 0) : sideW, background: 'linear-gradient(180deg,#0d1f33 0%,#1a3a5c 100%)', color: 'white', display: 'flex', flexDirection: 'column', transition: 'width .3s ease', overflow: 'hidden', boxShadow: '3px 0 20px rgba(0,0,0,.18)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, background: '#ffc107', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-clipboard" style={{ fontSize: 16, color: '#1a3a5c' }} />
          </div>
          {(sidebarOpen || isMobile) && <div><div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600 }}>LYMAR Portal</div><div style={{ fontSize: 10, opacity: .6, letterSpacing: 1 }}>SECRETARY</div></div>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}><i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} /></button>}
        </div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Avatar name={userName} size={36} bg='rgba(255,193,7,.2)' color='#ffc107' />
          {(sidebarOpen || isMobile) && <div><div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div><div style={{ fontSize: 10, color: '#ffc107' }}>Secretary Admin</div></div>}
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {menuItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setMobileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 16px', background: active ? 'rgba(255,193,7,.15)' : 'transparent', border: 'none', borderRight: active ? '3px solid #ffc107' : '3px solid transparent', color: active ? '#ffc107' : 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all .2s', textAlign: 'left' }}>
                <i className={item.icon} style={{ fontSize: 15, width: 18, flexShrink: 0 }} />
                {(sidebarOpen || isMobile) && <span style={{ flex: 1 }}>{item.label}</span>}
                {item.badge > 0 && (sidebarOpen || isMobile) && <span style={{ background: '#e74c3c', color: 'white', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <button onClick={() => { localStorage.clear(); navigate('/portal/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'rgba(231,76,60,.2)', border: '1px solid rgba(231,76,60,.3)', borderRadius: 9, color: '#ff8a80', cursor: 'pointer', fontSize: 13 }}>
            <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} />{(sidebarOpen || isMobile) && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : sideW, transition: 'margin-left .3s', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: 'white', padding: '11px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '7px 10px', borderRadius: 8, cursor: 'pointer' }}><i className="fas fa-bars" /></button>}
            <div>
              <div style={{ fontSize: 10, color: '#aaa', letterSpacing: .5 }}>{schoolSettings.schoolName || 'Lycee St Marcel De Rukara'}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>{menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMassMessageModal(true)} style={{ background: '#3498db', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'white', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}>
              <i className="fas fa-envelope" style={{ marginRight: 4 }} /> Mass Message
            </button>
            {unread > 0 && <button onClick={() => setActiveTab('messages')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 17 }}>
              <i className="fas fa-bell" />
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#e74c3c', color: 'white', borderRadius: '50%', fontSize: 9, width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>
            </button>}
            <Avatar name={userName} size={32} />
            <div className="hide-mobile">
              <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{userName}</div>
              <div style={{ fontSize: 10, color: '#ffc107' }}>SECRETARY</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }} className="tab-anim">

          {/* ══ OVERVIEW DASHBOARD ══ */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#0d1f33,#1a3a5c)', borderRadius: 18, padding: '24px 28px', marginBottom: 22, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, boxShadow: '0 6px 24px rgba(26,58,92,.35)' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Georgia, serif', marginBottom: 5 }}>Welcome, {userName.split(' ')[0]}! 📋</div>
                  <div style={{ fontSize: 12, opacity: .75 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn onClick={() => setStudentModal(true)} icon="fas fa-user-plus" color="#ffc107" textColor="#1a3a5c">Register Student</Btn>
                  <Btn onClick={() => setVisitorModal(true)} icon="fas fa-door-open" color="rgba(255,255,255,.15)" textColor="white">New Visitor</Btn>
                </div>
              </div>
              <div className="stats-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 20 }}>
                <StatCard icon="fas fa-user-graduate" label="Total Students" value={students.length} sub="Enrolled" accent="#00bcd4" bg="#e0f7fa" onClick={() => setActiveTab('students')} />
                <StatCard icon="fas fa-file-alt" label="Pending Admissions" value={pendingAdmissions} sub="Awaiting review" accent="#f39c12" bg="#fff3e0" onClick={() => setActiveTab('admissions')} />
                <StatCard icon="fas fa-door-open" label="Active Visitors" value={activeVisitors} sub="On premises" accent="#9b59b6" bg="#f3e5f5" onClick={() => setActiveTab('visitors')} />
                <StatCard icon="fas fa-calendar-alt" label="Upcoming Events" value={upcomingEvents} sub="Scheduled" accent="#27ae60" bg="#e8f5e9" onClick={() => setActiveTab('events')} />
                <StatCard icon="fas fa-envelope" label="Unread Inquiries" value={unreadContacts} sub="Need response" accent="#e74c3c" bg="#fdecea" onClick={() => setActiveTab('contacts')} />
                <StatCard icon="fas fa-users" label="Teachers" value={teachers.length} sub="Staff" accent="#3498db" bg="#e3f2fd" />
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <Btn small onClick={() => setStudentModal(true)} icon="fas fa-user-plus" color="#00bcd4">Register Student</Btn>
                <Btn small onClick={() => setVisitorModal(true)} icon="fas fa-door-open" color="#9b59b6">Check-in Visitor</Btn>
                <Btn small onClick={() => setEventModal(true)} icon="fas fa-calendar-plus" color="#27ae60">Add Event</Btn>
                <Btn small onClick={() => setAnnouncementModal(true)} icon="fas fa-bullhorn" color="#e74c3c">Post Announcement</Btn>
              </div>

              {/* Recent Announcements */}
              <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}><i className="fas fa-bullhorn" style={{ marginRight: 7, color: '#ffc107' }} />Recent Announcements</h3>
                  <Btn small onClick={() => setAnnouncementModal(true)} icon="fas fa-plus" color="#1a3a5c">Post</Btn>
                </div>
                {announcements.slice(0, 3).map(ann => {
                  const pc = ann.priority === 'urgent' ? '#e74c3c' : ann.priority === 'high' ? '#f39c12' : '#27ae60';
                  return (
                    <div key={ann._id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ann.title}</div>
                        <Badge text={ann.priority} color={pc} bg={pc + '22'} size={10} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{fmt(ann.createdAt)}</div>
                    </div>
                  );
                })}
                {announcements.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', padding: 20 }}>No announcements yet</p>}
              </div>
            </div>
          )}

         {/* ══ STUDENT DIRECTORY ══ */}
{activeTab === 'students' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
      <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Student Directory</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{students.length} students enrolled</p></div>
      <Btn onClick={() => setStudentModal(true)} icon="fas fa-user-plus" color="#00bcd4">Register Student</Btn>
    </div>
    <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
      <Table cols={['Student', 'ID', 'Class', 'Parent', 'Contact', 'Actions']} emptyMsg="No students enrolled yet."
        rows={students.map(s => (
          <><TD><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={s.fullName} size={30} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{s.fullName}</div></div></div></TD>
            <TD><Badge text={s.studentId || '—'} color="#1a3a5c" bg="#e8f0fb" /></TD>
            <TD>{s.classId ? <Badge text={`${s.classId.grade || ''} ${s.classId.className || ''}`} color="#3498db" bg="#e3f2fd" /> : <span style={{ color: '#aaa', fontSize: 12 }}>Not assigned</span>}</TD>
            <TD style={{ fontSize: 12 }}>{s.parentName || '—'}</TD>
            <TD style={{ fontSize: 12 }}>{s.parentPhone || '—'}</TD>
            <TD><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn small icon="fas fa-comment" color="#3498db" onClick={() => { setSelectedUser(s); setActiveTab('messages'); }}>Message</Btn>
              <Btn small danger icon="fas fa-trash" onClick={() => deleteStudent(s)} />
            </div></TD></>
        ))}
      />
    </div>
  </div>
)}

          {/* ══ ADMISSIONS ══ */}
          {activeTab === 'admissions' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Admission Applications</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{applications.length} total · {pendingAdmissions} pending</p></div>
              <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table cols={['Applicant', 'Level', 'Previous School', 'Average', 'Applied', 'Status']} emptyMsg="No applications submitted yet."
                  rows={applications.map(app => (
                    <><TD><div style={{ fontWeight: 600, fontSize: 13 }}>{app.fullName}</div><div style={{ fontSize: 11, color: '#aaa' }}>{app.email}</div></TD>
                      <TD><Badge text={app.level} color="#3498db" bg="#e3f2fd" /></TD>
                      <TD style={{ fontSize: 12 }}>{app.previousSchool}</TD>
                      <TD><span style={{ fontWeight: 700, color: app.lastAverage >= 70 ? '#27ae60' : '#e74c3c' }}>{app.lastAverage}%</span></TD>
                      <TD style={{ fontSize: 12, color: '#aaa' }}>{fmt(app.createdAt)}</TD>
                      <TD><Badge text={app.status} color={app.status === 'pending' ? '#f39c12' : app.status === 'accepted' ? '#27ae60' : '#e74c3c'} bg={app.status === 'pending' ? '#fff3e0' : app.status === 'accepted' ? '#e8f5e9' : '#fdecea'} /></TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ VISITOR LOG ══ */}
          {activeTab === 'visitors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Visitor Log</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{activeVisitors} active visitors</p></div>
                <Btn onClick={() => setVisitorModal(true)} icon="fas fa-plus" color="#9b59b6">Check-in Visitor</Btn>
              </div>
              <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table cols={['Name', 'Purpose', 'Person to Visit', 'Arrival', 'Status', 'Actions']} emptyMsg="No visitors logged."
                  rows={visitors.map(v => (
                    <><TD><div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div><div style={{ fontSize: 11, color: '#aaa' }}>{v.email || v.phone}</div></TD>
                      <TD style={{ fontSize: 12 }}>{v.purpose}</TD>
                      <TD style={{ fontSize: 12 }}>{v.personToVisit || '—'}</TD>
                      <TD style={{ fontSize: 12, color: '#aaa' }}>{fmt(v.arrivalTime)}</TD>
                      <TD><Badge text={v.departureTime ? 'Checked Out' : 'Active'} color={v.departureTime ? '#888' : '#27ae60'} bg={v.departureTime ? '#f5f5f5' : '#e8f5e9'} /></TD>
                      <TD>{!v.departureTime && <Btn small onClick={() => visitorCheckOut(v._id)} icon="fas fa-sign-out-alt" color="#e74c3c">Check Out</Btn>}</TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ EVENTS & CALENDAR ══ */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Events & Calendar</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{upcomingEvents} upcoming events</p></div>
                <Btn onClick={() => setEventModal(true)} icon="fas fa-plus" color="#27ae60">Add Event</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb' }}><i className="fas fa-calendar-alt" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .3 }} />No events scheduled</div>}
                {events.map(e => {
                  const isPast = new Date(e.date) < new Date();
                  return (
                    <div key={e._id} style={{ background: 'white', borderRadius: 12, padding: '15px 18px', borderLeft: `4px solid ${isPast ? '#aaa' : '#27ae60'}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 14, color: '#1a3a5c' }}>{e.title}</h3>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                            <Badge text={e.date ? fmt(e.date) : '—'} color="#888" bg="#f5f5f5" />
                            {e.time && <Badge text={e.time} color="#888" bg="#f5f5f5" />}
                            {e.location && <Badge text={e.location} color="#888" bg="#f5f5f5" />}
                            {e.permissionRequired && <Badge text="Permission Required" color="#f39c12" bg="#fff3e0" />}
                          </div>
                          {e.description && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>{e.description}</p>}
                        </div>
                        <Btn small danger icon="fas fa-trash" onClick={() => deleteEvent(e)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ NEWS & EVENTS ══ */}
          {activeTab === 'news' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>News & Events</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{news.length} articles published</p></div>
                <Btn onClick={() => setNewsModal(true)} icon="fas fa-plus" color="#1a3a5c">Post News</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {news.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb' }}><i className="fas fa-newspaper" style={{ fontSize: 36, marginBottom: 10, display: 'block', opacity: .3 }} />No news published yet</div>}
                {news.map(n => (
                  <div key={n._id} style={{ background: 'white', borderRadius: 13, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                    {n.image && <img src={n.image} alt={n.title} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 14, color: '#1a3a5c' }}>{n.title}</h3>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Badge text={n.category} color="#f39c12" bg="#fff3e0" />
                          <span style={{ fontSize: 11, color: '#aaa' }}>{fmt(n.date)}</span>
                          <Btn small danger icon="fas fa-trash" onClick={() => deleteNews(n)} />
                        </div>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666', lineHeight: 1.6 }}>{n.summary}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#aaa' }}>
                        <span><i className="fas fa-eye" style={{ marginRight: 4 }} />{n.views || 0} views</span>
                        <span><i className="fas fa-user" style={{ marginRight: 4 }} />{n.author}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ GALLERY ══ */}
          {activeTab === 'gallery' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Photo Gallery</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{gallery.length} images</p></div>
                <Btn onClick={() => setGalleryModal(true)} icon="fas fa-plus" color="#1a3a5c">Add Image</Btn>
              </div>
              {gallery.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb' }}><i className="fas fa-images" style={{ fontSize: 36, marginBottom: 10, display: 'block', opacity: .3 }} />No gallery images yet</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                {gallery.map(img => (
                  <div key={img._id} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                    <img src={img.image} alt={img.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{img.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <Badge text={img.category} color="#3498db" bg="#e3f2fd" size={10} />
                        <button onClick={() => deleteGallery(img)} style={{ background: '#fdecea', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#e74c3c', fontSize: 11 }}><i className="fas fa-trash" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ANNOUNCEMENTS ══ */}
          {activeTab === 'announcements' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>School Announcements</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{announcements.length} total</p></div>
                <Btn onClick={() => setAnnouncementModal(true)} icon="fas fa-plus" color="#1a3a5c">Post Announcement</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb' }}><i className="fas fa-bullhorn" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: .3 }} />No announcements yet</div>}
                {announcements.map(ann => {
                  const pc = ann.priority === 'urgent' ? '#e74c3c' : ann.priority === 'high' ? '#f39c12' : '#27ae60';
                  return (
                    <div key={ann._id} style={{ background: 'white', borderRadius: 12, padding: '15px 18px', borderLeft: `4px solid ${pc}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 14, color: '#1a3a5c' }}>{ann.title}</h3>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Badge text={ann.priority} color={pc} bg={pc + '22'} />
                          <Badge text={ann.audience || 'all'} color="#888" bg="#f5f5f5" />
                          <span style={{ fontSize: 11, color: '#aaa' }}>{fmt(ann.createdAt)}</span>
                        </div>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#555', lineHeight: 1.6 }}>{ann.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ CONTACT INQUIRIES ══ */}
          {activeTab === 'contacts' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Contact Inquiries</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{unreadContacts} unread messages</p></div>
              <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table cols={['From', 'Subject', 'Message', 'Received', 'Status', 'Actions']} emptyMsg="No inquiries received."
                  rows={contacts.map(c => (
                    <><TD><div style={{ fontWeight: 600, fontSize: 13 }}>{c.fullName}</div><div style={{ fontSize: 11, color: '#aaa' }}>{c.email}</div></TD>
                      <TD style={{ fontSize: 12 }}>{c.subject || '—'}</TD>
                      <TD><div style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#666' }}>{c.message}</div></TD>
                      <TD style={{ fontSize: 12, color: '#aaa' }}>{fmt(c.createdAt)}</TD>
                      <TD><Badge text={c.status} color={c.status === 'unread' ? '#e74c3c' : c.status === 'read' ? '#f39c12' : '#27ae60'} bg={c.status === 'unread' ? '#fdecea' : c.status === 'read' ? '#fff3e0' : '#e8f5e9'} /></TD>
                      <TD>{c.status !== 'replied' && <Btn small onClick={() => replyToContact(c)} icon="fas fa-reply" color="#00bcd4">Reply</Btn>}</TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ MESSAGES ══ */}
          {activeTab === 'messages' && (
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #eee', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['inbox', 'compose'].map(t => (
                  <button key={t} onClick={() => { setMsgTab(t); if (t === 'compose') { setSelectedUser(null); setMessages([]); } }}
                    style={{ padding: '7px 18px', borderRadius: 30, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: msgTab === t ? '#1a3a5c' : '#f0f3f8', color: msgTab === t ? 'white' : '#666', transition: 'all .2s' }}>
                    {t === 'inbox' ? <><i className="fas fa-inbox" style={{ marginRight: 6 }} />Inbox{unread > 0 && <span style={{ marginLeft: 6, background: '#e74c3c', color: 'white', borderRadius: 20, fontSize: 10, padding: '1px 6px' }}>{unread}</span>}</> : <><i className="fas fa-pen" style={{ marginRight: 6 }} />New Message</>}
                  </button>
                ))}
                <Btn small onClick={() => setMassMessageModal(true)} icon="fas fa-users" color="#3498db">Mass Message</Btn>
              </div>
              {msgTab === 'inbox' ? (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: 260, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', background: '#fafbff', flexShrink: 0 }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                      <div style={{ position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#ccc', fontSize: 11 }} />
                        <input value={msgSearch} onChange={e => setMsgSearch(e.target.value)} placeholder="Search…" style={{ width: '100%', padding: '7px 10px 7px 28px', border: '1px solid #eee', borderRadius: 20, fontSize: 12, boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: 28, color: '#ccc', fontSize: 13 }}>No users found</div>}
                      {filteredUsers.map(u => (
                        <div key={u._id} onClick={() => { setSelectedUser(u); fetchConversation(u._id); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', cursor: 'pointer', background: selectedUser?._id === u._id ? '#e8f0fe' : 'transparent', borderLeft: selectedUser?._id === u._id ? '3px solid #ffc107' : '3px solid transparent', transition: 'background .15s' }}>
                          <Avatar name={u.fullName} size={34} img={u.profileImage} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fullName}</div>
                            <div style={{ fontSize: 10, color: '#ffc107', fontWeight: 700 }}>{roleBadge(u.role).label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedUser ? (
                      <>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 11 }}>
                          <Avatar name={selectedUser.fullName} size={38} img={selectedUser.profileImage} />
                          <div><div style={{ fontWeight: 600, fontSize: 14, color: '#1a3a5c' }}>{selectedUser.fullName}</div><div style={{ fontSize: 11, color: '#ffc107', fontWeight: 700 }}>{roleBadge(selectedUser.role).label}</div></div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#f8f9ff' }}>
                          {messages.length === 0 && <div style={{ textAlign: 'center', color: '#ccc', paddingTop: 40 }}><i className="fas fa-comments" style={{ fontSize: 30, display: 'block', marginBottom: 8 }} />Start a conversation</div>}
                          {messages.map(m => (
                            <div key={m._id} className={m.senderId === userId ? 'sent-bubble' : 'recv-bubble'}>
                              <div>{m.content}</div>
                              <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: 'right' }}>{fmtTime(m.createdAt)}</div>
                            </div>
                          ))}
                          <div ref={msgEndRef} />
                        </div>
                        <div style={{ padding: '10px 14px', borderTop: '1px solid #eee', display: 'flex', gap: 9, background: 'white', alignItems: 'flex-end' }}>
                          <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder={`Message ${selectedUser.fullName}…`} rows={2}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 12, resize: 'none', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                          <button onClick={sendMessage} disabled={!msgText.trim()} style={{ width: 40, height: 40, background: msgText.trim() ? '#1a3a5c' : '#ddd', border: 'none', borderRadius: '50%', cursor: msgText.trim() ? 'pointer' : 'default', color: 'white', fontSize: 15, flexShrink: 0 }}><i className="fas fa-paper-plane" /></button>
                        </div>
                      </>
                    ) : <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', gap: 10 }}><i className="fas fa-comments" style={{ fontSize: 44, opacity: .3 }} /><div style={{ fontSize: 14 }}>Select a user to message</div></div>}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, padding: 24, maxWidth: 580, margin: '0 auto', width: '100%', overflowY: 'auto' }}>
                  <h3 style={{ margin: '0 0 18px', color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>New Message</h3>
                  <Field label="Recipient" required>
                    <Sel value={selectedUser?._id || ''} onChange={e => setSelectedUser(msgUsers.find(u => u._id === e.target.value) || null)}>
                      <option value="">Select user…</option>
                      {msgUsers.map(u => <option key={u._id} value={u._id}>{u.fullName} — {roleBadge(u.role).label}</option>)}
                    </Sel>
                  </Field>
                  <Field label="Message" required>
                    <Txt value={msgText} onChange={e => setMsgText(e.target.value)} rows={7} placeholder="Type your message…" />
                  </Field>
                  <Btn icon="fas fa-paper-plane" color="#1a3a5c" style={{ width: '100%', justifyContent: 'center', padding: 11, marginTop: 4 }}
                    onClick={async () => { if (!selectedUser || !msgText.trim()) { Swal.fire('Error', 'Select recipient and enter message', 'warning'); return; } await sendMessage(); Swal.fire('✅ Sent!', '', 'success'); setMsgTab('inbox'); }}>Send Message</Btn>
                </div>
              )}
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ background: 'linear-gradient(135deg,#0d1f33,#1a3a5c)', borderRadius: 18, padding: '30px', textAlign: 'center', marginBottom: 18, color: 'white' }}>
                <Avatar name={userName} size={72} bg='rgba(255,193,7,.2)' color='#ffc107' />
                <h2 style={{ margin: '14px 0 3px', fontFamily: 'Georgia, serif', fontSize: 22 }}>{userName}</h2>
                <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1 }}>SECRETARY ADMINISTRATOR</div>
                <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{localStorage.getItem('userEmail') || 'secretary@essa.rw'}</div>
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-lock" style={{ color: '#ffc107' }} />Change Password
                </h3>
                {[['Current Password', 'currentPw'], ['New Password', 'newPw'], ['Confirm New Password', 'confirmPw']].map(([label, id]) => (
                  <Field key={id} label={label} required><Inp type="password" id={id} placeholder={`Enter ${label.toLowerCase()}`} /></Field>
                ))}
                <Btn icon="fas fa-key" color="#1a3a5c" onClick={() => {
                  const cur = document.getElementById('currentPw')?.value;
                  const nw = document.getElementById('newPw')?.value;
                  const cf = document.getElementById('confirmPw')?.value;
                  if (!cur || !nw || !cf) { Swal.fire('Error', 'All fields required', 'warning'); return; }
                  if (nw !== cf) { Swal.fire('Error', 'Passwords do not match', 'error'); return; }
                  if (nw.length < 6) { Swal.fire('Error', 'Min 6 characters', 'error'); return; }
                  api('/user/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: cur, newPassword: nw }) })
                    .then(() => Swal.fire('✅ Password Updated!', '', 'success'))
                    .catch(e => Swal.fire('Error', e.message || 'Current password incorrect', 'error'));
                }}>Update Password</Btn>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── MODALS ─── */}

      {/* Student Registration Modal */}
      <Modal open={studentModal} onClose={() => setStudentModal(false)} title="Register New Student" width={520}>
        <Field label="Full Name" required><Inp value={studentForm.fullName} placeholder="Student full name" onChange={e => setStudentForm(p => ({ ...p, fullName: e.target.value }))} /></Field>
        <Field label="Email"><Inp type="email" value={studentForm.email} placeholder="student@essa.rw" onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))} /></Field>
        <Field label="Class">
          <Sel value={studentForm.classId} onChange={e => setStudentForm(p => ({ ...p, classId: e.target.value }))}>
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.grade} {c.className}</option>)}
          </Sel>
        </Field>
        <Field label="Gender">
          <Sel value={studentForm.gender} onChange={e => setStudentForm(p => ({ ...p, gender: e.target.value }))}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Sel>
        </Field>
        <Field label="Date of Birth"><Inp type="date" value={studentForm.dateOfBirth} onChange={e => setStudentForm(p => ({ ...p, dateOfBirth: e.target.value }))} /></Field>
        <Field label="Parent Name"><Inp value={studentForm.parentName} placeholder="Parent/Guardian name" onChange={e => setStudentForm(p => ({ ...p, parentName: e.target.value }))} /></Field>
        <Field label="Parent Phone"><Inp value={studentForm.parentPhone} placeholder="+250 788 000 000" onChange={e => setStudentForm(p => ({ ...p, parentPhone: e.target.value }))} /></Field>
        <Field label="Address"><Inp value={studentForm.address} placeholder="Home address" onChange={e => setStudentForm(p => ({ ...p, address: e.target.value }))} /></Field>
        <Field label="Password"><Inp type="password" value={studentForm.password} placeholder="Leave blank for auto-generate" onChange={e => setStudentForm(p => ({ ...p, password: e.target.value }))} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setStudentModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createStudent} icon="fas fa-user-graduate" color="#00bcd4" disabled={saving}>{saving ? 'Saving…' : 'Register Student'}</Btn>
        </div>
      </Modal>

      {/* Visitor Check-in Modal */}
      <Modal open={visitorModal} onClose={() => setVisitorModal(false)} title="Check-in Visitor" width={520}>
        <Field label="Full Name" required><Inp value={visitorForm.name} placeholder="Visitor name" onChange={e => setVisitorForm(p => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Email"><Inp type="email" value={visitorForm.email} placeholder="visitor@email.com" onChange={e => setVisitorForm(p => ({ ...p, email: e.target.value }))} /></Field>
        <Field label="Phone"><Inp value={visitorForm.phone} placeholder="+250 788 000 000" onChange={e => setVisitorForm(p => ({ ...p, phone: e.target.value }))} /></Field>
        <Field label="Purpose" required><Inp value={visitorForm.purpose} placeholder="Purpose of visit" onChange={e => setVisitorForm(p => ({ ...p, purpose: e.target.value }))} /></Field>
        <Field label="Person to Visit"><Inp value={visitorForm.personToVisit} placeholder="Staff member to visit" onChange={e => setVisitorForm(p => ({ ...p, personToVisit: e.target.value }))} /></Field>
        <Field label="Arrival Time"><Inp type="datetime-local" value={visitorForm.arrivalTime} onChange={e => setVisitorForm(p => ({ ...p, arrivalTime: e.target.value }))} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setVisitorModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={addVisitor} icon="fas fa-door-open" color="#9b59b6" disabled={saving}>{saving ? 'Registering…' : 'Check-in Visitor'}</Btn>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal open={eventModal} onClose={() => setEventModal(false)} title="Add Event / Activity" width={540}>
        <Field label="Title" required><Inp value={eventForm.title} placeholder="Event title" onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} /></Field>
        <Field label="Description"><Txt value={eventForm.description} rows={3} placeholder="Event description" onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Date" required><Inp type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} /></Field>
          <Field label="Time"><Inp type="time" value={eventForm.time} onChange={e => setEventForm(p => ({ ...p, time: e.target.value }))} /></Field>
        </div>
        <Field label="Location"><Inp value={eventForm.location} placeholder="Event location" onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} /></Field>
        <Field label="Organizer"><Inp value={eventForm.organizer} placeholder="Organizer name" onChange={e => setEventForm(p => ({ ...p, organizer: e.target.value }))} /></Field>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <input type="checkbox" checked={eventForm.permissionRequired} onChange={e => setEventForm(p => ({ ...p, permissionRequired: e.target.checked }))} style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 12, color: '#666' }}>Permission Required for Students</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setEventModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={addEvent} icon="fas fa-calendar-plus" color="#27ae60" disabled={saving}>{saving ? 'Creating…' : 'Add Event'}</Btn>
        </div>
      </Modal>

      {/* News Modal */}
      <Modal open={newsModal} onClose={() => setNewsModal(false)} title="Post News / Event" width={560}>
        <Field label="Title" required><Inp value={newsForm.title} placeholder="News title" onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} /></Field>
        <Field label="Summary" required><Txt value={newsForm.summary} placeholder="Short summary…" rows={3} onChange={e => setNewsForm(p => ({ ...p, summary: e.target.value }))} /></Field>
        <Field label="Full Content"><Txt value={newsForm.content} placeholder="Full content (optional)" rows={4} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Category">
            <Sel value={newsForm.category} onChange={e => setNewsForm(p => ({ ...p, category: e.target.value }))}>
              <option value="news">📰 News</option>
              <option value="event">🎉 Event</option>
              <option value="announcement">📢 Announcement</option>
              <option value="achievement">🏆 Achievement</option>
            </Sel>
          </Field>
          <Field label="Tags"><Inp value={newsForm.tags} placeholder="tag1, tag2" onChange={e => setNewsForm(p => ({ ...p, tags: e.target.value }))} /></Field>
        </div>
        <Field label="Image (optional)"><input type="file" accept="image/*" onChange={e => setNewsImageFile(e.target.files[0])} style={{ fontSize: 13, padding: '8px 0' }} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setNewsModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={postNews} icon="fas fa-paper-plane" color="#1a3a5c" disabled={saving}>{saving ? 'Publishing…' : 'Publish'}</Btn>
        </div>
      </Modal>

      {/* Gallery Modal */}
      <Modal open={galleryModal} onClose={() => setGalleryModal(false)} title="Add Gallery Image">
        <Field label="Title" required><Inp value={galleryForm.title} placeholder="Image title" onChange={e => setGalleryForm(p => ({ ...p, title: e.target.value }))} /></Field>
        <Field label="Category">
          <Sel value={galleryForm.category} onChange={e => setGalleryForm(p => ({ ...p, category: e.target.value }))}>
            <option value="events">🎪 Events</option>
            <option value="academic">📚 Academic</option>
            <option value="sports">⚽ Sports</option>
            <option value="cultural">🎭 Cultural</option>
          </Sel>
        </Field>
        <Field label="Description"><Txt value={galleryForm.description} placeholder="Optional description" rows={3} onChange={e => setGalleryForm(p => ({ ...p, description: e.target.value }))} /></Field>
        <Field label="Image" required><input type="file" accept="image/*" onChange={e => setGalleryImageFile(e.target.files[0])} style={{ fontSize: 13, padding: '8px 0' }} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setGalleryModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={addGalleryImage} icon="fas fa-image" color="#1a3a5c" disabled={saving}>{saving ? 'Uploading…' : 'Add Image'}</Btn>
        </div>
      </Modal>

      {/* Announcement Modal */}
      <Modal open={announcementModal} onClose={() => setAnnouncementModal(false)} title="Post Announcement" width={540}>
        <Field label="Title" required><Inp value={announcementForm.title} placeholder="Announcement title" onChange={e => setAnnouncementForm(p => ({ ...p, title: e.target.value }))} /></Field>
        <Field label="Content" required><Txt value={announcementForm.content} rows={4} placeholder="Write your announcement here..." onChange={e => setAnnouncementForm(p => ({ ...p, content: e.target.value }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Audience">
            <Sel value={announcementForm.audience} onChange={e => setAnnouncementForm(p => ({ ...p, audience: e.target.value }))}>
              <option value="all">📢 All Users</option>
              <option value="students">🎓 Students</option>
              <option value="teachers">👨‍🏫 Teachers</option>
              <option value="parents">👪 Parents</option>
              <option value="admins">👑 Admins</option>
            </Sel>
          </Field>
          <Field label="Priority">
            <Sel value={announcementForm.priority} onChange={e => setAnnouncementForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="normal">ℹ️ Normal</option>
              <option value="high">⚠️ High</option>
              <option value="urgent">🔴 Urgent</option>
            </Sel>
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setAnnouncementModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={postAnnouncement} icon="fas fa-bullhorn" color="#1a3a5c" disabled={saving}>{saving ? 'Posting…' : 'Post Announcement'}</Btn>
        </div>
      </Modal>

      {/* Mass Message Modal */}
      <Modal open={massMessageModal} onClose={() => setMassMessageModal(false)} title="Mass Message" width={540}>
        <Field label="Subject" required><Inp value={massMessageForm.subject} placeholder="Message subject" onChange={e => setMassMessageForm(p => ({ ...p, subject: e.target.value }))} /></Field>
        <Field label="Audience" required>
          <Sel value={massMessageForm.audience} onChange={e => setMassMessageForm(p => ({ ...p, audience: e.target.value }))}>
            <option value="all">📢 All Users</option>
            <option value="all_parents">👪 All Parents</option>
            <option value="all_teachers">👨‍🏫 All Teachers</option>
            <option value="all_students">🎓 All Students</option>
            <option value="all_admins">👑 All Admins</option>
          </Sel>
        </Field>
        <Field label="Message" required>
          <Txt value={massMessageForm.content} rows={6} placeholder="Type your message here..." onChange={e => setMassMessageForm(p => ({ ...p, content: e.target.value }))} />
        </Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setMassMessageModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={sendMassMessage} icon="fas fa-envelope" color="#3498db" disabled={saving}>{saving ? 'Sending…' : 'Send Mass Message'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

export default SecretaryAdminDashboard;