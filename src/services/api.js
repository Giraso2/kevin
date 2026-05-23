const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// News API
export const newsAPI = {
  getAll: (params) => fetch(`${API_URL}/news?${new URLSearchParams(params)}`).then(res => res.json()),
  getById: (id) => fetch(`${API_URL}/news/${id}`).then(res => res.json()),
  create: (data, token) => fetch(`${API_URL}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data, token) => fetch(`${API_URL}/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id, token) => fetch(`${API_URL}/news/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json())
};

// Gallery API
export const galleryAPI = {
  getAll: (params) => fetch(`${API_URL}/gallery?${new URLSearchParams(params)}`).then(res => res.json()),
  getById: (id) => fetch(`${API_URL}/gallery/${id}`).then(res => res.json()),
  create: (data, token) => fetch(`${API_URL}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data, token) => fetch(`${API_URL}/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id, token) => fetch(`${API_URL}/gallery/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json())
};

// Contact API
export const contactAPI = {
  submit: (data) => fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};

// Subscription API
export const subscriptionAPI = {
  subscribe: (email) => fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  }).then(res => res.json())
};

// Admission API
export const admissionAPI = {
  submit: (data) => fetch(`${API_URL}/admissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};

// Admin Auth API
export const adminAPI = {
  login: (credentials) => fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(res => res.json())
};