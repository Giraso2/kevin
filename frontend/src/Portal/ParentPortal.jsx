import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaUsers, FaBook, FaClipboardList, FaMoneyBillWave, FaEnvelope, FaUserGraduate, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const ParentPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedChild, setSelectedChild] = useState('Emma Watson');

  const handlePayFees = () => {
    Swal.fire({
      title: 'Pay School Fees',
      html: `
        <select class="swal2-select"><option>$500 - Term 1 Fees</option><option>$250 - Activity Fees</option></select>
        <select class="swal2-select"><option>Credit Card</option><option>Mobile Money</option><option>Bank Transfer</option></select>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Payment Initiated', 'Redirecting to payment gateway...', 'success');
    });
  };

  const handleScheduleMeeting = () => {
    Swal.fire({
      title: 'Book Parent-Teacher Meeting',
      html: `
        <select class="swal2-select"><option>Mr. Smith - Mathematics</option><option>Mrs. Johnson - English</option></select>
        <input type="datetime-local" class="swal2-input">
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Booked', 'Meeting scheduled successfully', 'success');
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} style={selectStyle}>
          <option>Emma Watson - Grade 10A</option><option>Liam Watson - Grade 8B</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaUserGraduate} title="Attendance" value="94%" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaBook} title="Average Grade" value="A-" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaMoneyBillWave} title="Fee Balance" value="$450" color="#f44336" bgColor="#FFEBEE" />
        <StatCard icon={FaEnvelope} title="Messages" value="3" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Recent Grades</h3>
          {['Mathematics - A (92%)', 'Physics - B+ (85%)', 'Chemistry - A- (88%)', 'English - A (90%)'].map(g => <div key={g} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{g}</div>)}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Upcoming Events</h3>
          {['Parent-Teacher Meeting - Feb 5', 'Sports Day - Jan 30', 'Exam Week - Feb 10'].map(e => <div key={e} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{e}</div>)}
          <button onClick={handleScheduleMeeting} style={{...buttonStyle, marginTop: '10px', width: '100%'}}>Book Meeting</button>
        </div>
      </div>
    </div>
  );

  const renderFees = () => (
    <div>
      <h2>Fee Management</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Term</th><th style={thStyle}>Total Fees</th><th style={thStyle}>Paid</th><th style={thStyle}>Balance</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
          <tbody>
            {[
              {term: 'Term 1 2024', total: 2500, paid: 2000, balance: 500},
              {term: 'Term 2 2024', total: 2500, paid: 0, balance: 2500}
            ].map(f => (
              <tr key={f.term} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{f.term}</td><td style={tdStyle}>${f.total}</td><td style={tdStyle}>${f.paid}</td>
                <td style={tdStyle} style={{ color: f.balance > 0 ? '#f44336' : '#4CAF50' }}>${f.balance}</td>
                <td style={tdStyle}><span style={{ color: f.balance > 0 ? '#FF9800' : '#4CAF50' }}>{f.balance > 0 ? 'Pending' : 'Paid'}</span></td>
                <td style={tdStyle}>{f.balance > 0 && <button onClick={handlePayFees} style={actionBtn}>Pay Now</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChildren = () => (
    <div>
      <h2>My Children</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {[
          {name: 'Emma Watson', grade: 'Grade 10A', teacher: 'Mrs. Johnson', attendance: 94, avgGrade: 'A-'},
          {name: 'Liam Watson', grade: 'Grade 8B', teacher: 'Mr. Smith', attendance: 91, avgGrade: 'B+'}
        ].map(child => (
          <div key={child.name} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
            <h3 style={{ color: '#FFD700' }}>{child.name}</h3>
            <p><strong>Class:</strong> {child.grade}</p><p><strong>Class Teacher:</strong> {child.teacher}</p>
            <p><strong>Attendance:</strong> {child.attendance}%</p><p><strong>Average Grade:</strong> {child.avgGrade}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setSelectedChild(child.name)} style={smallBtn}>View Details</button>
              <button onClick={handleScheduleMeeting} style={smallBtn}>Book Meeting</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' };
  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontWeight: 'bold' };
  const smallBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };
  const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' };
  const tdStyle = { padding: '12px' };
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };

  return (
    <>
      <PortalLayout role="parent" user={{ name: 'Mr. Robert Watson', role: 'Parent' }} activeItem={activeItem} onItemClick={setActiveItem} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'children' && renderChildren()}
        {activeItem === 'fees' && renderFees()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Teachers', 'Administrators', 'Academic Admin', 'Discipline Admin']} onSend={() => {}} />
    </>
  );
};

export default ParentPortal;