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

const StatCard = ({ icon, label, value, sub, accent = '#27ae60', bg = '#e8f5e9', onClick }) => (
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

// ─── Subject/Stream options ──────────────────────────────────────────────────
const GRADE_OPTIONS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'French', 'Kinyarwanda', 'Geography', 'History', 'Economics',
  'Computer Science', 'Physical Education', 'Art', 'Music',
  'Religion', 'Literature', 'Accounting', 'Commerce', 'Agriculture'
];

// ═══════════════════════════════════════════════════════════════════
const AcademicAdminDashboard = () => {
  const navigate = useNavigate();
  const msgEndRef = useRef(null);

  // layout
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  // data
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolSettings, setSchoolSettings] = useState({});

  // modals
  const [teacherModal, setTeacherModal] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [timetableModal, setTimetableModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);

  // forms
  const [teacherForm, setTeacherForm] = useState({ fullName: '', email: '', password: '', subject: '', phone: '', qualification: '', experience: '' });
  const [classForm, setClassForm] = useState({ className: '', grade: 'S1', academicYear: new Date().getFullYear().toString(), teacherId: '', subjects: [], capacity: 40 });
  const [studentForm, setStudentForm] = useState({ fullName: '', email: '', classId: '', parentName: '', parentPhone: '', dateOfBirth: '', gender: 'other', address: '' });
  const [timetableForm, setTimetableForm] = useState({ classId: '', day: 'monday', period: '1', subject: '', teacherId: '', timeFrom: '08:00', timeTo: '08:45' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', grade: 'S1', description: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', audience: 'all', priority: 'normal' });

  // file states
  const [saving, setSaving] = useState(false);

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

  const userName = localStorage.getItem('userName') || 'Academic Admin';
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
    if (!token || role !== 'academic_admin') { navigate('/portal/login'); return; }
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
    fetchTeachers(), fetchClasses(), fetchStudents(),
    fetchAnnouncements(), fetchPerformance(),
    fetchMsgUsers(), fetchUnread(),
    fetchTimetables(), fetchSubjects(), fetchSchoolSettings(),
  ]).finally(() => setLoading(false));

  const fetchTeachers = () => api('/academic-admin/teachers-list').then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchClasses = () => api('/academic-admin/classes').then(d => setClasses(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchStudents = () => api('/academic-admin/students').then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchAnnouncements = () => api('/announcements').then(d => setAnnouncements(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchTimetables = () => api('/academic-admin/timetables').then(d => setTimetables(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchSubjects = () => api('/academic-admin/subjects').then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  const fetchSchoolSettings = () => api('/school-settings').then(d => setSchoolSettings(d || {})).catch(() => {});

  const fetchPerformance = () => {
    api('/academic-admin/students-performance').then(d => setStudentPerformance(Array.isArray(d) ? d : [])).catch(() => {});
    api('/academic-admin/class-performance').then(d => setClassPerformance(Array.isArray(d) ? d : [])).catch(() => {});
  };
  const fetchMsgUsers = () => api('/messages/users').then(d => { const all = Object.values(d.users || d || {}).flat(); setMsgUsers(all); }).catch(() => {});
  const fetchUnread = () => api('/messages/unread-count').then(d => setUnread(d.count || 0)).catch(() => {});
  const fetchConversation = (uid) => api(`/messages/conversation/${uid}`).then(d => setMessages(Array.isArray(d.messages) ? d.messages : [])).catch(() => {});

  // ─── ACTIONS ──────────────────────────────────────────────────────

  // Teacher Management
  const createTeacher = async () => {
    if (!teacherForm.fullName || !teacherForm.email) { Swal.fire('Missing Fields', 'Name and Email are required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/academic-admin/create-teacher-credentials', { method: 'POST', body: JSON.stringify(teacherForm) });
      Swal.fire('✅ Teacher Created!', `<b>${teacherForm.fullName}</b><br>Email: <code>${teacherForm.email}</code><br>Password: <code>${teacherForm.password || 'teacher123'}</code>`, 'success');
      setTeacherModal(false); setTeacherForm({ fullName: '', email: '', password: '', subject: '', phone: '', qualification: '', experience: '' });
      fetchTeachers();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteTeacher = async (t) => {
    const ok = await Swal.fire({ title: `Delete ${t.fullName}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/academic-admin/teachers/${t._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchTeachers();
  };

  // Class Management
  const createClass = async () => {
    if (!classForm.className || !classForm.academicYear) { Swal.fire('Missing Fields', 'Class name and academic year required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/academic-admin/classes', { method: 'POST', body: JSON.stringify({ ...classForm, teacherId: classForm.teacherId || null }) });
      Swal.fire('✅ Class Created!', '', 'success');
      setClassModal(false); setClassForm({ className: '', grade: 'S1', academicYear: new Date().getFullYear().toString(), teacherId: '', subjects: [], capacity: 40 });
      fetchClasses();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteClass = async (c) => {
    const ok = await Swal.fire({ title: `Delete ${c.grade} ${c.className}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/academic-admin/classes/${c._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchClasses();
  };

  const assignTeacher = async (cls) => {
    const opts = { '': '— Remove Teacher —' };
    teachers.forEach(t => { opts[t._id] = `${t.fullName} (${t.subject || 'General'})`; });
    const { value } = await Swal.fire({ title: `Assign Teacher to ${cls.grade} ${cls.className}`, input: 'select', inputOptions: opts, showCancelButton: true, confirmButtonText: 'Assign', confirmButtonColor: '#27ae60' });
    if (value === undefined) return;
    try {
      await api(`/academic-admin/classes/${cls._id}/assign-teacher`, { method: 'PUT', body: JSON.stringify({ teacherId: value || null }) });
      Swal.fire('✅ Updated!', '', 'success'); fetchClasses();
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
  };

  // Subject Management
  const createSubject = async () => {
    if (!subjectForm.name || !subjectForm.code) { Swal.fire('Missing Fields', 'Subject name and code required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/academic-admin/subjects', { method: 'POST', body: JSON.stringify(subjectForm) });
      Swal.fire('✅ Subject Created!', '', 'success');
      setSubjectModal(false); setSubjectForm({ name: '', code: '', grade: 'S1', description: '' });
      fetchSubjects();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteSubject = async (s) => {
    const ok = await Swal.fire({ title: `Delete ${s.name}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/academic-admin/subjects/${s._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchSubjects();
  };

  // Timetable Management
  const createTimetable = async () => {
    if (!timetableForm.classId || !timetableForm.subject || !timetableForm.teacherId) {
      Swal.fire('Missing Fields', 'Class, subject and teacher are required', 'warning');
      return;
    }
    setSaving(true);
    try {
      await api('/academic-admin/timetables', { method: 'POST', body: JSON.stringify(timetableForm) });
      Swal.fire('✅ Timetable Entry Created!', '', 'success');
      setTimetableModal(false);
      setTimetableForm({ classId: '', day: 'monday', period: '1', subject: '', teacherId: '', timeFrom: '08:00', timeTo: '08:45' });
      fetchTimetables();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteTimetable = async (t) => {
    const ok = await Swal.fire({ title: 'Delete timetable entry?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/academic-admin/timetables/${t._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchTimetables();
  };

  // Student Management
  const createStudent = async () => {
    if (!studentForm.fullName) { Swal.fire('Missing Fields', 'Student name required', 'warning'); return; }
    setSaving(true);
    try {
      await api('/academic-admin/students', { method: 'POST', body: JSON.stringify(studentForm) });
      Swal.fire('✅ Student Added!', '', 'success');
      setStudentModal(false); setStudentForm({ fullName: '', email: '', classId: '', parentName: '', parentPhone: '', dateOfBirth: '', gender: 'other', address: '' });
      fetchStudents();
    } catch (e) { Swal.fire('Error', e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteStudent = async (s) => {
    const ok = await Swal.fire({ title: `Remove ${s.fullName}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    await api(`/academic-admin/students/${s._id}`, { method: 'DELETE' });
    Swal.fire('Deleted!', '', 'success'); fetchStudents();
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
    { id: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-user' },
    { id: 'classes', label: 'Classes & Streams', icon: 'fas fa-school' },
    { id: 'subjects', label: 'Subjects', icon: 'fas fa-book' },
    { id: 'timetables', label: 'Timetable', icon: 'fas fa-clock' },
    { id: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
    { id: 'performance', label: 'Performance', icon: 'fas fa-chart-bar' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
    { id: 'messages', label: 'Messages', icon: 'fas fa-comments', badge: unread },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-shield' },
  ];

  const filteredUsers = msgUsers.filter(u =>
    u.fullName?.toLowerCase().includes(msgSearch.toLowerCase()) || u.role?.toLowerCase().includes(msgSearch.toLowerCase())
  );

  const sideW = isMobile ? 0 : sidebarOpen ? 260 : 72;

  // ─── Calculate class performance ────────────────────────────────
  const getClassAverage = (classId) => {
    const classStudents = students.filter(s => s.classId?._id === classId || s.classId === classId);
    if (classStudents.length === 0) return 0;
    const total = classStudents.reduce((sum, s) => {
      const perf = studentPerformance.find(p => p.name === s.fullName);
      return sum + (perf?.averageScore || 0);
    }, 0);
    return Math.round(total / classStudents.length);
  };

  const getStudentCount = (classId) => {
    return students.filter(s => s.classId?._id === classId || s.classId === classId).length;
  };

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
        .timetable-grid{display:grid;grid-template-columns:100px repeat(5,1fr);gap:2px;background:#e0e0e0;border-radius:8px;overflow:hidden}
        .timetable-cell{background:white;padding:8px 10px;font-size:12px;min-height:50px;display:flex;flex-direction:column;justify-content:center}
        .timetable-cell.header{background:#f7f9fb;font-weight:600;color:#1a3a5c;font-size:11px;text-align:center}
        .timetable-cell.break{background:#f5f5f5;color:#999;font-style:italic;text-align:center}
        .timetable-cell.lunch{background:#fff8e1;color:#f39c12;text-align:center;font-weight:600}
        .timetable-subject{font-weight:500;color:#1a3a5c}
        .timetable-teacher{font-size:10px;color:#888}
        @media(max-width:768px){.hide-mobile{display:none!important}.stats-g{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998 }} />}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999, width: isMobile ? (mobileOpen ? 260 : 0) : sideW, background: 'linear-gradient(180deg,#0d1f33 0%,#1a3a5c 100%)', color: 'white', display: 'flex', flexDirection: 'column', transition: 'width .3s ease', overflow: 'hidden', boxShadow: '3px 0 20px rgba(0,0,0,.18)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, background: '#ffc107', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-user-graduate" style={{ fontSize: 16, color: '#1a3a5c' }} />
          </div>
          {(sidebarOpen || isMobile) && <div><div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600 }}>LYMAR Portal</div><div style={{ fontSize: 10, opacity: .6, letterSpacing: 1 }}>ACADEMIC ADMIN</div></div>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}><i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} /></button>}
        </div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Avatar name={userName} size={36} bg='rgba(255,193,7,.2)' color='#ffc107' />
          {(sidebarOpen || isMobile) && <div><div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div><div style={{ fontSize: 10, color: '#ffc107' }}>Academic Admin</div></div>}
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
              <div style={{ fontSize: 10, color: '#ffc107' }}>ACADEMIC ADMIN</div>
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
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Georgia, serif', marginBottom: 5 }}>Welcome, {userName.split(' ')[0]}! 📚</div>
                  <div style={{ fontSize: 12, opacity: .75 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn onClick={() => setTeacherModal(true)} icon="fas fa-user-plus" color="#ffc107" textColor="#1a3a5c">Add Teacher</Btn>
                  <Btn onClick={() => setClassModal(true)} icon="fas fa-plus" color="rgba(255,255,255,.15)" textColor="white">New Class</Btn>
                </div>
              </div>
              <div className="stats-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 20 }}>
                <StatCard icon="fas fa-chalkboard-user" label="Teachers" value={teachers.length} sub="Active educators" accent="#27ae60" bg="#e8f5e9" onClick={() => setActiveTab('teachers')} />
                <StatCard icon="fas fa-school" label="Classes" value={classes.length} sub="Active classes" accent="#3498db" bg="#e3f2fd" onClick={() => setActiveTab('classes')} />
                <StatCard icon="fas fa-book" label="Subjects" value={subjects.length} sub="Offered" accent="#9b59b6" bg="#f3e5f5" onClick={() => setActiveTab('subjects')} />
                <StatCard icon="fas fa-user-graduate" label="Students" value={students.length} sub="Enrolled students" accent="#1abc9c" bg="#e0f7fa" onClick={() => setActiveTab('students')} />
                <StatCard icon="fas fa-clock" label="Timetable Entries" value={timetables.length} sub="Scheduled" accent="#f39c12" bg="#fff3e0" onClick={() => setActiveTab('timetables')} />
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <Btn small onClick={() => setTeacherModal(true)} icon="fas fa-user-plus" color="#27ae60">Add Teacher</Btn>
                <Btn small onClick={() => setClassModal(true)} icon="fas fa-school" color="#3498db">Create Class</Btn>
                <Btn small onClick={() => setSubjectModal(true)} icon="fas fa-book" color="#9b59b6">Add Subject</Btn>
                <Btn small onClick={() => setTimetableModal(true)} icon="fas fa-clock" color="#f39c12">Schedule Class</Btn>
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

          {/* ══ TEACHERS ══ */}
          {activeTab === 'teachers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Teachers</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{teachers.length} educators registered</p></div>
                <Btn onClick={() => setTeacherModal(true)} icon="fas fa-plus" color="#1a3a5c">Add Teacher</Btn>
              </div>
              <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table cols={['Teacher', 'Email', 'Subject', 'Qualification', 'Phone', 'Actions']} emptyMsg="No teachers yet. Click Add Teacher."
                  rows={teachers.map(t => (
                    <><TD><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={t.fullName} size={32} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{t.fullName}</div></div></div></TD>
                      <TD><span style={{ color: '#3498db', fontSize: 12 }}>{t.email}</span></TD>
                      <TD><Badge text={t.subject || 'General'} color="#9b59b6" bg="#f3e5f5" /></TD>
                      <TD style={{ fontSize: 12 }}>{t.qualification || '—'}</TD>
                      <TD style={{ fontSize: 12 }}>{t.phone || '—'}</TD>
                      <TD><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Btn small icon="fas fa-comment" color="#3498db" onClick={() => { setSelectedUser(t); setActiveTab('messages'); fetchConversation(t._id); }}>Message</Btn>
                        <Btn small danger icon="fas fa-trash" onClick={() => deleteTeacher(t)} />
                      </div></TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ CLASSES & STREAMS ══ */}
          {activeTab === 'classes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Classes & Streams</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{classes.length} classes registered</p></div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn onClick={() => fetchClasses()} icon="fas fa-sync" color="#3498db" small>Refresh</Btn>
                  <Btn onClick={() => setClassModal(true)} icon="fas fa-plus" color="#1a3a5c">Create Class</Btn>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                {classes.map(c => {
                  const tInfo = c.teacherInfo || (c.teacherId && typeof c.teacherId === 'object' ? c.teacherId : null);
                  const studentCount = getStudentCount(c._id);
                  const classAvg = getClassAverage(c._id);
                  return (
                    <div key={c._id} style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)', borderLeft: `4px solid ${classAvg >= 70 ? '#27ae60' : classAvg >= 50 ? '#f39c12' : '#e74c3c'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, color: '#1a3a5c' }}>{c.grade} {c.className}</h3>
                          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>Year: {c.academicYear} · Capacity: {c.capacity || 40}</p>
                        </div>
                        <Badge text={`${studentCount} students`} color="#3498db" bg="#e3f2fd" />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <Badge text={tInfo ? tInfo.fullName : 'No Teacher'} color={tInfo ? '#27ae60' : '#e74c3c'} bg={tInfo ? '#e8f5e9' : '#fdecea'} />
                        <Badge text={`Avg: ${classAvg}%`} color={classAvg >= 70 ? '#27ae60' : classAvg >= 50 ? '#f39c12' : '#e74c3c'} bg={classAvg >= 70 ? '#e8f5e9' : classAvg >= 50 ? '#fff3e0' : '#fdecea'} />
                      </div>
                      {c.subjects && c.subjects.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                          {c.subjects.map(s => <Badge key={s} text={s} color="#9b59b6" bg="#f3e5f5" size={10} />)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        <Btn small onClick={() => assignTeacher(c)} icon="fas fa-user-plus" color="#f39c12">Assign Teacher</Btn>
                        <Btn small onClick={() => { setSelectedClass(c); setStudentModal(true); }} icon="fas fa-user-graduate" color="#27ae60">Add Student</Btn>
                        <Btn small danger icon="fas fa-trash" onClick={() => deleteClass(c)} />
                      </div>
                    </div>
                  );
                })}
                {classes.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb', gridColumn: '1/-1' }}><i className="fas fa-school" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .3 }} />No classes created yet</div>}
              </div>
            </div>
          )}

          {/* ══ SUBJECTS ══ */}
          {activeTab === 'subjects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Subjects</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{subjects.length} subjects offered</p></div>
                <Btn onClick={() => setSubjectModal(true)} icon="fas fa-plus" color="#1a3a5c">Add Subject</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
                {subjects.map(s => (
                  <div key={s._id} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderTop: `3px solid #9b59b6` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 14, color: '#1a3a5c' }}>{s.name}</h3>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Code: {s.code} · Grade: {s.grade}</div>
                        {s.description && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>{s.description}</p>}
                      </div>
                      <Btn small danger icon="fas fa-trash" onClick={() => deleteSubject(s)} />
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 14, color: '#bbb', gridColumn: '1/-1' }}><i className="fas fa-book" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .3 }} />No subjects added yet</div>}
              </div>
            </div>
          )}

          {/* ══ TIMETABLE ══ */}
          {activeTab === 'timetables' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Timetable Management</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{timetables.length} scheduled sessions</p></div>
                <Btn onClick={() => setTimetableModal(true)} icon="fas fa-plus" color="#1a3a5c">Schedule Session</Btn>
              </div>

              {/* Class Filter */}
              <div style={{ marginBottom: 16 }}>
                <Sel value={classForm.classId || ''} onChange={e => setClassForm(prev => ({ ...prev, classId: e.target.value }))} style={{ maxWidth: 300 }}>
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.grade} {c.className}</option>)}
                </Sel>
              </div>

              {/* Timetable Grid */}
              <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <div className="timetable-grid" style={{ minWidth: 600 }}>
                  <div className="timetable-cell header">Time</div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <div key={day} className="timetable-cell header">{day}</div>
                  ))}
                  {['8:00-8:45', '8:45-9:30', '9:30-10:15', '10:15-11:00', '11:00-11:45', '11:45-12:30', '12:30-13:15', '13:15-14:00'].map((time, idx) => (
                    <React.Fragment key={idx}>
                      <div className="timetable-cell header" style={{ fontSize: 11, background: '#f7f9fb' }}>{time}</div>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => {
                        const entry = timetables.find(t => 
                          t.day === day && 
                          t.period === String(idx + 1) &&
                          (!classForm.classId || t.classId === classForm.classId)
                        );
                        if (idx === 4) {
                          return <div key={day} className="timetable-cell break">☕ Break</div>;
                        }
                        if (idx === 5) {
                          return <div key={day} className="timetable-cell lunch">🍽️ Lunch</div>;
                        }
                        return (
                          <div key={day} className="timetable-cell" style={{ background: entry ? '#e8f5e9' : '#fafafa' }}>
                            {entry ? (
                              <>
                                <div className="timetable-subject">{entry.subject}</div>
                                <div className="timetable-teacher">{entry.teacherName || '—'}</div>
                                <Btn small danger icon="fas fa-trash" style={{ marginTop: 4 }} onClick={() => deleteTimetable(entry)} />
                              </>
                            ) : (
                              <span style={{ color: '#ddd', fontSize: 11 }}>—</span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Students</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{students.length} students enrolled</p></div>
                <Btn onClick={() => setStudentModal(true)} icon="fas fa-user-plus" color="#1a3a5c">Add Student</Btn>
              </div>
              <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table cols={['Student', 'ID', 'Class', 'Parent', 'Contact', 'Actions']} emptyMsg="No students enrolled yet."
                  rows={students.map(s => (
                    <><TD><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={s.fullName} size={30} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{s.fullName}</div></div></div></TD>
                      <TD style={{ fontSize: 12 }}>{s.studentId || '—'}</TD>
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

          {/* ══ PERFORMANCE ══ */}
          {activeTab === 'performance' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Academic Performance</h2></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>
                <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}><i className="fas fa-chart-bar" style={{ marginRight: 7, color: '#3498db' }} />Class Performance</h3>
                  {classPerformance.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', fontSize: 13 }}>No data available</p>}
                  {classPerformance.map((c, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                        <span>{c.className}</span><span style={{ fontWeight: 700, color: c.averageScore >= 70 ? '#27ae60' : c.averageScore >= 50 ? '#f39c12' : '#e74c3c' }}>{c.averageScore}%</span>
                      </div>
                      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(c.averageScore, 100)}%`, background: c.averageScore >= 70 ? '#27ae60' : c.averageScore >= 50 ? '#f39c12' : '#e74c3c', borderRadius: 4, transition: 'width .5s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.studentCount} students</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}><i className="fas fa-trophy" style={{ marginRight: 7, color: '#f39c12' }} />Top Students</h3>
                  <Table cols={['#', 'Student', 'Class', 'Average']} emptyMsg="No data yet."
                    rows={studentPerformance.sort((a, b) => b.averageScore - a.averageScore).slice(0, 10).map((s, i) => (
                      <><TD style={{ textAlign: 'center' }}>{i + 1}</TD>
                        <TD><div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div></TD>
                        <TD style={{ fontSize: 12 }}>{s.class}</TD>
                        <TD><span style={{ fontWeight: 700, color: s.averageScore >= 70 ? '#27ae60' : s.averageScore >= 50 ? '#f39c12' : '#e74c3c' }}>{s.averageScore}%</span></TD></>
                    ))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══ ANNOUNCEMENTS ══ */}
          {activeTab === 'announcements' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>School Announcements</h2></div>
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
                <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1 }}>ACADEMIC ADMINISTRATOR</div>
                <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{localStorage.getItem('userEmail') || 'academic@essa.rw'}</div>
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

      {/* Teacher Modal */}
      <Modal open={teacherModal} onClose={() => setTeacherModal(false)} title="Create Teacher Account" width={520}>
        <Field label="Full Name" required><Inp value={teacherForm.fullName} placeholder="Jean Pierre Habimana" onChange={e => setTeacherForm(p => ({ ...p, fullName: e.target.value }))} /></Field>
        <Field label="Email" required><Inp type="email" value={teacherForm.email} placeholder="teacher@essa.rw" onChange={e => setTeacherForm(p => ({ ...p, email: e.target.value }))} /></Field>
        <Field label="Password"><Inp type="password" value={teacherForm.password} placeholder="Leave blank for teacher123" onChange={e => setTeacherForm(p => ({ ...p, password: e.target.value }))} /></Field>
        <Field label="Subject"><Inp value={teacherForm.subject} placeholder="e.g. Mathematics" onChange={e => setTeacherForm(p => ({ ...p, subject: e.target.value }))} /></Field>
        <Field label="Qualification"><Inp value={teacherForm.qualification} placeholder="e.g. B.Ed, M.Sc" onChange={e => setTeacherForm(p => ({ ...p, qualification: e.target.value }))} /></Field>
        <Field label="Phone"><Inp value={teacherForm.phone} placeholder="+250 788 000 000" onChange={e => setTeacherForm(p => ({ ...p, phone: e.target.value }))} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setTeacherModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createTeacher} icon="fas fa-user-plus" color="#1a3a5c" disabled={saving}>{saving ? 'Creating…' : 'Create Teacher'}</Btn>
        </div>
      </Modal>

      {/* Class Modal */}
      <Modal open={classModal} onClose={() => setClassModal(false)} title="Create Class / Stream" width={540}>
        <Field label="Class Name" required><Inp value={classForm.className} placeholder="e.g. A, B, Science" onChange={e => setClassForm(p => ({ ...p, className: e.target.value }))} /></Field>
        <Field label="Grade" required>
          <Sel value={classForm.grade} onChange={e => setClassForm(p => ({ ...p, grade: e.target.value }))}>
            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </Sel>
        </Field>
        <Field label="Academic Year" required><Inp value={classForm.academicYear} placeholder="2026" onChange={e => setClassForm(p => ({ ...p, academicYear: e.target.value }))} /></Field>
        <Field label="Capacity"><Inp type="number" value={classForm.capacity} onChange={e => setClassForm(p => ({ ...p, capacity: parseInt(e.target.value) }))} /></Field>
        <Field label="Assign Teacher">
          <Sel value={classForm.teacherId} onChange={e => setClassForm(p => ({ ...p, teacherId: e.target.value }))}>
            <option value="">— Optional —</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName} ({t.subject || 'General'})</option>)}
          </Sel>
        </Field>
        <Field label="Subjects">
          <Sel multiple value={classForm.subjects} onChange={e => setClassForm(p => ({ ...p, subjects: Array.from(e.target.selectedOptions, o => o.value) }))} style={{ height: 80 }}>
            {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </Sel>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</div>
        </Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setClassModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createClass} icon="fas fa-school" color="#1a3a5c" disabled={saving}>{saving ? 'Creating…' : 'Create Class'}</Btn>
        </div>
      </Modal>

      {/* Subject Modal */}
      <Modal open={subjectModal} onClose={() => setSubjectModal(false)} title="Add Subject" width={480}>
        <Field label="Subject Name" required><Inp value={subjectForm.name} placeholder="e.g. Mathematics" onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Subject Code" required><Inp value={subjectForm.code} placeholder="e.g. MATH" onChange={e => setSubjectForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></Field>
        <Field label="Grade Level">
          <Sel value={subjectForm.grade} onChange={e => setSubjectForm(p => ({ ...p, grade: e.target.value }))}>
            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </Sel>
        </Field>
        <Field label="Description"><Txt value={subjectForm.description} rows={3} placeholder="Brief description of the subject" onChange={e => setSubjectForm(p => ({ ...p, description: e.target.value }))} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setSubjectModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createSubject} icon="fas fa-book" color="#1a3a5c" disabled={saving}>{saving ? 'Adding…' : 'Add Subject'}</Btn>
        </div>
      </Modal>

      {/* Timetable Modal */}
      <Modal open={timetableModal} onClose={() => setTimetableModal(false)} title="Schedule Class Session" width={520}>
        <Field label="Class" required>
          <Sel value={timetableForm.classId} onChange={e => setTimetableForm(p => ({ ...p, classId: e.target.value }))}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.grade} {c.className}</option>)}
          </Sel>
        </Field>
        <Field label="Day" required>
          <Sel value={timetableForm.day} onChange={e => setTimetableForm(p => ({ ...p, day: e.target.value }))}>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </Sel>
        </Field>
        <Field label="Period" required>
          <Sel value={timetableForm.period} onChange={e => setTimetableForm(p => ({ ...p, period: e.target.value }))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
          </Sel>
        </Field>
        <Field label="Subject" required>
          <Sel value={timetableForm.subject} onChange={e => setTimetableForm(p => ({ ...p, subject: e.target.value }))}>
            <option value="">Select subject…</option>
            {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </Sel>
        </Field>
        <Field label="Teacher" required>
          <Sel value={timetableForm.teacherId} onChange={e => setTimetableForm(p => ({ ...p, teacherId: e.target.value }))}>
            <option value="">Select teacher…</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName} ({t.subject || 'General'})</option>)}
          </Sel>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start Time"><Inp type="time" value={timetableForm.timeFrom} onChange={e => setTimetableForm(p => ({ ...p, timeFrom: e.target.value }))} /></Field>
          <Field label="End Time"><Inp type="time" value={timetableForm.timeTo} onChange={e => setTimetableForm(p => ({ ...p, timeTo: e.target.value }))} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setTimetableModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createTimetable} icon="fas fa-clock" color="#1a3a5c" disabled={saving}>{saving ? 'Scheduling…' : 'Schedule'}</Btn>
        </div>
      </Modal>

      {/* Student Modal */}
      <Modal open={studentModal} onClose={() => setStudentModal(false)} title="Add Student" width={520}>
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
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setStudentModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createStudent} icon="fas fa-user-graduate" color="#1a3a5c" disabled={saving}>{saving ? 'Saving…' : 'Add Student'}</Btn>
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

export default AcademicAdminDashboard;