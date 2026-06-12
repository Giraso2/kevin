import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaChalkboard, FaClipboardList, FaBookOpen, FaUpload, FaCalendarAlt, FaUserGraduate, FaEnvelope, FaFlag } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const TeacherPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);

  const handleTakeAttendance = () => {
    Swal.fire({
      title: 'Take Attendance',
      html: `
        <select id="class" class="swal2-select"><option>Grade 12A - Mathematics</option><option>Grade 11B - Physics</option></select>
        <div id="students" style="text-align: left; max-height: 300px; overflow-y: auto; margin-top: 10px;">
          <label><input type="checkbox" value="John"> John Doe (Present)</label><br>
          <label><input type="checkbox" value="Jane"> Jane Smith (Present)</label><br>
          <label><input type="checkbox" value="Mike"> Mike Brown (Present)</label>
        </div>
      `,
      confirmButtonColor: '#FFD700',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Saved', 'Attendance recorded successfully', 'success');
    });
  };

  const handleEnterGrades = () => {
    Swal.fire({
      title: 'Enter Grades',
      html: `
        <select class="swal2-select"><option>Grade 12A - Mathematics - Mid-Term</option><option>Grade 11B - Physics - Quiz</option></select>
        <div style="margin-top: 10px;">
          <label>John Doe: <input type="number" placeholder="Marks" style="width: 100px; margin-left: 10px;"></label><br>
          <label>Jane Smith: <input type="number" placeholder="Marks" style="width: 100px; margin-left: 10px;"></label>
        </div>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Saved', 'Grades entered successfully', 'success');
    });
  };

  const handleUploadResource = () => {
    Swal.fire({
      title: 'Upload Learning Resource',
      html: `
        <input id="title" class="swal2-input" placeholder="Resource Title">
        <select id="class" class="swal2-select"><option>Grade 12</option><option>Grade 11</option></select>
        <input id="file" type="file" class="swal2-file">
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Uploaded', 'Resource uploaded successfully', 'success');
    });
  };

  const handleReportMisconduct = () => {
    Swal.fire({
      title: 'Report Student Misconduct',
      html: `
        <input id="student" class="swal2-input" placeholder="Student Name">
        <select id="behavior" class="swal2-select">
          <option>Disruptive Behavior</option><option>Insubordination</option><option>Cheating</option>
        </select>
        <textarea class="swal2-textarea" placeholder="Details"></textarea>
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Reported', 'Misconduct reported to Discipline Admin', 'success');
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaChalkboard} title="Today's Classes" value="4" color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaClipboardList} title="Pending Grading" value="12" color="#1a1a2e" bgColor="#E8EAF6" />
        <StatCard icon={FaCalendarAlt} title="Upcoming Exams" value="2" color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaUserGraduate} title="Students Present Today" value="85%" color="#FF9800" bgColor="#FFF3E0" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Today's Schedule</h3>
          {['8:00 AM - Grade 12A Mathematics', '10:00 AM - Grade 11B Physics', '1:00 PM - Grade 10C Chemistry'].map(s => (
            <div key={s} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{s}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Recent Messages</h3>
          {['Parent inquiry about grades', 'Announcement: Exam schedule', 'Meeting reminder: Today 3PM'].map(m => (
            <div key={m} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div>
      <h2>My Classes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {[
          {subject: 'Mathematics', class: 'Grade 12A', students: 35, schedule: 'Mon/Wed/Fri 8:00 AM'},
          {subject: 'Physics', class: 'Grade 11B', students: 32, schedule: 'Tue/Thu 10:00 AM'}
        ].map(cls => (
          <div key={cls.subject} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
            <h3 style={{ color: '#FFD700' }}>{cls.subject}</h3>
            <p><strong>Class:</strong> {cls.class}</p>
            <p><strong>Students:</strong> {cls.students}</p>
            <p><strong>Schedule:</strong> {cls.schedule}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleTakeAttendance} style={smallBtn}>Attendance</button>
              <button onClick={handleEnterGrades} style={smallBtn}>Grades</button>
              <button onClick={handleUploadResource} style={smallBtn}>Resources</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const smallBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };
  const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };

  return (
    <>
      <PortalLayout role="teacher" user={{ name: 'Mrs. Sarah Johnson', role: 'Mathematics Teacher' }} activeItem={activeItem} onItemClick={setActiveItem} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'classes' && renderClasses()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Students', 'Parents', 'Administrators']} onSend={() => {}} />
    </>
  );
};

export default TeacherPortal;