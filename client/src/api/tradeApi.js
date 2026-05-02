import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });// ===== Trade CRUD =====
export const fetchTrades = () => API.get('/trades');
export const fetchTrade = (id) => API.get(`/trades/${id}`);
export const createTrade = (data) => API.post('/trades', data);
export const updateTrade = (id, data) => API.put(`/trades/${id}`, data);
export const deleteTrade = (id) => API.delete(`/trades/${id}`);

// ===== Analytics =====
export const fetchAnalytics = () => API.get('/analytics');

// ===== AI Coach =====
export const getAICoachInsights = () => API.post('/ai-coach');

export default API;
