import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaBook, FaCalendarAlt, FaClipboardList, FaMoneyBillWave, FaFileAlt, FaEnvelope, FaDownload, FaCheckCircle } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const StudentPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleSubmitAssignment = () => {
    Swal.fire({
      title: 'Submit Assignment',
      html: `
        <select class="swal2-select"><option>Mathematics Assignment 1</option><option>Physics Lab Report</option></select>
        <input type="file" class="swal2-file">
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Submitted!', 'Assignment submitted successfully', 'success');
    });
  };

  const handleRequestLeave = () => {
    Swal.fire({
      title: 'Request Leave',
      html: `
        <input id="fromDate" class="swal2-input" placeholder="From Date" type="date">
        <input id="toDate" class="swal2-input" placeholder="To Date" type="date">
        <textarea class="swal2-textarea" placeholder="Reason for leave"></textarea>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Request Sent', 'Leave request submitted for approval', 'success');
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaCalendarAlt} title="Today's Classes" value="4" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaBook} title="Upcoming Assignments" value="3" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaCalendarAlt} title="Next Exam" value="5 days" color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaClipboardList} title="Attendance" value="92%" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Today's Timetable</h3>
          {['8:00 AM - Mathematics', '9:00 AM - Physics', '10:00 AM - Chemistry', '11:00 AM - English'].map(c => (
            <div key={c} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{c}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Pending Assignments</h3>
          {['Math Assignment - Due Jan 20', 'Physics Lab - Due Jan 22', 'English Essay - Due Jan 25'].map(a => (
            <div key={a} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>{a}</span>
              <button onClick={handleSubmitAssignment} style={actionBtn}>Submit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div>
      <h2>Academic Records</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div><h4>Term 1 Results</h4><table style={{ width: '100%' }}><tbody><tr><td>Mathematics</td><td>A</td></tr><tr><td>Physics</td><td>B+</td></tr><tr><td>Chemistry</td><td>A-</td></tr></tbody></table></div>
          <div><h4>Term 2 Results</h4><table style={{ width: '100%' }}><tbody><tr><td>Mathematics</td><td>A</td></tr><tr><td>Physics</td><td>A-</td></tr><tr><td>Chemistry</td><td>B+</td></tr></tbody></table></div>
        </div>
        <div style={{ marginTop: '20px' }}><button style={buttonStyle}><FaDownload /> Download Report Card</button></div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div>
      <h2>Request Services</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div onClick={handleRequestLeave} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaFileAlt size={30} color="#FFD700" /><h4>Leave Request</h4><p>Request absence from school</p>
        </div>
        <div onClick={() => Swal.fire('Document Request', 'Request recommendation letter', 'info')} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaCheckCircle size={30} color="#FFD700" /><h4>Document Request</h4><p>Request transcripts or certificates</p>
        </div>
        <div onClick={() => Swal.fire('Counseling', 'Request counseling session', 'info')} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <FaEnvelope size={30} color="#FFD700" /><h4>Counseling Request</h4><p>Schedule a counseling session</p>
        </div>
      </div>
    </div>
  );

  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontWeight: 'bold' };
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };

  return (
    <PortalLayout role="student" user={{ name: 'John Doe', role: 'Grade 12 Student', studentId: 'STU-2024-001' }} activeItem={activeItem} onItemClick={setActiveItem} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
      {activeItem === 'dashboard' && renderDashboard()}
      {activeItem === 'academic' && renderAcademic()}
      {activeItem === 'requests' && renderRequests()}
    </PortalLayout>
  );
};

export default StudentPortal;