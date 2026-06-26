import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
const getToken = () => localStorage.getItem('portalToken');
const authHeaders = () => ({ 
  'Content-Type': 'application/json', 
  'Authorization': `Bearer ${getToken()}` 
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' }) : '';
const fmtAmt = (n) => typeof n === 'number' ? n.toLocaleString() + ' RWF' : '— RWF';

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

const StatCard = ({ icon, label, value, sub, accent = '#3498db', bg = '#e3f2fd', onClick }) => (
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
const ParentDashboard = () => {
  const navigate = useNavigate();
  const msgEndRef = useRef(null);
  
  // layout
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // children data
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);
  
  // messaging
  const [msgUsers, setMsgUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [msgTab, setMsgTab] = useState('inbox');
  const [unread, setUnread] = useState(0);
  const [msgSearch, setMsgSearch] = useState('');
  const [socket, setSocket] = useState(null);
  
  const userName = localStorage.getItem('userName') || 'Parent';
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
    return () => sock.disconnect();
  }, [userId]);

  // auth + load
  useEffect(() => {
    const token = getToken(); const role = localStorage.getItem('userRole');
    if (!token || role !== 'parent') { navigate('/portal/parent-login'); return; }
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
    fetchChildren(),
    fetchMsgUsers(),
    fetchUnread()
  ]).finally(() => setLoading(false));

  const fetchChildren = () => {
    api('/parent/students')
      .then(d => {
        setChildren(Array.isArray(d) ? d : []);
        if (d.length > 0 && !selectedChild) {
          setSelectedChild(d[0]);
          fetchChildData(d[0]._id);
        } else if (d.length === 0) {
          setLoading(false);
        }
      })
      .catch(() => {
        setChildren([]);
        setLoading(false);
      });
  };

  const fetchChildData = (childId) => {
    api(`/parent/child/${childId}/dashboard`)
      .then(d => setChildData(d))
      .catch(() => setChildData(null));
  };

  const fetchMsgUsers = () => api('/messages/users').then(d => {
    const all = Object.values(d.users || d || {}).flat();
    setMsgUsers(all);
  }).catch(() => {});
  
  const fetchUnread = () => api('/messages/unread-count').then(d => setUnread(d.count || 0)).catch(() => {});
  const fetchConversation = (uid) => api(`/messages/conversation/${uid}`).then(d => setMessages(Array.isArray(d.messages) ? d.messages : [])).catch(() => {});

  // ─── ACTIONS ──────────────────────────────────────────────────────
  const handleChildChange = (child) => {
    setSelectedChild(child);
    fetchChildData(child._id);
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedUser) return;
    try {
      const res = await api('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: selectedUser._id,
          subject: 'Direct Message',
          content: msgText.trim()
        })
      });
      setMessages(prev => [...prev, res.message]);
      setMsgText('');
      if (socket) socket.emit('sendMessage', { receiverId: selectedUser._id, ...res.message });
      fetchUnread();
    } catch {}
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/parent-login');
  };

  const handleLinkStudent = async () => {
    const { value: studentId } = await Swal.fire({
      title: 'Link Student',
      html: `
        <p style="text-align:left;font-size:13px;color:#666;margin-bottom:10px;">
          Enter your child's Student ID to link their account.
        </p>
        <input type="text" id="studentId" class="swal2-input" placeholder="e.g. STU20260001">
      `,
      confirmButtonText: '🔗 Link Student',
      confirmButtonColor: '#00bcd4',
      showCancelButton: true,
      preConfirm: () => {
        const id = document.getElementById('studentId').value.toUpperCase();
        if (!id) {
          Swal.showValidationMessage('Please enter a Student ID');
          return false;
        }
        return id;
      }
    });

    if (studentId) {
      try {
        const result = await api('/parent/link-student', {
          method: 'POST',
          body: JSON.stringify({ studentId })
        });
        if (result.success) {
          Swal.fire('✅ Student Linked!', `Successfully linked ${result.student.fullName}`, 'success');
          fetchChildren();
        }
      } catch (e) {
        Swal.fire('Error', e.message || 'Failed to link student', 'error');
      }
    }
  };

  // ─── Menu Items ──────────────────────────────────────────────────
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'academics', label: 'Academics', icon: 'fas fa-graduation-cap' },
    { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
    { id: 'fees', label: 'Fees & Payments', icon: 'fas fa-money-bill-wave' },
    { id: 'assignments', label: 'Assignments', icon: 'fas fa-tasks' },
    { id: 'timetable', label: 'Timetable', icon: 'fas fa-clock' },
    { id: 'messages', label: 'Messages', icon: 'fas fa-comments', badge: unread },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-circle' },
  ];

  const filteredUsers = msgUsers.filter(u =>
    u.fullName?.toLowerCase().includes(msgSearch.toLowerCase()) || u.role?.toLowerCase().includes(msgSearch.toLowerCase())
  );

  const sideW = isMobile ? 0 : sidebarOpen ? 260 : 72;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg,#0d2b42,#1a3a5c)', color: 'white', gap: 20 }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#ffc107', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <p style={{ margin: 0, fontSize: 16 }}>Loading Dashboard…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#0d2b42,#1a3a5c)', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>👨‍👩‍👧‍👦</div>
          <h2 style={{ margin: 0, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>No Students Linked</h2>
          <p style={{ color: '#888', margin: '12px 0 24px' }}>You haven't linked any students to your account yet.</p>
          <Btn onClick={handleLinkStudent} icon="fas fa-child" color="#00bcd4" style={{ padding: '12px 24px', fontSize: 16 }}>
            Link Student
          </Btn>
          <div style={{ marginTop: 16 }}>
            <Btn onClick={handleLogout} color="#e74c3c" small>Logout</Btn>
          </div>
        </div>
      </div>
    );
  }

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

      {isMobile && mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998 }} />}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999, width: isMobile ? (mobileOpen ? 260 : 0) : sideW, background: 'linear-gradient(180deg,#0d1f33 0%,#1a3a5c 100%)', color: 'white', display: 'flex', flexDirection: 'column', transition: 'width .3s ease', overflow: 'hidden', boxShadow: '3px 0 20px rgba(0,0,0,.18)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, background: '#ffc107', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-users" style={{ fontSize: 16, color: '#1a3a5c' }} />
          </div>
          {(sidebarOpen || isMobile) && <div><div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600 }}>LYMAR Portal</div><div style={{ fontSize: 10, opacity: .6, letterSpacing: 1 }}>PARENT</div></div>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}><i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} /></button>}
        </div>

        {/* Child Selector */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={userName} size={36} bg='rgba(255,193,7,.2)' color='#ffc107' />
            {(sidebarOpen || isMobile) && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#ffc107' }}>Parent</div>
              </div>
            )}
          </div>
        </div>

        {/* Child Switcher */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Sel 
            value={selectedChild?._id || ''} 
            onChange={(e) => {
              const child = children.find(c => c._id === e.target.value);
              if (child) handleChildChange(child);
            }}
            style={{ background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.15)' }}
          >
            {children.map(c => (
              <option key={c._id} value={c._id} style={{ color: '#333' }}>
                {c.fullName} ({c.classId?.grade || ''} {c.classId?.className || ''})
              </option>
            ))}
          </Sel>
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

        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleLinkStudent} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'rgba(0,188,212,.2)', border: '1px solid rgba(0,188,212,.3)', borderRadius: 9, color: '#80deea', cursor: 'pointer', fontSize: 13 }}>
            <i className="fas fa-child" />{(sidebarOpen || isMobile) && 'Link Student'}
          </button>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'rgba(231,76,60,.2)', border: '1px solid rgba(231,76,60,.3)', borderRadius: 9, color: '#ff8a80', cursor: 'pointer', fontSize: 13 }}>
            <i className="fas fa-sign-out-alt" />{(sidebarOpen || isMobile) && 'Logout'}
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
              <div style={{ fontSize: 10, color: '#aaa', letterSpacing: .5 }}>LYMAR Portal</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>{menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedChild && (
              <Badge text={selectedChild.fullName} color="#1a3a5c" bg="#e8f0fb" />
            )}
            {unread > 0 && <button onClick={() => setActiveTab('messages')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 17 }}>
              <i className="fas fa-bell" />
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#e74c3c', color: 'white', borderRadius: '50%', fontSize: 9, width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>
            </button>}
            <Avatar name={userName} size={32} />
            <div className="hide-mobile">
              <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{userName}</div>
              <div style={{ fontSize: 10, color: '#ffc107' }}>PARENT</div>
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
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Georgia, serif', marginBottom: 5 }}>
                    Welcome, {userName.split(' ')[0]}! 👨‍👩‍👧‍👦
                  </div>
                  <div style={{ fontSize: 12, opacity: .75 }}>
                    {selectedChild?.fullName} · {selectedChild?.classId?.grade} {selectedChild?.classId?.className}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn onClick={handleLinkStudent} icon="fas fa-child" color="#ffc107" textColor="#1a3a5c">Link Student</Btn>
                </div>
              </div>

              {childData && (
                <div className="stats-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 20 }}>
                  <StatCard icon="fas fa-chart-line" label="Average Grade" value={`${childData.stats?.avgGrade || 0}%`} sub={childData.stats?.avgGrade >= 70 ? 'Excellent' : childData.stats?.avgGrade >= 50 ? 'Good' : 'Needs Improvement'} accent="#27ae60" bg="#e8f5e9" />
                  <StatCard icon="fas fa-calendar-check" label="Attendance" value={`${childData.stats?.attendanceRate || 0}%`} sub={childData.stats?.attendanceRate >= 90 ? 'Excellent' : childData.stats?.attendanceRate >= 75 ? 'Good' : 'Needs Improvement'} accent="#f39c12" bg="#fff3e0" />
                  <StatCard icon="fas fa-tasks" label="Assignments" value={childData.stats?.assignmentsPending || 0} sub={`${childData.stats?.assignmentsSubmitted || 0} submitted`} accent="#9b59b6" bg="#f3e5f5" />
                  <StatCard icon="fas fa-money-bill-wave" label="Fee Balance" value={fmtAmt(childData.stats?.balance || 0)} sub={`Paid: ${fmtAmt(childData.stats?.paidFees || 0)}`} accent={childData.stats?.balance > 0 ? '#e74c3c' : '#27ae60'} bg={childData.stats?.balance > 0 ? '#fdecea' : '#e8f5e9'} />
                </div>
              )}

              {/* Recent Grades & Attendance */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>
                <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}>
                    <i className="fas fa-chart-simple" style={{ marginRight: 7, color: '#27ae60' }} />Recent Grades
                  </h3>
                  {childData?.recentGrades?.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', padding: 20 }}>No grades available</p>}
                  {childData?.recentGrades?.map((g, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: 13 }}>{g.subject}</span>
                      <span style={{ fontWeight: 700, color: g.score >= 70 ? '#27ae60' : g.score >= 50 ? '#f39c12' : '#e74c3c' }}>{g.score}% ({g.grade})</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}>
                    <i className="fas fa-calendar-check" style={{ marginRight: 7, color: '#f39c12' }} />Recent Attendance
                  </h3>
                  {childData?.recentAttendance?.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', padding: 20 }}>No attendance records</p>}
                  {childData?.recentAttendance?.slice(0, 7).map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: 12 }}>{fmt(a.date)}</span>
                      <Badge text={a.status} color={a.status === 'present' ? '#27ae60' : a.status === 'late' ? '#f39c12' : '#e74c3c'} bg={a.status === 'present' ? '#e8f5e9' : a.status === 'late' ? '#fff3e0' : '#fdecea'} size={10} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ ACADEMICS ══ */}
          {activeTab === 'academics' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Academic Performance</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{selectedChild?.fullName} - {selectedChild?.classId?.grade} {selectedChild?.classId?.className}</p>
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <Table cols={['Subject', 'Score', 'Grade', 'Term', 'Feedback']} emptyMsg="No grades available"
                  rows={childData?.recentGrades?.map(g => (
                    <><TD style={{ fontWeight: 600 }}>{g.subject}</TD>
                      <TD><span style={{ color: g.score >= 70 ? '#27ae60' : g.score >= 50 ? '#f39c12' : '#e74c3c' }}>{g.score}%</span></TD>
                      <TD><Badge text={g.grade} color={g.score >= 70 ? '#27ae60' : g.score >= 50 ? '#f39c12' : '#e74c3c'} bg={g.score >= 70 ? '#e8f5e9' : g.score >= 50 ? '#fff3e0' : '#fdecea'} /></TD>
                      <TD>{g.term || '—'}</TD>
                      <TD style={{ fontSize: 12, color: '#666' }}>{g.feedback || '—'}</TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ ATTENDANCE ══ */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Attendance Records</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>
                  Overall: {childData?.stats?.attendanceRate || 0}% · {selectedChild?.fullName}
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <Table cols={['Date', 'Status', 'Remarks']} emptyMsg="No attendance records"
                  rows={childData?.recentAttendance?.map(a => (
                    <><TD style={{ fontSize: 12, color: '#aaa' }}>{fmt(a.date)}</TD>
                      <TD><Badge text={a.status} color={a.status === 'present' ? '#27ae60' : a.status === 'late' ? '#f39c12' : '#e74c3c'} bg={a.status === 'present' ? '#e8f5e9' : a.status === 'late' ? '#fff3e0' : '#fdecea'} /></TD>
                      <TD style={{ fontSize: 12, color: '#666' }}>{a.remarks || '—'}</TD></>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ FEES ══ */}
          {activeTab === 'fees' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: '#1a3a5c', fontFamily: 'Georgia, serif' }}>Fee & Payments</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>{selectedChild?.fullName}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 18 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Total Fees</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a3a5c' }}>{fmtAmt(childData?.stats?.totalFees || 0)}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Amount Paid</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#27ae60' }}>{fmtAmt(childData?.stats?.paidFees || 0)}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Balance Due</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: (childData?.stats?.balance || 0) > 0 ? '#e74c3c' : '#27ae60' }}>
                    {fmtAmt(childData?.stats?.balance || 0)}
                  </div>
                </div>
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
                <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1 }}>PARENT</div>
                <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{localStorage.getItem('userEmail') || 'parent@essa.rw'}</div>
              </div>

              {/* Linked Students */}
              <div style={{ background: 'white', borderRadius: 14, padding: 18, marginBottom: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#1a3a5c', fontWeight: 600 }}>
                  <i className="fas fa-child" style={{ marginRight: 7, color: '#ffc107' }} />Linked Students
                </h3>
                {children.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.fullName}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{c.studentId} · {c.classId?.grade} {c.classId?.className}</div>
                    </div>
                    <Badge text="Linked" color="#27ae60" bg="#e8f5e9" />
                  </div>
                ))}
                <Btn onClick={handleLinkStudent} icon="fas fa-plus" color="#00bcd4" small style={{ marginTop: 10 }}>Link Another Student</Btn>
              </div>

              {/* Change Password */}
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
    </div>
  );
};

export default ParentDashboard;