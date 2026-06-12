import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaBook, FaChalkboardTeacher, FaCalendarAlt, FaChartLine, FaPlus, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const AcademicAdminPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);

  const handleItemClick = (item) => {
    setActiveItem(item);
    if (item === 'messaging') setShowMessaging(true);
  };

  const handleSendMessage = (data) => {
    console.log('Message sent:', data);
  };

  const handleCreateClass = () => {
    Swal.fire({
      title: 'Create New Class',
      html: `
        <input id="className" class="swal2-input" placeholder="Class Name">
        <select id="stream" class="swal2-select">
          <option value="">Select Stream</option>
          <option>Science</option><option>Commerce</option><option>Arts</option>
        </select>
      `,
      confirmButtonColor: '#FFD700',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success!', 'Class created successfully', 'success');
      }
    });
  };

  const handleAssignTeacher = () => {
    Swal.fire({
      title: 'Assign Teacher',
      html: `
        <select id="teacher" class="swal2-select">
          <option>Select Teacher</option>
          <option>Mr. Smith</option><option>Mrs. Johnson</option>
        </select>
        <select id="subject" class="swal2-select">
          <option>Select Subject</option>
          <option>Mathematics</option><option>Physics</option>
        </select>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Assigned!', 'Teacher assigned successfully', 'success');
      }
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaBook} title="Total Classes" value="12" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaBook} title="Total Subjects" value="48" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaChalkboardTeacher} title="Teachers" value="85" color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaCalendarAlt} title="Upcoming Exams" value="3" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Top Performing Classes</h3>
          {['Grade 12A - 92%', 'Grade 11B - 88%', 'Grade 10C - 85%'].map((cls, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{cls}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Upcoming Exams</h3>
          {['Mid-Term Exams - Jan 25', 'Practical Exams - Jan 28', 'Final Exams - Feb 10'].map((exam, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{exam}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStructure = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Academic Structure</h2>
        <button onClick={handleCreateClass} style={buttonStyle}><FaPlus /> Create Class</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
        {['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(grade => (
          <div key={grade} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#1a1a2e', marginBottom: '10px' }}>{grade}</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Science', 'Commerce', 'Arts'].map(stream => (
                <span key={stream} style={{ backgroundColor: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' }}>{stream}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div>
      <h2>Teacher Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {['Mr. John Smith - Mathematics', 'Mrs. Sarah Johnson - Physics', 'Dr. Michael Brown - Chemistry'].map(teacher => (
          <div key={teacher} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{teacher}</span>
            <button onClick={handleAssignTeacher} style={{...buttonStyle, padding: '5px 10px', fontSize: '12px'}}><FaUserPlus /> Assign</button>
          </div>
        ))}
      </div>
    </div>
  );

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#FFD700',
    color: '#1a1a2e',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 'bold'
  };

  return (
    <>
      <PortalLayout role="academic" user={{ name: 'Dr. Emily Chen', role: 'Academic Admin' }} activeItem={activeItem} onItemClick={handleItemClick} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'structure' && renderStructure()}
        {activeItem === 'teachers' && renderTeachers()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Students', 'Teachers', 'Parents', 'Administrators']} onSend={handleSendMessage} />
    </>
  );
};

export default AcademicAdminPortal;