import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Zmień na adres swojego backendu
const API_URL = 'http://192.168.1.29:3001/api'; // dla emulatora Android: http://10.0.2.2:3001/api
// dla prawdziwego urządzenia użyj swojego IP lokalnego, np: http://192.168.1.100:3001/api

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - dodaj token do każdego żądania
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - obsługa błędów autoryzacji
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token wygasł lub jest nieprawidłowy
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Możesz tutaj przekierować do ekranu logowania
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };