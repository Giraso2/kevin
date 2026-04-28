// API Base URL
const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('portalToken');

// Generic request function
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  // Login user
  login: async (email, password, role) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },
  
  // Register user
  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Get current user
  getMe: async () => {
    return request('/auth/me');
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  // Forgot password
  forgotPassword: async (email) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  // Reset password
  resetPassword: async (token, newPassword) => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// ==================== STUDENT API ====================
export const studentAPI = {
  // Get student dashboard data
  getDashboard: async () => {
    return request('/student/dashboard');
  },
  
  // Get student grades
  getGrades: async () => {
    return request('/student/grades');
  },
  
  // Get student attendance
  getAttendance: async () => {
    return request('/student/attendance');
  },
  
  // Get student assignments
  getAssignments: async () => {
    return request('/student/assignments');
  },
  
  // Submit assignment
  submitAssignment: async (assignmentId, file, comment) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return response.json();
  },
  
  // Get timetable
  getTimetable: async () => {
    return request('/student/timetable');
  },
};

// ==================== TEACHER API ====================
export const teacherAPI = {
  // Get teacher dashboard
  getDashboard: async () => {
    return request('/teacher/dashboard');
  },
  
  // Get teacher's students
  getStudents: async () => {
    return request('/teacher/students');
  },
  
  // Add grade for student
  addGrade: async (data) => {
    return request('/teacher/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update grade
  updateGrade: async (gradeId, data) => {
    return request(`/teacher/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Create assignment
  createAssignment: async (data) => {
    return request('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get assignments
  getAssignments: async () => {
    return request('/teacher/assignments');
  },
  
  // Grade assignment submission
  gradeAssignment: async (submissionId, score, feedback) => {
    return request(`/teacher/assignments/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ score, feedback }),
    });
  },
  
  // Mark attendance
  markAttendance: async (data) => {
    return request('/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get attendance report
  getAttendanceReport: async (classId, date) => {
    return request(`/teacher/attendance?class=${classId}&date=${date}`);
  },
};

// ==================== PARENT API ====================
export const parentAPI = {
  // Get parent dashboard
  getDashboard: async () => {
    return request('/parent/dashboard');
  },
  
  // Get parent's children
  getChildren: async () => {
    return request('/parent/children');
  },
  
  // Get child grades
  getChildGrades: async (childId) => {
    return request(`/parent/children/${childId}/grades`);
  },
  
  // Get child attendance
  getChildAttendance: async (childId) => {
    return request(`/parent/children/${childId}/attendance`);
  },
  
  // Get child assignments
  getChildAssignments: async (childId) => {
    return request(`/parent/children/${childId}/assignments`);
  },
  
  // Pay fees
  payFees: async (data) => {
    return request('/parent/fees/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get fee status
  getFeeStatus: async () => {
    return request('/parent/fees');
  },
  
  // Schedule meeting with teacher
  scheduleMeeting: async (data) => {
    return request('/parent/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Get admin dashboard
  getDashboard: async () => {
    return request('/admin/dashboard');
  },
  
  // Get all users
  getUsers: async () => {
    return request('/admin/users');
  },
  
  // Get user by ID
  getUser: async (userId) => {
    return request(`/admin/users/${userId}`);
  },
  
  // Create user
  createUser: async (userData) => {
    return request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    return request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  // Delete user
  deleteUser: async (userId) => {
    return request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
  
  // Get all students
  getStudents: async () => {
    return request('/admin/students');
  },
  
  // Get all teachers
  getTeachers: async () => {
    return request('/admin/teachers');
  },
  
  // Get all parents
  getParents: async () => {
    return request('/admin/parents');
  },
  
  // Get statistics
  getStatistics: async () => {
    return request('/admin/statistics');
  },
  
  // Post announcement
  postAnnouncement: async (data) => {
    return request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get all announcements
  getAnnouncements: async () => {
    return request('/admin/announcements');
  },
  
  // Delete announcement
  deleteAnnouncement: async (id) => {
    return request(`/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get system settings
  getSettings: async () => {
    return request('/admin/settings');
  },
  
  // Update system settings
  updateSettings: async (settings) => {
    return request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  
  // Generate reports
  generateReport: async (type, params) => {
    return request('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    });
  },
};

// ==================== GENERAL API ====================
export const generalAPI = {
  // Get announcements (public)
  getPublicAnnouncements: async () => {
    return request('/announcements');
  },
  
  // Get upcoming events
  getUpcomingEvents: async () => {
    return request('/events/upcoming');
  },
  
  // Get gallery images
  getGallery: async () => {
    return request('/gallery');
  },
  
  // Contact form submission
  submitContact: async (formData) => {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  
  // Subscribe to newsletter
  subscribeNewsletter: async (email) => {
    return request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Default export
export default {
  authAPI,
  studentAPI,
  teacherAPI,
  parentAPI,
  adminAPI,
  generalAPI,
};