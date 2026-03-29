import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080' });

// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Endpoints
export const login = (data) => API.post('/auth/login', data).then(r => r.data);
export const signup = (data) => API.post('/auth/signup', data).then(r => r.data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data).then(r => r.data);

// Quiz Endpoints
export const getCategories = () => API.get('/categories').then(r => r.data);
export const getQuestions = (params) => API.get('/questions', { params }).then(r => r.data);
export const submitQuiz = (answers) => API.post('/quiz/submit', answers).then(r => r.data);
export const getStats = () => API.get('/stats').then(r => r.data);

export default API;
