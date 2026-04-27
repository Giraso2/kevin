// src/portals/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Student data
  const [grades, setGrades] = useState([
    { subject: 'Mathematics', score: 85, grade: 'A', term: 'Term 1' },
    { subject: 'English', score: 78, grade: 'B+', term: 'Term 1' },
    { subject: 'Physics', score: 92, grade: 'A', term: 'Term 1' },
    { subject: 'Chemistry', score: 88, grade: 'A-', term: 'Term 1' },
    { subject: 'Computer Science', score: 95, grade: 'A', term: 'Term 1' },
    { subject: 'Kinyarwanda', score: 82, grade: 'B+', term: 'Term 1' }
  ]);

  const [attendance, setAttendance] = useState([
    { date: '2026-04-22', status: 'Present', subject: 'Mathematics' },
    { date: '2026-04-23', status: 'Present', subject: 'English' },
    { date: '2026-04-24', status: 'Present', subject: 'Physics' },
    { date: '2026-04-25', status: 'Late', subject: 'Chemistry' },
    { date: '2026-04-26', status: 'Present', subject: 'Computer Science' }
  ]);

  const [assignments, setAssignments] = useState([
    { title: 'Math Project', subject: 'Mathematics', dueDate: '2026-05-10', status: 'Pending', score: null },
    { title: 'Essay Writing', subject: 'English', dueDate: '2026-05-05', status: 'Submitted', score: 85 },
    { title: 'Physics Lab Report', subject: 'Physics', dueDate: '2026-05-15', status: 'Pending', score: null },
    { title: 'Programming Assignment', subject: 'Computer Science', dueDate: '2026-05-08', status: 'Submitted', score: 92 }
  ]);

  const [timetable, setTimetable] = useState([
    { day: 'Monday', subjects: ['Mathematics', 'English', 'Physics', 'Lunch', 'Computer Science'] },
    { day: 'Tuesday', subjects: ['Chemistry', 'Mathematics', 'Kinyarwanda', 'Lunch', 'Physical Education'] },
    { day: 'Wednesday', subjects: ['Physics', 'English', 'Chemistry', 'Lunch', 'Mathematics'] },
    { day: 'Thursday', subjects: ['Computer Science', 'Mathematics', 'English', 'Lunch', 'Library'] },
    { day: 'Friday', subjects: ['Chemistry', 'Physics', 'Kinyarwanda', 'Lunch', 'Sports'] }
  ]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('portalToken');
    if (!token) {
      navigate('/portal/login');
    }
    setUserName(name || 'Student');
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Logout'
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

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="container">
            <div className="dashboard-title">
              <h1><i className="fas fa-user-graduate"></i> Student Dashboard</h1>
              <p>Welcome back, {userName}!</p>
            </div>
            <button onClick={handleLogout} className="logout-dashboard-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-chart-line"></i>
                <div>
                  <h3>{calculateAverage()}%</h3>
                  <p>Average Grade</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-calendar-check"></i>
                <div>
                  <h3>{calculateAttendanceRate()}%</h3>
                  <p>Attendance Rate</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-tasks"></i>
                <div>
                  <h3>{assignments.filter(a => a.status === 'Submitted').length}/{assignments.length}</h3>
                  <p>Assignments Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-trophy"></i>
                <div>
                  <h3>Top 10%</h3>
                  <p>Class Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <div className="tabs">
              <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                <i className="fas fa-chart-simple"></i> Overview
              </button>
              <button className={activeTab === 'grades' ? 'active' : ''} onClick={() => setActiveTab('grades')}>
                <i className="fas fa-chart-line"></i> Grades
              </button>
              <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>
                <i className="fas fa-tasks"></i> Assignments
              </button>
              <button className={activeTab === 'timetable' ? 'active' : ''} onClick={() => setActiveTab('timetable')}>
                <i className="fas fa-calendar"></i> Timetable
              </button>
              <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
                <i className="fas fa-clock"></i> Attendance
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="welcome-card">
                  <h2>Welcome to Your Dashboard</h2>
                  <p>Here's your academic summary for Term 1, 2026</p>
                </div>
                <div className="recent-activities">
                  <h3><i className="fas fa-clock"></i> Recent Activities</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <i className="fas fa-check-circle"></i>
                      <div>
                        <p>Assignment submitted: Programming Assignment</p>
                        <small>2 days ago</small>
                      </div>
                    </div>
                    <div className="activity-item">
                      <i className="fas fa-chart-line"></i>
                      <div>
                        <p>New grades published: Mathematics Test</p>
                        <small>5 days ago</small>
                      </div>
                    </div>
                    <div className="activity-item">
                      <i className="fas fa-calendar"></i>
                      <div>
                        <p>Upcoming: Science Fair on May 20</p>
                        <small>3 days from now</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="grades-content">
                <h2><i className="fas fa-chart-line"></i> Your Grades - Term 1</h2>
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, index) => (
                      <tr key={index}>
                        <td>{grade.subject}</td>
                        <td>{grade.score}%</td>
                        <td><span className={`grade-${grade.grade.charAt(0)}`}>{grade.grade}</span></td>
                        <td>{grade.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="assignments-content">
                <h2><i className="fas fa-tasks"></i> Your Assignments</h2>
                <div className="assignments-grid">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="assignment-card">
                      <h3>{assignment.title}</h3>
                      <p><i className="fas fa-book"></i> {assignment.subject}</p>
                      <p><i className="fas fa-calendar"></i> Due: {assignment.dueDate}</p>
                      <p className={`status-${assignment.status.toLowerCase()}`}>
                        <i className="fas fa-flag"></i> {assignment.status}
                      </p>
                      {assignment.score && <p><i className="fas fa-star"></i> Score: {assignment.score}%</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'timetable' && (
              <div className="timetable-content">
                <h2><i className="fas fa-calendar"></i> Weekly Timetable</h2>
                <div className="timetable-grid">
                  {timetable.map((day, index) => (
                    <div key={index} className="timetable-day">
                      <h3>{day.day}</h3>
                      {day.subjects.map((subject, idx) => (
                        <div key={idx} className={`timetable-subject ${subject === 'Lunch' ? 'lunch' : ''}`}>
                          {subject}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="attendance-content">
                <h2><i className="fas fa-clock"></i> Recent Attendance</h2>
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
                          <span className={`status-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;