// src/portals/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [children, setChildren] = useState([
    { id: 1, name: 'Alice Habimana', class: 'S4 - Software Development', avgScore: 88, attendance: 95, fees: 'Paid' },
    { id: 2, name: 'James Habimana', class: 'S2 - General Studies', avgScore: 82, attendance: 90, fees: 'Pending' }
  ]);

  const [fees, setFees] = useState([
    { term: 'Term 1, 2026', amount: 150000, status: 'Paid', dueDate: '2026-02-15' },
    { term: 'Term 2, 2026', amount: 150000, status: 'Pending', dueDate: '2026-05-15' },
    { term: 'Term 3, 2026', amount: 150000, status: 'Pending', dueDate: '2026-09-15' }
  ]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('portalToken');
    if (!token) {
      navigate('/portal/login');
    }
    setUserName(name || 'Parent');
  }, [navigate]);

  const handlePayFees = () => {
    Swal.fire({
      title: 'Pay School Fees',
      html: `
        <select id="term" class="swal2-select">
          <option value="">Select Term</option>
          ${fees.filter(f => f.status === 'Pending').map(f => `<option value="${f.term}">${f.term} - ${f.amount} RWF</option>`).join('')}
        </select>
        <select id="method" class="swal2-select">
          <option value="">Payment Method</option>
          <option value="mobile">Mobile Money</option>
          <option value="bank">Bank Transfer</option>
          <option value="card">Credit/Debit Card</option>
        </select>
      `,
      confirmButtonText: 'Proceed to Payment',
      confirmButtonColor: '#27ae60',
      preConfirm: () => {
        const term = document.getElementById('term').value;
        const method = document.getElementById('method').value;
        if (!term || !method) {
          Swal.showValidationMessage('Please select term and payment method');
          return false;
        }
        return { term, method };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Payment Initiated!', `You will receive a confirmation SMS shortly for ${result.value.term}.`, 'success');
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
              <h1><i className="fas fa-users"></i> Parent Dashboard</h1>
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
                <i className="fas fa-child"></i>
                <div><h3>{children.length}</h3><p>Children Enrolled</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-chart-line"></i>
                <div><h3>85.0%</h3><p>Average Grades</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-calendar-check"></i>
                <div><h3>92.5%</h3><p>Attendance Rate</p></div>
              </div>
              <div className="stat-card">
                <i className="fas fa-money-bill"></i>
                <div><h3>{fees.filter(f => f.status === 'Paid').length}/3</h3><p>Terms Paid</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <div className="tabs">
              <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={activeTab === 'children' ? 'active' : ''} onClick={() => setActiveTab('children')}>My Children</button>
              <button className={activeTab === 'fees' ? 'active' : ''} onClick={() => setActiveTab('fees')}>School Fees</button>
              <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Reports</button>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            {activeTab === 'overview' && (
              <div className="parent-overview">
                <div className="notice-card">
                  <i className="fas fa-bell"></i>
                  <div>
                    <h3>Important Notice</h3>
                    <p>Parent-Teacher Conference will be held on May 10, 2026. Please check your email for schedule.</p>
                  </div>
                </div>
                <div className="quick-actions">
                  <button onClick={handlePayFees} className="quick-action-btn"><i className="fas fa-money-bill"></i> Pay Fees</button>
                  <button className="quick-action-btn"><i className="fas fa-calendar"></i> Schedule Meeting</button>
                  <button className="quick-action-btn"><i className="fas fa-download"></i> Download Reports</button>
                </div>
              </div>
            )}

            {activeTab === 'children' && (
              <div className="children-list">
                {children.map(child => (
                  <div key={child.id} className="child-card">
                    <div className="child-header">
                      <i className="fas fa-user-graduate"></i>
                      <div>
                        <h3>{child.name}</h3>
                        <p>{child.class}</p>
                      </div>
                    </div>
                    <div className="child-stats">
                      <div><span>Average Score:</span> <strong>{child.avgScore}%</strong></div>
                      <div><span>Attendance:</span> <strong>{child.attendance}%</strong></div>
                      <div><span>Fees Status:</span> <strong className={child.fees === 'Paid' ? 'paid' : 'pending'}>{child.fees}</strong></div>
                    </div>
                    <button className="view-details-btn">View Full Report</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="fees-management">
                <div className="fees-summary">
                  <h3>Fee Payment Status</h3>
                  <table className="fees-table">
                    <thead>
                      <tr><th>Term</th><th>Amount (RWF)</th><th>Status</th><th>Due Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {fees.map((fee, index) => (
                        <tr key={index}>
                          <td>{fee.term}</td>
                          <td>{fee.amount.toLocaleString()}</td>
                          <td><span className={`status-${fee.status.toLowerCase()}`}>{fee.status}</span></td>
                          <td>{fee.dueDate}</td>
                          <td>{fee.status === 'Pending' && <button onClick={handlePayFees} className="pay-btn">Pay Now</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-section">
                <h2>Academic Reports</h2>
                <div className="report-list">
                  <div className="report-item">
                    <i className="fas fa-file-pdf"></i>
                    <div><h4>Term 1, 2026 Report - Alice</h4><small>Generated: April 15, 2026</small></div>
                    <button className="download-report-btn"><i className="fas fa-download"></i> Download</button>
                  </div>
                  <div className="report-item">
                    <i className="fas fa-file-pdf"></i>
                    <div><h4>Term 1, 2026 Report - James</h4><small>Generated: April 15, 2026</small></div>
                    <button className="download-report-btn"><i className="fas fa-download"></i> Download</button>
                  </div>
                  <div className="report-item">
                    <i className="fas fa-chart-line"></i>
                    <div><h4>Progress Report - Both Children</h4><small>Updated: Weekly</small></div>
                    <button className="download-report-btn"><i className="fas fa-eye"></i> View</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ParentDashboard;