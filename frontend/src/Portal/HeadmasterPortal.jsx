import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  FaChartLine, FaUsers, FaUserGraduate, FaChalkboardTeacher, 
  FaDollarSign, FaGavel, FaClipboardList, FaBell, FaEnvelope,
  FaCheckCircle, FaTimesCircle, FaPrint, FaUserPlus, FaUserSlash,
  FaKey, FaShieldAlt, FaSchool, FaBook, FaCalendarAlt
} from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const HeadmasterPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    totalStaff: 120,
    pendingPermissions: 15,
    activeDisciplineCases: 8,
    monthlyRevenue: 250000,
    monthlyExpenses: 180000
  });

  const handleItemClick = (item) => {
    setActiveItem(item);
    if (item === 'messaging') {
      setShowMessaging(true);
    }
  };

  const handleSendMessage = (messageData) => {
    console.log('Message sent:', messageData);
    // API call to send message
  };

  const handleApprovePermission = (permissionId) => {
    Swal.fire({
      title: 'Approve Request?',
      text: 'This action cannot be undone!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FFD700',
      confirmButtonText: 'Approve'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Approved!', 'Permission request approved', 'success');
      }
    });
  };

  const handlePrintPermission = () => {
    Swal.fire({
      title: 'Print Permission Slip',
      text: 'Preparing print...',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  const handleManageAdmin = (action, adminType) => {
    Swal.fire({
      title: `${action} ${adminType}?`,
      input: 'text',
      inputPlaceholder: `Enter ${adminType} email`,
      showCancelButton: true,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire('Success!', `${adminType} ${action.toLowerCase()}d successfully`, 'success');
      }
    });
  };

  const handleDisciplineAction = (student, action) => {
    Swal.fire({
      title: `${action} Student?`,
      text: `This will ${action.toLowerCase()} ${student}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFD700',
      confirmButtonText: `Yes, ${action}`
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Done!', `Student ${action.toLowerCase()}d successfully`, 'success');
      }
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaUserGraduate} title="Total Students" value={stats.totalStudents} color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaChalkboardTeacher} title="Total Teachers" value={stats.totalTeachers} color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaDollarSign} title="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaGavel} title="Active Cases" value={stats.activeDisciplineCases} color="#f44336" bgColor="#FFEBEE" />
        <StatCard icon={FaClipboardList} title="Pending Permissions" value={stats.pendingPermissions} color="#FF9800" bgColor="#FFF3E0" />
        <StatCard icon={FaBell} title="Announcements" value="12" color="#2196F3" bgColor="#E3F2FD" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3 style={{ color: '#1a1a2e', marginBottom: '15px' }}>School Performance Overview</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
            <FaChartLine size={50} color="#FFD700" />
            <span style={{ marginLeft: '10px', color: '#666' }}>Performance Chart Here</span>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3 style={{ color: '#1a1a2e', marginBottom: '15px' }}>Recent Announcements</h3>
          <div>
            {[1,2,3].map(i => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>School Holiday Announcement</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Posted 2 days ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderManageAdmins = () => (
    <div>
      <h2 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Administrator Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {['Academic Admin', 'Secretary Admin', 'Accountant Admin', 'Discipline Admin'].map(admin => (
          <div key={admin} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
            <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>{admin}</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => handleManageAdmin('Add', admin)} style={buttonStyle}>
                <FaUserPlus /> Add
              </button>
              <button onClick={() => handleManageAdmin('Deactivate', admin)} style={{...buttonStyle, backgroundColor: '#f44336'}}>
                <FaUserSlash /> Deactivate
              </button>
              <button onClick={() => handleManageAdmin('Reset Password', admin)} style={{...buttonStyle, backgroundColor: '#FF9800'}}>
                <FaKey /> Reset Password
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div>
      <h2 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Pending Permission Requests</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            <tr>
              <th style={thStyle}>Student</th><th style={thStyle}>Request Type</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              {student: 'John Doe', type: 'Leave Request', date: '2024-01-15', status: 'Pending'},
              {student: 'Jane Smith', type: 'Trip Permission', date: '2024-01-14', status: 'Pending'},
              {student: 'Mike Johnson', type: 'Document Request', date: '2024-01-13', status: 'Pending'}
            ].map((req, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{req.student}</td><td style={tdStyle}>{req.type}</td><td style={tdStyle}>{req.date}</td>
                <td style={tdStyle}><span style={{ color: '#FF9800' }}>{req.status}</span></td>
                <td style={tdStyle}>
                  <button onClick={() => handleApprovePermission(req.student)} style={{...actionBtn, backgroundColor: '#4CAF50'}}><FaCheckCircle /> Approve</button>
                  <button style={{...actionBtn, backgroundColor: '#f44336', marginLeft: '5px'}}><FaTimesCircle /> Reject</button>
                  <button onClick={handlePrintPermission} style={{...actionBtn, backgroundColor: '#2196F3', marginLeft: '5px'}}><FaPrint /> Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDiscipline = () => (
    <div>
      <h2 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Discipline Cases Overview</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            <tr>
              <th style={thStyle}>Student</th><th style={thStyle}>Offense</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              {student: 'Alex Brown', offense: 'Bullying', date: '2024-01-10', status: 'Under Review'},
              {student: 'Sarah Wilson', offense: 'Truancy', date: '2024-01-08', status: 'Warning Issued'},
              {student: 'Tom Davis', offense: 'Cheating', date: '2024-01-05', status: 'Investigation'}
            ].map((case_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{case_.student}</td><td style={tdStyle}>{case_.offense}</td><td style={tdStyle}>{case_.date}</td>
                <td style={tdStyle}><span style={{ color: '#FF9800' }}>{case_.status}</span></td>
                <td style={tdStyle}>
                  <button onClick={() => handleDisciplineAction(case_.student, 'Suspend')} style={{...actionBtn, backgroundColor: '#FF9800'}}>Suspend</button>
                  <button onClick={() => handleDisciplineAction(case_.student, 'Expel')} style={{...actionBtn, backgroundColor: '#f44336', marginLeft: '5px'}}>Expel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeItem) {
      case 'dashboard': return renderDashboard();
      case 'admins': return renderManageAdmins();
      case 'permissions': return renderPermissions();
      case 'discipline': return renderDiscipline();
      default: return renderDashboard();
    }
  };

  const buttonStyle = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#FFD700',
    color: '#1a1a2e',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  const thStyle = { padding: '12px', textAlign: 'left' };
  const tdStyle = { padding: '12px' };
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '12px' };

  return (
    <>
      <PortalLayout
        role="headmaster"
        user={{ name: 'Dr. James Wilson', role: 'Headmaster' }}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onLogout={() => Swal.fire('Logged Out', 'You have been logged out', 'success')}
      >
        {renderContent()}
      </PortalLayout>
      <MessagingModal
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        categories={['Parents', 'Teachers', 'Students', 'Academic Admins', 'Secretary Admins', 'Accountant Admins', 'Discipline Admins']}
        onSend={handleSendMessage}
      />
    </>
  );
};

export default HeadmasterPortal;