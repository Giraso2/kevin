import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AcademicAdminDashboard = () => {
  const [userName, setUserName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('portalToken');

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'academic_admin') {
      navigate('/portal/login');
    } else {
      setUserName(name || 'Academic Admin');
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    const token = getToken();
    try {
      const teachersRes = await fetch(`${API_URL}/academic-admin/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data);
      }
      
      const classesRes = await fetch(`${API_URL}/academic-admin/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Create Teacher',
      html: `
        <input type="text" id="fullName" class="swal2-input" placeholder="Full Name" required>
        <input type="email" id="email" class="swal2-input" placeholder="Email" required>
        <input type="password" id="password" class="swal2-input" placeholder="Password" value="teacher123">
        <input type="tel" id="phone" class="swal2-input" placeholder="Phone">
        <input type="text" id="subject" class="swal2-input" placeholder="Subject" required>
        <input type="text" id="department" class="swal2-input" placeholder="Department" required>
        <input type="number" id="salary" class="swal2-input" placeholder="Salary">
      `,
      confirmButtonText: 'Create Teacher',
      confirmButtonColor: '#27ae60',
      showCancelButton: true,
      preConfirm: () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const department = document.getElementById('department').value;
        const salary = document.getElementById('salary').value;
        
        if (!fullName || !email || !subject || !department) {
          Swal.showValidationMessage('Please fill required fields');
          return false;
        }
        return { fullName, email, password, phone, subject, department, salary: parseInt(salary) || 0 };
      }
    });

    if (formValues) {
      const token = getToken();
      const response = await fetch(`${API_URL}/academic-admin/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });
      
      if (response.ok) {
        Swal.fire('Success!', 'Teacher created successfully', 'success');
        fetchData();
      } else {
        Swal.fire('Error', 'Failed to create teacher', 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/portal/login');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Academic Admin Dashboard</h1>
      <p>Welcome, {userName}</p>
      <button onClick={handleCreateTeacher}>Create Teacher</button>
      <button onClick={handleLogout}>Logout</button>
      
      <h2>Teachers ({teachers.length})</h2>
      <ul>
        {teachers.map(t => (
          <li key={t._id}>{t.user?.fullName} - {t.subject}</li>
        ))}
      </ul>
      
      <h2>Classes ({classes.length})</h2>
      <ul>
        {classes.map(c => (
          <li key={c._id}>{c.grade} {c.className}</li>
        ))}
      </ul>
    </div>
  );
};

export default AcademicAdminDashboard;