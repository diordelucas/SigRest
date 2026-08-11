import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Adjust this to your backend API URL
});

export default api;
