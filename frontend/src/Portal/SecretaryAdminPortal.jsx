import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaUserPlus, FaUsers, FaCalendarAlt, FaNewspaper, FaPhotoVideo, FaEnvelope, FaUserCheck } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const SecretaryAdminPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);

  const handleRegisterStudent = () => {
    Swal.fire({
      title: 'Student Registration',
      html: `
        <input id="name" class="swal2-input" placeholder="Full Name">
        <input id="parentEmail" class="swal2-input" placeholder="Parent Email">
        <select id="class" class="swal2-select">
          <option>Select Class</option>
          <option>Grade 8</option><option>Grade 9</option><option>Grade 10</option>
        </select>
      `,
      confirmButtonColor: '#FFD700',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Student Registered!',
          html: 'Student ID: <strong>STU-2024-001</strong><br>Login credentials sent to parent email',
          icon: 'success',
          confirmButtonColor: '#FFD700'
        });
      }
    });
  };

  const handleManageStaff = () => {
    Swal.fire({
      title: 'Manage Staff Record',
      html: `
        <input id="staffName" class="swal2-input" placeholder="Staff Name">
        <select id="role" class="swal2-select">
          <option>Teacher</option><option>Administrative Staff</option><option>Support Staff</option>
        </select>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'Staff record updated', 'success');
      }
    });
  };

  const handlePublishNews = () => {
    Swal.fire({
      title: 'Publish News',
      html: `
        <input id="title" class="swal2-input" placeholder="News Title">
        <textarea id="content" class="swal2-textarea" placeholder="News Content"></textarea>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Published!', 'News published to website', 'success');
      }
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaUserPlus} title="New Admissions (Jan)" value="45" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaEnvelope} title="Pending Inquiries" value="12" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaCalendarAlt} title="Upcoming Events" value="5" color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaUsers} title="Staff Present Today" value="92" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Recent Inquiries</h3>
          {['Admission inquiry - Parent', 'Fee structure - Parent', 'Transfer certificate - Student'].map(inq => (
            <div key={inq} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{inq}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Upcoming Events</h3>
          {['Sports Day - Jan 30', 'Parent-Teacher Meeting - Feb 5', 'Annual Day - Feb 15'].map(event => (
            <div key={event} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{event}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmissions = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Student Admissions</h2>
        <button onClick={handleRegisterStudent} style={buttonStyle}><FaUserPlus /> Register Student</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            <tr><th style={thStyle}>Student Name</th><th style={thStyle}>Class</th><th style={thStyle}>Parent Email</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
          </thead>
          <tbody>
            {['Emma Watson', 'Liam Brown', 'Olivia Davis'].map((student, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{student}</td><td style={tdStyle}>Grade {8+i}</td><td style={tdStyle}>parent{i}@email.com</td>
                <td style={tdStyle}><span style={{ color: '#4CAF50' }}>Active</span></td>
                <td style={tdStyle}><button style={actionBtn}><FaUserCheck /> Link Parent</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWebsite = () => (
    <div>
      <h2>Website Content Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div onClick={handlePublishNews} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaNewspaper size={40} color="#FFD700" /><h4>News Management</h4><p style={{ fontSize: '12px', color: '#666' }}>Publish and manage news</p>
        </div>
        <div onClick={() => Swal.fire('Events', 'Manage events', 'info')} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaCalendarAlt size={40} color="#FFD700" /><h4>Events Calendar</h4><p style={{ fontSize: '12px', color: '#666' }}>Manage school events</p>
        </div>
        <div onClick={() => Swal.fire('Gallery', 'Manage gallery', 'info')} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaPhotoVideo size={40} color="#FFD700" /><h4>Photo Gallery</h4><p style={{ fontSize: '12px', color: '#666' }}>Upload and manage photos</p>
        </div>
      </div>
    </div>
  );

  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
  const thStyle = { padding: '12px', textAlign: 'left' };
  const tdStyle = { padding: '12px' };
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };

  return (
    <>
      <PortalLayout role="secretary" user={{ name: 'Ms. Lisa Wong', role: 'Secretary Admin' }} activeItem={activeItem} onItemClick={handleItemClick} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'admissions' && renderAdmissions()}
        {activeItem === 'website' && renderWebsite()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Students', 'Parents', 'Teachers', 'Administrators']} onSend={(d) => console.log(d)} />
    </>
  );
};

export default SecretaryAdminPortal;