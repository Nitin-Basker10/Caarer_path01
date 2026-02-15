// src/api/apiService.js
const API_URL = 'http://localhost:5050/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const authAPI = {
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }
};

export const progressAPI = {
  getProgress: async () => {
    const res = await fetch(`${API_URL}/progress`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(res);
  },

  completeSkill: async (skillName) => {
    const res = await fetch(`${API_URL}/progress/complete-skill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ skillName })
    });
    return handleResponse(res);
  }
};