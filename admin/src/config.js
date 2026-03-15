const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const SERVER_URL = isLocal 
  ? 'http://localhost:5000' 
  : 'https://luxe-ecommerce.onrender.com';

export const API = `${SERVER_URL}/api`;
