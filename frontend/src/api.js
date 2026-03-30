import axios from 'axios';

const API = axios.create({
  baseURL: 'https://quiz-app-plf3.onrender.com', // Your Production Render URL
});

// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// AUTH
export const login = (data) => API.post('/auth/login', data).then(r => r.data);
export const signup = (data) => API.post('/auth/signup', data).then(r => r.data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data).then(r => r.data);

// QUIZ
export const getQuestions = async (params) => {
  try {
    const res = await API.get('/questions', { params });
    localStorage.setItem('cachedQuestions', JSON.stringify(res.data));
    return res.data;
  } catch (e) {
    console.warn("Offline mode activated. Loading local cache.");
    const cached = localStorage.getItem('cachedQuestions');
    if (cached) return JSON.parse(cached);
    throw e;
  }
};
export const submitQuiz = (data) => API.post('/quiz/submit', data).then(r => r.data);

// PERFORMANCE & SOCIAL
export const getLeaderboard = () => API.get('/leaderboard').then(r => r.data);
export const getHistory = (email) => API.get(`/history/${email}`).then(r => r.data);
export const getStats = () => API.get('/stats').then(r => r.data);

// BOOKMARKS
export const toggleBookmark = (data) => API.post('/bookmarks/toggle', data).then(r => r.data);
export const getBookmarks = (email) => API.get(`/bookmarks/${email}`).then(r => r.data);

// DAILY CHALLENGE
export const getDailyChallenge = () => API.get('/daily-challenge').then(r => r.data);
export const submitDailyChallenge = (data) => API.post('/daily-challenge/submit', data).then(r => r.data);

// ADMIN
export const addQuestion = (data) => API.post('/admin/questions', data).then(r => r.data);
export const deleteQuestion = (id) => API.delete(`/admin/questions/${id}`).then(r => r.data);
export const getAllUsers = () => API.get('/admin/users').then(r => r.data);
export const deleteAccount = (identifier) => API.delete(`/users/${identifier}`).then(r => r.data);

export default API;
