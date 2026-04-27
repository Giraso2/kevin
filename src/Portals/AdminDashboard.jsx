// src/portals/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [systemStats, setSystemStats] = useState({
    totalStudents: 850,
    totalTeachers: 45,
    totalParents: 620,
    totalStaff: 28,
    pendingApplications: 35,
    pendingFees: 142,
    monthlyRevenue: 42500000
  });

  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'Jean Paul', role: 'Student', email: 'jean@essa.rw', status: 'Active' },
    { id: 2, name: 'Marie Claire', role: 'Teacher', email: 'marie@essa.rw', status: 'Active' },
    { id: 3, name: 'Eric Munezero', role: 'Parent', email: 'eric@essa.rw', status: 'Pending' },
    { id: 4, name: 'Diane Umuhoza', role: 'Student', email: 'diane@essa.rw', status: 'Active' },
    { id: 5, name: 'Dr. Uwimana', role: 'Admin', email: 'admin@essa.rw', status: 'Active' }
  ]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('portalToken');
    if (!token) {
      navigate('/portal/login');
    }
    setUserName(name || 'Administrator');
  }, [navigate]);

  const handleAddUser = () => {
    Swal.fire({
      title: 'Add New User',
      html: `
        <input type="text" id="name" class="swal2-input" placeholder="Full Name">
        <input type="email" id="email" class="swal2-input" placeholder="Email">
        <select id="role" class="swal2-select">
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="staff">Staff</option>
        </select>
      `,
      confirmButtonText: 'Add User',
      confirmButtonColor: '#1e3c72',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        if (!name || !email || !role) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { name, email, role };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('User Added!', `${result.value.name} has been added as ${result.value.role}.`, 'success');
      }
    });
  };

  const handleAnnouncement = () => {
    Swal.fire({
      title: 'Post Announcement',
      html: `
        <input type="text" id="title" class="swal2-input" placeholder="Announcement Title">
        <textarea id="message" class="swal2-textarea" placeholder="Announcement Message"></textarea>
        <select id="audience" class="swal2-select">
          <option value="all">All Users</option>
          <option value="students">Students Only</option>
          <option value="teachers">Teachers Only</option>
          <option value="parents">Parents Only</option>
        </select>
      `,
      confirmButtonText: 'Post Announcement',
      confirmButtonColor: '#1e3c72',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const message = document.getElementById('message').value;
        const audience = document.getElementById('audience').value;
        if (!title || !message || !audience) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { title, message, audience };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Announcement Posted!', `Your announcement has been sent to ${result.value.audience}.`, 'success');
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
              <h1><i className="fas fa-user-shield"></i> Admin Dashboard</h1>
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
            <div className="stats-grid admin-stats">
              <div className="stat-card"><i className="fas fa-users"></i><div><h3>{systemStats.totalStudents}</h3><p>Students</p></div></div>
              <div className="stat-card"><i className="fas fa-chalkboard-user"></i><div><h3>{systemStats.totalTeachers}</h3><p>Teachers</p></div></div>
              <div className="stat-card"><i className="fas fa-child"></i><div><h3>{systemStats.totalParents}</h3><p>Parents</p></div></div>
              <div className="stat-card"><i className="fas fa-briefcase"></i><div><h3>{systemStats.totalStaff}</h3><p>Staff</p></div></div>
              <div className="stat-card"><i className="fas fa-clock"></i><div><h3>{systemStats.pendingApplications}</h3><p>Applications</p></div></div>
              <div className="stat-card"><i className="fas fa-money-bill"></i><div><h3>{systemStats.pendingFees}</h3><p>Pending Fees</p></div></div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <div className="tabs">
              <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Manage Users</button>
              <button className={activeTab === 'academics' ? 'active' : ''} onClick={() => setActiveTab('academics')}>Academics</button>
              <button className={activeTab === 'finance' ? 'active' : ''} onClick={() => setActiveTab('finance')}>Finance</button>
              <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>System Settings</button>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            {activeTab === 'overview' && (
              <div className="admin-overview">
                <div className="admin-actions">
                  <button onClick={handleAddUser} className="admin-action-btn"><i className="fas fa-user-plus"></i> Add User</button>
                  <button onClick={handleAnnouncement} className="admin-action-btn"><i className="fas fa-bullhorn"></i> Post Announcement</button>
                  <button className="admin-action-btn"><i className="fas fa-chart-line"></i> Generate Report</button>
                  <button className="admin-action-btn"><i className="fas fa-cog"></i> System Settings</button>
                </div>
                <div className="recent-users">
                  <h3>Recent User Activity</h3>
                  <table className="recent-users-table">
                    <thead>
                      <tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.role}</td>
                          <td>{user.email}</td>
                          <td><span className={`status-${user.status.toLowerCase()}`}>{user.status}</span></td>
                          <td><button className="edit-btn"><i className="fas fa-edit"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-management">
                <div className="search-bar">
                  <input type="text" placeholder="Search users..." />
                  <button><i className="fas fa-search"></i> Search</button>
                </div>
                <div className="users-stats">
                  <div className="user-stat">Total Users: 1,543</div>
                  <div className="user-stat">Active: 1,421</div>
                  <div className="user-stat">Pending: 122</div>
                </div>
                <button onClick={handleAddUser} className="add-user-btn"><i className="fas fa-plus"></i> Add New User</button>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="finance-management">
                <h2>Financial Overview</h2>
                <div className="finance-cards">
                  <div className="finance-card"><h4>Total Revenue (2026)</h4><p className="amount">RWF 125,500,000</p></div>
                  <div className="finance-card"><h4>Pending Payments</h4><p className="amount">RWF 18,750,000</p></div>
                  <div className="finance-card"><h4>Scholarships Given</h4><p className="amount">RWF 5,200,000</p></div>
                </div>
                <button className="generate-report-btn"><i className="fas fa-file-invoice"></i> Generate Financial Report</button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="system-settings">
                <div className="settings-group">
                  <h3>School Information</h3>
                  <div className="setting-item">
                    <label>School Name:</label>
                    <input type="text" defaultValue="ESSA Nyarugunga School" />
                  </div>
                  <div className="setting-item">
                    <label>Email:</label>
                    <input type="email" defaultValue="info@essanyarugunga.rw" />
                  </div>
                  <div className="setting-item">
                    <label>Phone:</label>
                    <input type="text" defaultValue="+250 788 123 456" />
                  </div>
                </div>
                <div className="settings-group">
                  <h3>Academic Settings</h3>
                  <div className="setting-item">
                    <label>Current Term:</label>
                    <select><option>Term 1, 2026</option><option>Term 2, 2026</option></select>
                  </div>
                  <div className="setting-item">
                    <label>Registration Open:</label>
                    <input type="checkbox" defaultChecked /> Yes
                  </div>
                </div>
                <button className="save-settings-btn"><i className="fas fa-save"></i> Save All Settings</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;