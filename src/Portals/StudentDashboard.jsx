import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Student data
  const [grades, setGrades] = useState([
    { subject: 'Mathematics', score: 85, grade: 'A', term: 'Term 1', teacher: 'Mr. Eric', color: '#3498db' },
    { subject: 'English', score: 78, grade: 'B+', term: 'Term 1', teacher: 'Mme. Chantal', color: '#2ecc71' },
    { subject: 'Physics', score: 92, grade: 'A', term: 'Term 1', teacher: 'Dr. Claude', color: '#e74c3c' },
    { subject: 'Chemistry', score: 88, grade: 'A-', term: 'Term 1', teacher: 'Mme. Jeanne', color: '#9b59b6' },
    { subject: 'Computer Science', score: 95, grade: 'A', term: 'Term 1', teacher: 'Mr. Eric N', color: '#1abc9c' },
    { subject: 'Kinyarwanda', score: 82, grade: 'B+', term: 'Term 1', teacher: 'Mme. Alice', color: '#f39c12' }
  ]);

  const [attendance, setAttendance] = useState([
    { date: '2026-04-22', status: 'Present', subject: 'Mathematics' },
    { date: '2026-04-23', status: 'Present', subject: 'English' },
    { date: '2026-04-24', status: 'Present', subject: 'Physics' },
    { date: '2026-04-25', status: 'Late', subject: 'Chemistry' },
    { date: '2026-04-26', status: 'Present', subject: 'Computer Science' },
    { date: '2026-04-27', status: 'Absent', subject: 'Mathematics' },
    { date: '2026-04-28', status: 'Present', subject: 'English' },
    { date: '2026-04-29', status: 'Present', subject: 'Physics' },
    { date: '2026-04-30', status: 'Present', subject: 'Chemistry' },
    { date: '2026-05-01', status: 'Present', subject: 'Computer Science' }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Math Project', subject: 'Mathematics', dueDate: '2026-05-10', status: 'Pending', score: null, priority: 'high' },
    { id: 2, title: 'Essay Writing', subject: 'English', dueDate: '2026-05-05', status: 'Submitted', score: 85, priority: 'medium' },
    { id: 3, title: 'Physics Lab Report', subject: 'Physics', dueDate: '2026-05-15', status: 'Pending', score: null, priority: 'high' },
    { id: 4, title: 'Programming Assignment', subject: 'Computer Science', dueDate: '2026-05-08', status: 'Submitted', score: 92, priority: 'medium' },
    { id: 5, title: 'Chemistry Quiz', subject: 'Chemistry', dueDate: '2026-05-12', status: 'Pending', score: null, priority: 'low' }
  ]);

  const [timetable, setTimetable] = useState([
    { day: 'Monday', time: '8:00 - 9:30', subject: 'Mathematics', teacher: 'Mr. Eric', room: 'Rm 101' },
    { day: 'Monday', time: '9:45 - 11:15', subject: 'English', teacher: 'Mme. Chantal', room: 'Rm 102' },
    { day: 'Monday', time: '11:30 - 1:00', subject: 'Physics', teacher: 'Dr. Claude', room: 'Science Lab' },
    { day: 'Monday', time: '2:00 - 3:30', subject: 'Computer Science', teacher: 'Mr. Eric N', room: 'Comp Lab' },
    { day: 'Tuesday', time: '8:00 - 9:30', subject: 'Chemistry', teacher: 'Mme. Jeanne', room: 'Science Lab' },
    { day: 'Tuesday', time: '9:45 - 11:15', subject: 'Mathematics', teacher: 'Mr. Eric', room: 'Rm 101' },
    { day: 'Tuesday', time: '11:30 - 1:00', subject: 'Kinyarwanda', teacher: 'Mme. Alice', room: 'Rm 103' },
    { day: 'Tuesday', time: '2:00 - 3:30', subject: 'Physical Education', teacher: 'Coach Peter', room: 'Playground' },
    { day: 'Wednesday', time: '8:00 - 9:30', subject: 'Physics', teacher: 'Dr. Claude', room: 'Science Lab' },
    { day: 'Wednesday', time: '9:45 - 11:15', subject: 'English', teacher: 'Mme. Chantal', room: 'Rm 102' },
    { day: 'Wednesday', time: '11:30 - 1:00', subject: 'Chemistry', teacher: 'Mme. Jeanne', room: 'Science Lab' },
    { day: 'Wednesday', time: '2:00 - 3:30', subject: 'Mathematics', teacher: 'Mr. Eric', room: 'Rm 101' },
    { day: 'Thursday', time: '8:00 - 9:30', subject: 'Computer Science', teacher: 'Mr. Eric N', room: 'Comp Lab' },
    { day: 'Thursday', time: '9:45 - 11:15', subject: 'Mathematics', teacher: 'Mr. Eric', room: 'Rm 101' },
    { day: 'Thursday', time: '11:30 - 1:00', subject: 'English', teacher: 'Mme. Chantal', room: 'Rm 102' },
    { day: 'Thursday', time: '2:00 - 3:30', subject: 'Library', teacher: 'Librarian', room: 'Library' },
    { day: 'Friday', time: '8:00 - 9:30', subject: 'Chemistry', teacher: 'Mme. Jeanne', room: 'Science Lab' },
    { day: 'Friday', time: '9:45 - 11:15', subject: 'Physics', teacher: 'Dr. Claude', room: 'Science Lab' },
    { day: 'Friday', time: '11:30 - 1:00', subject: 'Kinyarwanda', teacher: 'Mme. Alice', room: 'Rm 103' },
    { day: 'Friday', time: '2:00 - 3:30', subject: 'Sports', teacher: 'Coach Peter', room: 'Playground' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Assignment Due', message: 'Math Project due in 3 days', type: 'warning', date: '2026-05-07' },
    { id: 2, title: 'Grade Posted', message: 'Programming Assignment grade: 92%', type: 'success', date: '2026-05-01' },
    { id: 3, title: 'School Event', message: 'Science Fair on May 20th', type: 'info', date: '2026-04-28' }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'student') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Student');
      setUserEmail(email || 'student@essa.rw');
      setUserAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=1a3a5c&color=fff`);
    }
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/portal/login');
      }
    });
  };

  const calculateAverage = () => {
    const sum = grades.reduce((acc, g) => acc + g.score, 0);
    return (sum / grades.length).toFixed(1);
  };

  const calculateAttendanceRate = () => {
    const present = attendance.filter(a => a.status === 'Present').length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const getAttendanceColor = () => {
    const rate = calculateAttendanceRate();
    if (rate >= 90) return '#2ecc71';
    if (rate >= 75) return '#f39c12';
    return '#e74c3c';
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return '#2ecc71';
    if (grade >= 70) return '#3498db';
    if (grade >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Submitted': return <span className="badge badge-success"><i className="fas fa-check"></i> Submitted</span>;
      case 'Pending': return <span className="badge badge-warning"><i className="fas fa-clock"></i> Pending</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const handleViewAssignment = (assignment) => {
    Swal.fire({
      title: assignment.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Subject:</strong> ${assignment.subject}</p>
          <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
          <p><strong>Status:</strong> ${assignment.status}</p>
          ${assignment.score ? `<p><strong>Score:</strong> ${assignment.score}%</p>` : ''}
          <p><strong>Priority:</strong> ${assignment.priority}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#1a3a5c'
    });
  };

  const handleSubmitAssignment = () => {
    Swal.fire({
      title: 'Submit Assignment',
      html: `
        <input type="file" id="file" class="swal2-file" accept=".pdf,.doc,.docx">
        <textarea id="comment" class="swal2-textarea" placeholder="Add a comment (optional)"></textarea>
      `,
      confirmButtonText: 'Submit',
      confirmButtonColor: '#1a3a5c',
      preConfirm: () => {
        const file = document.getElementById('file').files[0];
        if (!file) {
          Swal.showValidationMessage('Please select a file to upload');
          return false;
        }
        return { fileName: file.name };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Submitted!', `Your assignment "${result.value.fileName}" has been submitted.`, 'success');
      }
    });
  };

  const getTodaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return timetable.filter(item => item.day === today);
  };

  const todaySchedule = getTodaySchedule();

  return (
    <div className="dashboard-layout">
      {/* Dashboard Navbar */}
      <nav className="dashboard-nav">
        <div className="container">
          <div className="logo">
            <h2><i className="fas fa-graduation-cap" style={{ color: '#1a3a5c' }}></i> ESSA Nyarugunga</h2>
            <p>Student Portal</p>
          </div>
          <div className="nav-user">
            <div className="user-info">
              <img src={userAvatar} alt={userName} className="user-avatar" />
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">Student</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li>
              <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                <i className="fas fa-chart-line"></i> Overview
              </button>
            </li>
            <li>
              <button className={activeTab === 'grades' ? 'active' : ''} onClick={() => setActiveTab('grades')}>
                <i className="fas fa-chart-simple"></i> Grades
              </button>
            </li>
            <li>
              <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>
                <i className="fas fa-tasks"></i> Assignments
              </button>
            </li>
            <li>
              <button className={activeTab === 'timetable' ? 'active' : ''} onClick={() => setActiveTab('timetable')}>
                <i className="fas fa-calendar-alt"></i> Timetable
              </button>
            </li>
            <li>
              <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
                <i className="fas fa-clock"></i> Attendance
              </button>
            </li>
            <li>
              <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                <i className="fas fa-bell"></i> Notifications
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div className="welcome-text">
              <h2>Welcome back, {userName}! 👋</h2>
              <p>Here's your academic summary for Term 1, 2026</p>
            </div>
            <div className="welcome-date">
              <i className="fas fa-calendar-alt"></i>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e8f4fd' }}>
                    <i className="fas fa-chart-line" style={{ color: '#1a3a5c' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{calculateAverage()}%</h3>
                    <p>Average Grade</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e8f8f5' }}>
                    <i className="fas fa-calendar-check" style={{ color: '#27ae60' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3 style={{ color: getAttendanceColor() }}>{calculateAttendanceRate()}%</h3>
                    <p>Attendance Rate</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef9e7' }}>
                    <i className="fas fa-tasks" style={{ color: '#f39c12' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{assignments.filter(a => a.status === 'Submitted').length}/{assignments.length}</h3>
                    <p>Assignments Completed</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f5eef8' }}>
                    <i className="fas fa-trophy" style={{ color: '#9b59b6' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>Top 15%</h3>
                    <p>Class Rank</p>
                  </div>
                </div>
              </div>

              {/* Recent Grades */}
              <div className="dashboard-card">
                <h3><i className="fas fa-chart-line"></i> Recent Grades</h3>
                <div className="grades-preview">
                  {grades.slice(0, 4).map((grade, index) => (
                    <div key={index} className="grade-item">
                      <div className="grade-info">
                        <span className="grade-subject">{grade.subject}</span>
                        <span className="grade-teacher">{grade.teacher}</span>
                      </div>
                      <div className="grade-score" style={{ color: getGradeColor(grade.score) }}>
                        {grade.score}% <span className="grade-letter">{grade.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="dashboard-card">
                <h3><i className="fas fa-calendar-day"></i> Today's Schedule</h3>
                <div className="today-schedule">
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((item, index) => (
                      <div key={index} className="schedule-item">
                        <div className="schedule-time">{item.time}</div>
                        <div className="schedule-subject">{item.subject}</div>
                        <div className="schedule-details">
                          <span><i className="fas fa-chalkboard-user"></i> {item.teacher}</span>
                          <span><i className="fas fa-door-open"></i> {item.room}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No classes scheduled for today</p>
                  )}
                </div>
              </div>

              {/* Pending Assignments */}
              <div className="dashboard-card">
                <h3><i className="fas fa-clock"></i> Pending Assignments</h3>
                <div className="pending-assignments">
                  {assignments.filter(a => a.status === 'Pending').slice(0, 3).map(assignment => (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-info">
                        <h4>{assignment.title}</h4>
                        <p>{assignment.subject}</p>
                      </div>
                      <div className="assignment-due">
                        <span>Due: {assignment.dueDate}</span>
                        <button onClick={() => handleSubmitAssignment()} className="submit-btn-small">
                          Submit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'grades' && (
            <div className="dashboard-card full-width">
              <h3><i className="fas fa-chart-line"></i> Complete Grade Report</h3>
              <div className="grades-summary">
                <div className="grade-summary-card">
                  <h4>Overall Performance</h4>
                  <div className="overall-grade">
                    <div className="grade-circle" style={{ 
                      background: `conic-gradient(#1a3a5c 0deg ${(calculateAverage() / 100) * 360}deg, #e0e0e0 ${(calculateAverage() / 100) * 360}deg 360deg)`
                    }}>
                      <span>{calculateAverage()}%</span>
                    </div>
                    <p>Overall Average</p>
                  </div>
                </div>
                <div className="grades-table-container">
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Score</th>
                        <th>Grade</th>
                        <th>Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, index) => (
                        <tr key={index}>
                          <td><strong>{grade.subject}</strong></td>
                          <td>{grade.teacher}</td>
                          <td style={{ color: getGradeColor(grade.score), fontWeight: 'bold' }}>{grade.score}%</td>
                          <td><span className="grade-badge" style={{ background: getGradeColor(grade.score) }}>{grade.grade}</span></td>
                          <td>{grade.term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="dashboard-card full-width">
              <h3><i className="fas fa-tasks"></i> All Assignments</h3>
              <div className="assignments-grid">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="assignment-card" onClick={() => handleViewAssignment(assignment)}>
                    <div className="assignment-header">
                      <h4>{assignment.title}</h4>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="assignment-subject"><i className="fas fa-book"></i> {assignment.subject}</p>
                    <div className="assignment-footer">
                      <span><i className="fas fa-calendar"></i> Due: {assignment.dueDate}</span>
                      {assignment.status === 'Pending' && (
                        <button className="submit-assignment-btn" onClick={(e) => { e.stopPropagation(); handleSubmitAssignment(); }}>
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="dashboard-card full-width">
              <h3><i className="fas fa-calendar-alt"></i> Weekly Timetable</h3>
              <div className="timetable-container">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="timetable-day">
                    <h4>{day}</h4>
                    {timetable.filter(item => item.day === day).map((item, idx) => (
                      <div key={idx} className="timetable-class">
                        <div className="class-time">{item.time}</div>
                        <div className="class-info">
                          <strong>{item.subject}</strong>
                          <small>{item.teacher}</small>
                          <small>{item.room}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="dashboard-card full-width">
              <h3><i className="fas fa-clock"></i> Attendance Record</h3>
              <div className="attendance-summary">
                <div className="attendance-stats">
                  <div className="att-stat">
                    <div className="att-number" style={{ color: getAttendanceColor() }}>{calculateAttendanceRate()}%</div>
                    <div className="att-label">Overall Attendance</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-number">{attendance.filter(a => a.status === 'Present').length}</div>
                    <div className="att-label">Days Present</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-number">{attendance.filter(a => a.status === 'Late').length}</div>
                    <div className="att-label">Days Late</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-number">{attendance.filter(a => a.status === 'Absent').length}</div>
                    <div className="att-label">Days Absent</div>
                  </div>
                </div>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date}</td>
                        <td>{record.subject}</td>
                        <td>
                          <span className={`attendance-status ${record.status.toLowerCase()}`}>
                            {record.status === 'Present' && <i className="fas fa-check-circle"></i>}
                            {record.status === 'Late' && <i className="fas fa-clock"></i>}
                            {record.status === 'Absent' && <i className="fas fa-times-circle"></i>}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="dashboard-card full-width">
              <h3><i className="fas fa-bell"></i> Notifications</h3>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.type}`}>
                    <div className="notification-icon">
                      {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                      {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
                      {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>{notification.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          background: #f0f4f8;
        }
        
        .welcome-banner {
          background: linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 100%);
          border-radius: 16px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          color: white;
        }
        
        .welcome-text h2 {
          margin-bottom: 0.5rem;
        }
        
        .welcome-date {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }
        
        .grades-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .grade-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 12px;
          transition: transform 0.3s ease;
        }
        
        .grade-item:hover {
          transform: translateX(5px);
        }
        
        .grade-info {
          display: flex;
          flex-direction: column;
        }
        
        .grade-subject {
          font-weight: 600;
          color: #1a3a5c;
        }
        
        .grade-teacher {
          font-size: 0.75rem;
          color: #666;
        }
        
        .grade-score {
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .grade-letter {
          font-size: 0.8rem;
          margin-left: 5px;
        }
        
        .today-schedule {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .schedule-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 10px;
        }
        
        .schedule-time {
          min-width: 100px;
          font-weight: 600;
          color: #1a3a5c;
        }
        
        .schedule-subject {
          flex: 1;
          font-weight: 500;
        }
        
        .schedule-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #666;
        }
        
        .pending-assignments {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .assignment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #fff3cd;
          border-radius: 10px;
        }
        
        .assignment-info h4 {
          margin-bottom: 0.25rem;
          color: #856404;
        }
        
        .assignment-due {
          text-align: right;
        }
        
        .submit-btn-small {
          background: #1a3a5c;
          color: white;
          border: none;
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 0.25rem;
        }
        
        .full-width {
          width: 100%;
        }
        
        .grades-summary {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
        }
        
        .grade-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: conic-gradient(#1a3a5c 0deg 216deg, #e0e0e0 216deg 360deg);
          margin: 0 auto 1rem;
        }
        
        .grade-circle span {
          background: white;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #1a3a5c;
        }
        
        .grade-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          color: white;
          font-weight: bold;
          font-size: 0.75rem;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .badge-success {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }
        
        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }
        
        .assignment-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .assignment-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .assignment-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .submit-assignment-btn {
          background: #1a3a5c;
          color: white;
          border: none;
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .timetable-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        
        .timetable-day {
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .timetable-day h4 {
          background: #1a3a5c;
          color: white;
          padding: 0.5rem;
          text-align: center;
        }
        
        .timetable-class {
          padding: 0.75rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .class-time {
          font-size: 0.7rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        
        .class-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        
        .class-info small {
          font-size: 0.65rem;
          color: #888;
        }
        
        .attendance-summary {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .attendance-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        
        .att-stat {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .att-number {
          font-size: 2rem;
          font-weight: bold;
          color: #1a3a5c;
        }
        
        .attendance-status {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        
        .attendance-status.present {
          background: #d4edda;
          color: #155724;
        }
        
        .attendance-status.late {
          background: #fff3cd;
          color: #856404;
        }
        
        .attendance-status.absent {
          background: #f8d7da;
          color: #721c24;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .notification-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid;
        }
        
        .notification-item.warning {
          border-left-color: #f39c12;
        }
        
        .notification-item.success {
          border-left-color: #27ae60;
        }
        
        .notification-item.info {
          border-left-color: #3498db;
        }
        
        .notification-icon i {
          font-size: 1.5rem;
        }
        
        .notification-item.warning .notification-icon i {
          color: #f39c12;
        }
        
        .notification-item.success .notification-icon i {
          color: #27ae60;
        }
        
        .notification-item.info .notification-icon i {
          color: #3498db;
        }
        
        .notification-content h4 {
          margin-bottom: 0.25rem;
        }
        
        .notification-content small {
          font-size: 0.7rem;
          color: #888;
        }
        
        @media (max-width: 768px) {
          .grades-summary {
            grid-template-columns: 1fr;
          }
          
          .timetable-container {
            grid-template-columns: 1fr;
          }
          
          .attendance-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .assignments-grid {
            grid-template-columns: 1fr;
          }
          
          .welcome-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;