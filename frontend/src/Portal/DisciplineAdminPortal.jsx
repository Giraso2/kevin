import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaGavel, FaClipboardList, FaExclamationTriangle, FaBell, FaCheckCircle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const DisciplineAdminPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);

  const handleReportIncident = () => {
    Swal.fire({
      title: 'Report Incident',
      html: `
        <input id="student" class="swal2-input" placeholder="Student Name">
        <select id="offense" class="swal2-select">
          <option>Bullying</option><option>Truancy</option><option>Cheating</option><option>Insubordination</option>
        </select>
        <textarea id="details" class="swal2-textarea" placeholder="Incident Details"></textarea>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Reported', 'Incident reported successfully', 'success');
    });
  };

  const handleTakeAction = (student, action) => {
    Swal.fire({
      title: `${action} Student?`,
      text: `This will ${action.toLowerCase()} ${student}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Action Taken', `${student} has been ${action.toLowerCase()}ed`, 'success');
    });
  };

  const handleApprovePermission = (request) => {
    Swal.fire({
      title: 'Approve Request?',
      text: `Approve ${request}?`,
      showCancelButton: true,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Approved', 'Permission request approved', 'success');
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaGavel} title="Active Cases" value="8" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaClipboardList} title="Pending Investigations" value="3" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaExclamationTriangle} title="Repeat Offenders" value="5" color="#f44336" bgColor="#FFEBEE" />
        <StatCard icon={FaBell} title="Permission Requests" value="12" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Recent Cases</h3>
          {['John Doe - Bullying - Under Review', 'Jane Smith - Truancy - Warning Issued', 'Mike Brown - Cheating - Investigation'].map(c => (
            <div key={c} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{c}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Pending Permission Requests</h3>
          {['Leave Request - Emma Watson', 'Trip Permission - Liam Brown', 'Document Request - Olivia Davis'].map(r => (
            <div key={r} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>{r}</span>
              <div><button onClick={() => handleApprovePermission(r)} style={{...actionBtn, backgroundColor: '#4CAF50'}}><FaCheckCircle /></button><button style={{...actionBtn, backgroundColor: '#f44336', marginLeft: '5px'}}><FaTimesCircle /></button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCases = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Discipline Cases</h2>
        <button onClick={handleReportIncident} style={buttonStyle}><FaFileAlt /> Report Incident</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            <tr><th style={thStyle}>Student</th><th style={thStyle}>Offense</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th></tr>
          </thead>
          <tbody>
            {[
              {student: 'Alex Turner', offense: 'Bullying', date: '2024-01-10', status: 'Under Review'},
              {student: 'Sarah Connor', offense: 'Truancy (3x)', date: '2024-01-08', status: 'Warning Issued'},
              {student: 'Tom Hardy', offense: 'Cheating', date: '2024-01-05', status: 'Investigation'}
            ].map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{c.student}</td><td style={tdStyle}>{c.offense}</td><td style={tdStyle}>{c.date}</td>
                <td style={tdStyle}><span style={{ color: '#FF9800' }}>{c.status}</span></td>
                <td style={tdStyle}>
                  <button onClick={() => handleTakeAction(c.student, 'Warn')} style={{...actionBtn, backgroundColor: '#FF9800'}}>Warn</button>
                  <button onClick={() => handleTakeAction(c.student, 'Suspend')} style={{...actionBtn, backgroundColor: '#f44336', marginLeft: '5px'}}>Suspend</button>
                  <button onClick={() => handleTakeAction(c.student, 'Expel')} style={{...actionBtn, backgroundColor: '#9C27B0', marginLeft: '5px'}}>Expel</button>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
  const thStyle = { padding: '12px', textAlign: 'left' };
  const tdStyle = { padding: '12px' };
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '12px' };

  return (
    <>
      <PortalLayout role="discipline" user={{ name: 'Mr. David Miller', role: 'Discipline Admin' }} activeItem={activeItem} onItemClick={setActiveItem} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'cases' && renderCases()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Parents', 'Teachers', 'Students', 'Administrators']} onSend={() => {}} />
    </>
  );
};

export default DisciplineAdminPortal;