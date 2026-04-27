// src/portals/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice Habimana', grade: 'S4', avgScore: 85, attendance: 95 },
    { id: 2, name: 'Jean Paul Ndayisaba', grade: 'S4', avgScore: 78, attendance: 88 },
    { id: 3, name: 'Marie Claire Uwase', grade: 'S4', avgScore: 92, attendance: 98 },
    { id: 4, name: 'Eric Munezero', grade: 'S4', avgScore: 70, attendance: 85 },
    { id: 5, name: 'Diane Umuhoza', grade: 'S4', avgScore: 88, attendance: 92 }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Math Quiz 1', subject: 'Mathematics', dueDate: '2026-05-01', submissions: 42 },
    { id: 2, title: 'Algebra Assignment', subject: 'Mathematics', dueDate: '2026-05-10', submissions: 38 },
    { id: 3, title: 'Geometry Project', subject: 'Mathematics', dueDate: '2026-05-20', submissions: 35 }
  ]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('portalToken');
    if (!token) {
      navigate('/portal/login');
    }
    setUserName(name || 'Teacher');
  }, [navigate]);

  const handleAddGrade = () => {
    Swal.fire({
      title: 'Add Grade',
      html: `
        <select id="student" class="swal2-select">
          <option value="">Select Student</option>
          ${students.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        </select>
        <input type="text" id="subject" class="swal2-input" placeholder="Subject">
        <input type="number" id="score" class="swal2-input" placeholder="Score">
      `,
      confirmButtonText: 'Save Grade',
      confirmButtonColor: '#1e3c72',
      preConfirm: () => {
        const student = document.getElementById('student').value;
        const subject = document.getElementById('subject').value;
        const score = document.getElementById('score').value;
        if (!student || !subject || !score) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { student, subject, score };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Grade Added!', `Grade for ${result.value.student} has been added.`, 'success');
      }
    });
  };

  const handleAddAssignment = () => {
    Swal.fire({
      title: 'Create Assignment',
      html: `
        <input type="text" id="title" class="swal2-input" placeholder="Assignment Title">
        <input type="date" id="dueDate" class="swal2-input" placeholder="Due Date">
      `,
      confirmButtonText: 'Create Assignment',
      confirmButtonColor: '#1e3c72',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const dueDate = document.getElementById('dueDate').value;
        if (!title || !dueDate) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { title, dueDate };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Assignment Created!', `${result.value.title} has been created.`, 'success');
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="container">
            <div className="dashboard-title">
              <h1><i className="fas fa-chalkboard-user"></i> Teacher Dashboard</h1>
              <p>Welcome back, {userName}!</p>
            </div>
            <button onClick={() => {
              localStorage.clear();
              navigate('/portal/login');
            }} className="logout-dashboard-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <div><h3>{students.length}</h3><p>Total Students</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-tasks"></i>
                <div><h3>{assignments.length}</h3><p>Active Assignments</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-chart-line"></i>
                <div><h3>82.6%</h3><p>Class Average</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-calendar-check"></i>
                <div><h3>91.6%</h3><p>Overall Attendance</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <div className="tabs">
              <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>My Students</button>
              <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>Assignments</button>
              <button className={activeTab === 'grades' ? 'active' : ''} onClick={() => setActiveTab('grades')}>Manage Grades</button>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            {activeTab === 'overview' && (
              <div className="teacher-overview">
                <div className="action-buttons">
                  <button onClick={handleAddGrade} className="action-btn"><i className="fas fa-plus"></i> Add Grade</button>
                  <button onClick={handleAddAssignment} className="action-btn"><i className="fas fa-plus"></i> Create Assignment</button>
                </div>
                <div className="upcoming-tasks">
                  <h3>Upcoming Deadlines</h3>
                  <div className="task-list">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="task-item">
                        <div><strong>{assignment.title}</strong><br/><small>Due: {assignment.dueDate}</small></div>
                        <span className="submissions">{assignment.submissions}/45 submitted</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="students-list">
                <h2>My Students</h2>
                <table className="students-table">
                  <thead>
                    <tr><th>Name</th><th>Class</th><th>Average Score</th><th>Attendance</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.grade}</td>
                        <td>{student.avgScore}%</td>
                        <td>{student.attendance}%</td>
                        <td><button className="view-btn">View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="assignments-manage">
                <h2>Manage Assignments</h2>
                <div className="assignments-list">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="assignment-manage-card">
                      <h3>{assignment.title}</h3>
                      <p>Subject: {assignment.subject}</p>
                      <p>Due: {assignment.dueDate}</p>
                      <p>Submissions: {assignment.submissions}/45</p>
                      <button className="view-submissions-btn">View Submissions</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="grades-manage">
                <h2>Manage Student Grades</h2>
                <table className="grades-manage-table">
                  <thead>
                    <tr><th>Student Name</th><th>Mathematics</th><th>English</th><th>Science</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td><input type="number" defaultValue={student.avgScore - 5} className="grade-input" /></td>
                        <td><input type="number" defaultValue={student.avgScore - 3} className="grade-input" /></td>
                        <td><input type="number" defaultValue={student.avgScore} className="grade-input" /></td>
                        <td><button className="save-grade-btn">Save</button></td>
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

export default TeacherDashboard;