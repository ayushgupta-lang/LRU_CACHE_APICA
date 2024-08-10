import axios from 'axios';

const BASE_URL = 'http://localhost:8080'; 

const CacheService = {
  setKeyValue: (key, value, expiresIn) => {
    return axios.post(`${BASE_URL}/set`, { key, value, expires_in: expiresIn });
  },

  getKeyValue: (key) => {
    return axios.get(`${BASE_URL}/get?key=${key}`);
  },
};

export default CacheService;