import axios from 'axios';

// Create axios instance with base URL and default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/users/login', { username, password }),
  register: (username, password, confirmPassword) => api.post('/users/register', { username, password, confirmPassword }),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/me'),
  changePassword: (currentPassword, newPassword) => api.post('/users/change-password', { currentPassword, newPassword }),
};

// Car API
export const carAPI = {
  getAllCars: () => api.get('/cars'),
  getCarByPlateNumber: (plateNumber) => api.get(`/cars/${plateNumber}`),
  createCar: (carData) => api.post('/cars', carData),
  updateCar: (plateNumber, carData) => api.put(`/cars/${plateNumber}`, carData),
  deleteCar: (plateNumber) => api.delete(`/cars/${plateNumber}`),
};

// Package API
export const packageAPI = {
  getAllPackages: () => api.get('/packages'),
  getPackageByNumber: (packageNumber) => api.get(`/packages/${packageNumber}`),
  createPackage: (packageData) => api.post('/packages', packageData),
  updatePackage: (packageNumber, packageData) => api.put(`/packages/${packageNumber}`, packageData),
  deletePackage: (packageNumber) => api.delete(`/packages/${packageNumber}`),
};

// Service API
export const serviceAPI = {
  getAllServices: () => api.get('/services'),
  getServiceByRecordNumber: (recordNumber) => api.get(`/services/${recordNumber}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (recordNumber, serviceData) => api.put(`/services/${recordNumber}`, serviceData),
  deleteService: (recordNumber) => api.delete(`/services/${recordNumber}`),
  getServicesByPlateNumber: (plateNumber) => api.get(`/services/car/${plateNumber}`),
  getServicesByDateRange: (startDate, endDate) => api.get(`/services/date-range/${startDate}/${endDate}`),
};

// Payment API
export const paymentAPI = {
  getAllPayments: () => api.get('/payments'),
  getPaymentByNumber: (paymentNumber) => api.get(`/payments/${paymentNumber}`),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePayment: (paymentNumber, paymentData) => api.put(`/payments/${paymentNumber}`, paymentData),
  deletePayment: (paymentNumber) => api.delete(`/payments/${paymentNumber}`),
  getPaymentsByRecordNumber: (recordNumber) => api.get(`/payments/service/${recordNumber}`),
  getPaymentsByDateRange: (startDate, endDate) => api.get(`/payments/date-range/${startDate}/${endDate}`),
  getTotalRevenueByDateRange: (startDate, endDate) => api.get(`/payments/revenue/${startDate}/${endDate}`),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: () => api.get('/dashboard'),
  getRevenueByDateRange: (startDate, endDate) => api.get(`/dashboard/revenue/${startDate}/${endDate}`),
  getServiceStatsByDateRange: (startDate, endDate) => api.get(`/dashboard/services/${startDate}/${endDate}`),
  getPackagePopularityStats: () => api.get('/dashboard/packages/popularity'),
};

// Add request interceptor for handling errors
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
