import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080' });

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
export const getQuestions = (params) => API.get('/questions', { params }).then(r => r.data);
export const submitQuiz = (data) => API.post('/quiz/submit', data).then(r => r.data);

// PERFORMANCE & SOCIAL
export const getLeaderboard = () => API.get('/leaderboard').then(r => r.data);
export const getHistory = (email) => API.get(`/history/${email}`).then(r => r.data);
export const getStats = () => API.get('/stats').then(r => r.data);

// ADMIN
export const addQuestion = (data) => API.post('/admin/questions', data).then(r => r.data);

export default API;
