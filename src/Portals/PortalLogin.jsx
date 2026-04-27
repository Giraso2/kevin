// Update the handleLogin function in PortalLogin.jsx
import { authAPI } from '../services/api';

const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await authAPI.login(email, password, selectedRole);
    
    localStorage.setItem('portalToken', response.token);
    localStorage.setItem('userRole', response.role);
    localStorage.setItem('userName', response.fullName);
    localStorage.setItem('userEmail', response.email);
    localStorage.setItem('userData', JSON.stringify(response));
    
    Swal.fire({
      title: 'Login Successful!',
      text: `Welcome back, ${response.fullName}!`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    // Navigate based on role
    const dashboardPaths = {
      student: '/portal/student',
      teacher: '/portal/teacher',
      parent: '/portal/parent',
      admin: '/portal/admin'
    };
    
    navigate(dashboardPaths[response.role]);
  } catch (error) {
    Swal.fire({
      title: 'Login Failed',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#1e3c72'
    });
  }
};