import React from 'react';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaSchool, 
  FaBook, 
  FaMoneyBillWave, 
  FaGavel,
  FaClipboardList,
  FaCalendarAlt,
  FaCog,
  FaEnvelope,
  FaBell,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ role, activeItem, onItemClick, onLogout }) => {
  const getMenuItems = () => {
    const menus = {
      headmaster: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'admins', label: 'Manage Admins', icon: FaUsers },
        { id: 'performance', label: 'School Performance', icon: FaSchool },
        { id: 'announcements', label: 'Announcements', icon: FaBell },
        { id: 'permissions', label: 'Permission Requests', icon: FaClipboardList },
        { id: 'discipline', label: 'Discipline Oversight', icon: FaGavel },
        { id: 'messaging', label: 'Messaging', icon: FaEnvelope },
        { id: 'settings', label: 'School Settings', icon: FaCog },
      ],
      academic: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'structure', label: 'Academic Structure', icon: FaBook },
        { id: 'teachers', label: 'Teacher Management', icon: FaUsers },
        { id: 'timetable', label: 'Timetable', icon: FaCalendarAlt },
        { id: 'performance', label: 'Academic Performance', icon: FaClipboardList },
        { id: 'announcements', label: 'Announcements', icon: FaBell },
        { id: 'messaging', label: 'Messaging', icon: FaEnvelope },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      secretary: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'admissions', label: 'Admissions', icon: FaUsers },
        { id: 'staff', label: 'Staff Management', icon: FaUserCircle },
        { id: 'events', label: 'Events', icon: FaCalendarAlt },
        { id: 'website', label: 'Website Content', icon: FaSchool },
        { id: 'inquiries', label: 'Inquiries', icon: FaEnvelope },
        { id: 'messaging', label: 'Messaging', icon: FaBell },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      accountant: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'fees', label: 'Fee Management', icon: FaMoneyBillWave },
        { id: 'payments', label: 'Payments', icon: FaClipboardList },
        { id: 'budget', label: 'Budget', icon: FaBook },
        { id: 'payroll', label: 'Payroll', icon: FaUsers },
        { id: 'reports', label: 'Reports', icon: FaCog },
        { id: 'messaging', label: 'Messaging', icon: FaEnvelope },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      discipline: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'cases', label: 'Discipline Cases', icon: FaGavel },
        { id: 'incidents', label: 'Incident Reports', icon: FaClipboardList },
        { id: 'permissions', label: 'Permissions', icon: FaBell },
        { id: 'analytics', label: 'Analytics', icon: FaBook },
        { id: 'policies', label: 'Policies', icon: FaCog },
        { id: 'messaging', label: 'Messaging', icon: FaEnvelope },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      teacher: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'classes', label: 'My Classes', icon: FaBook },
        { id: 'attendance', label: 'Attendance', icon: FaClipboardList },
        { id: 'grades', label: 'Grades', icon: FaUsers },
        { id: 'assignments', label: 'Assignments', icon: FaCalendarAlt },
        { id: 'resources', label: 'Resources', icon: FaSchool },
        { id: 'messaging', label: 'Messaging', icon: FaEnvelope },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      student: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'academic', label: 'Academic Records', icon: FaBook },
        { id: 'attendance', label: 'Attendance', icon: FaClipboardList },
        { id: 'assignments', label: 'Assignments', icon: FaCalendarAlt },
        { id: 'timetable', label: 'Timetable', icon: FaSchool },
        { id: 'fees', label: 'Fee Status', icon: FaMoneyBillWave },
        { id: 'requests', label: 'Requests', icon: FaBell },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
      parent: [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'children', label: 'My Children', icon: FaUsers },
        { id: 'academic', label: 'Academic Progress', icon: FaBook },
        { id: 'attendance', label: 'Attendance', icon: FaClipboardList },
        { id: 'fees', label: 'Fee Management', icon: FaMoneyBillWave },
        { id: 'communication', label: 'Communication', icon: FaEnvelope },
        { id: 'requests', label: 'Requests', icon: FaBell },
        { id: 'profile', label: 'Profile', icon: FaUserCircle },
      ],
    };
    return menus[role] || menus.student;
  };

  return (
    <div className="sidebar" style={{
      width: '280px',
      backgroundColor: '#1a1a2e',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <div className="sidebar-header" style={{
        padding: '25px 20px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#FFD700', margin: 0, fontSize: '24px' }}>
          <FaSchool style={{ marginRight: '10px' }} />
          {role.charAt(0).toUpperCase() + role.slice(1)} Portal
        </h2>
      </div>
      
      <nav>
        {getMenuItems().map(item => (
          <div
            key={item.id}
            onClick={() => onItemClick(item.id)}
            style={{
              padding: '12px 20px',
              margin: '5px 15px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: activeItem === item.id ? '#FFD700' : 'transparent',
              color: activeItem === item.id ? '#1a1a2e' : 'white',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (activeItem !== item.id) {
                e.currentTarget.style.backgroundColor = 'rgba(255,215,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <item.icon size={20} />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div
          onClick={onLogout}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#ff6b6b',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaSignOutAlt size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;