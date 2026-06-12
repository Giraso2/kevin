import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaMoneyBillWave, FaFileInvoice, FaChartLine, FaUsers, FaPrint, FaEnvelope, FaPlus, FaSearch } from 'react-icons/fa';
import PortalLayout from './components/layouts/PortalLayout';
import StatCard from './components/common/StatCard';
import MessagingModal from './components/common/MessagingModal';

const AccountantAdminPortal = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showMessaging, setShowMessaging] = useState(false);
  const [feesCollected, setFeesCollected] = useState(185000);
  const [outstanding, setOutstanding] = useState(45000);

  const handleCreateFeeStructure = () => {
    Swal.fire({
      title: 'Create Fee Structure',
      html: `
        <select id="class" class="swal2-select"><option>Select Class</option><option>Grade 8</option><option>Grade 9</option></select>
        <input id="tuition" class="swal2-input" placeholder="Tuition Fee">
        <input id="exam" class="swal2-input" placeholder="Exam Fee">
        <input id="other" class="swal2-input" placeholder="Other Fees">
      `,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Created!', 'Fee structure created', 'success');
    });
  };

  const handleRecordPayment = () => {
    Swal.fire({
      title: 'Record Payment',
      html: `<input id="studentId" class="swal2-input" placeholder="Student ID"><input id="amount" class="swal2-input" placeholder="Amount" type="number">`,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire('Recorded!', 'Payment recorded successfully', 'success');
        setFeesCollected(feesCollected + 500);
      }
    });
  };

  const handleProcessPayroll = () => {
    Swal.fire({
      title: 'Process Payroll',
      html: `<select id="month" class="swal2-select"><option>January</option><option>February</option></select>`,
      confirmButtonColor: '#FFD700'
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Processed!', 'Payroll processed for selected month', 'success');
    });
  };

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon={FaMoneyBillWave} title="Fees Collected (Jan)" value={`$${feesCollected.toLocaleString()}`} color="#FFD700" bgColor="#FFF8E1" />
        <StatCard icon={FaMoneyBillWave} title="Outstanding Balances" value={`$${outstanding.toLocaleString()}`} color="#f44336" bgColor="#FFEBEE" />
        <StatCard icon={FaChartLine} title="Monthly Income" value="$92,500" color="#4CAF50" bgColor="#E8F5E9" />
        <StatCard icon={FaChartLine} title="Monthly Expenses" value="$78,200" color="#FF9800" bgColor="#FFF3E0" />
        <StatCard icon={FaUsers} title="Staff Payroll (Jan)" value="$45,000" color="#1a1a2e" bgColor="#E8EAF6" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Recent Transactions</h3>
          {['Payment - John Doe - $500', 'Payment - Jane Smith - $450', 'Expense - Supplies - $1,200'].map(trans => (
            <div key={trans} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{trans}</div>
          ))}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px' }}>
          <h3>Fee Collection by Class</h3>
          {['Grade 12: $45,000', 'Grade 11: $42,000', 'Grade 10: $38,000'].map(fee => (
            <div key={fee} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{fee}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFees = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Fee Management</h2>
        <div><button onClick={handleCreateFeeStructure} style={buttonStyle}><FaPlus /> Fee Structure</button><button onClick={handleRecordPayment} style={{...buttonStyle, marginLeft: '10px'}}><FaMoneyBillWave /> Record Payment</button></div>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            <tr><th style={thStyle}>Student</th><th style={thStyle}>Class</th><th style={thStyle}>Total Fees</th><th style={thStyle}>Paid</th><th style={thStyle}>Balance</th><th style={thStyle}>Action</th></tr>
          </thead>
          <tbody>
            {[
              {name: 'Alice Johnson', class: 'Grade 12', total: 2500, paid: 2000, balance: 500},
              {name: 'Bob Smith', class: 'Grade 11', total: 2400, paid: 2400, balance: 0},
              {name: 'Carol White', class: 'Grade 10', total: 2300, paid: 1500, balance: 800}
            ].map((student, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{student.name}</td><td style={tdStyle}>{student.class}</td>
                <td style={tdStyle}>${student.total}</td><td style={tdStyle}>${student.paid}</td>
                <td style={tdStyle} style={{ color: student.balance > 0 ? '#f44336' : '#4CAF50' }}>${student.balance}</td>
                <td style={tdStyle}><button style={actionBtn}><FaPrint /> Receipt</button><button style={{...actionBtn, marginLeft: '5px'}}><FaEnvelope /> Reminder</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayroll = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Payroll Management</h2>
        <button onClick={handleProcessPayroll} style={buttonStyle}>Process Payroll</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%' }}>
          <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}><tr><th style={thStyle}>Staff</th><th style={thStyle}>Role</th><th style={thStyle}>Basic Salary</th><th style={thStyle}>Allowances</th><th style={thStyle}>Deductions</th><th style={thStyle}>Net Pay</th></tr></thead>
          <tbody>
            {[
              {name: 'Dr. James Wilson', role: 'Headmaster', basic: 5000, allowances: 1000, deductions: 500, net: 5500},
              {name: 'Prof. Sarah Lee', role: 'Teacher', basic: 3500, allowances: 500, deductions: 300, net: 3700}
            ].map((staff, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{staff.name}</td><td style={tdStyle}>{staff.role}</td>
                <td style={tdStyle}>${staff.basic}</td><td style={tdStyle}>${staff.allowances}</td>
                <td style={tdStyle}>${staff.deductions}</td><td style={tdStyle}>${staff.net}</td>
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
  const actionBtn = { padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#FFD700', color: '#1a1a2e', cursor: 'pointer', fontSize: '12px' };

  return (
    <>
      <PortalLayout role="accountant" user={{ name: 'Mr. Robert Chen', role: 'Accountant Admin' }} activeItem={activeItem} onItemClick={setActiveItem} onLogout={() => Swal.fire('Logged Out', '', 'success')}>
        {activeItem === 'dashboard' && renderDashboard()}
        {activeItem === 'fees' && renderFees()}
        {activeItem === 'payroll' && renderPayroll()}
      </PortalLayout>
      <MessagingModal isOpen={showMessaging} onClose={() => setShowMessaging(false)} categories={['Parents', 'Teachers', 'Students', 'Administrators']} onSend={() => {}} />
    </>
  );
};

export default AccountantAdminPortal;