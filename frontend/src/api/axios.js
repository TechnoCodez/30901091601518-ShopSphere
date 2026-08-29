import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://eyouth-30901091601518-shopsphere.vercel.app/api',
});

export default api;