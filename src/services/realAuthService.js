import { apiService } from './apiService';

// Authentication service with real API and fallback to mock data
export const authService = {
  login: async (email, password) => {
    // Use the real API
    const response = await apiService.post('/auth/login', { email, password }, false);
    
    // Store user data in local storage
    localStorage.setItem('user', JSON.stringify(response));
    
    return response.user;
  },

  register: async (userData) => {
    // Use the real API
    const response = await apiService.post('/auth/register', userData, false);
    
    // Store user data in local storage
    localStorage.setItem('user', JSON.stringify(response));
    
    return response.user;
  },

  forgotPassword: async (email) => {
    // Use the real API
    return await apiService.post('/auth/forgotpassword', { email }, false);
  },

  resetPassword: async (resetToken, newPassword) => {
    // Use the real API
    return await apiService.put(`/auth/resetpassword/${resetToken}`, { password: newPassword }, false);
  },

  logout: () => {
    // Remove user from local storage
    localStorage.removeItem('user');
    
    // API call to logout
    try {
      apiService.get('/auth/logout');
    } catch (error) {
      console.warn('Error logging out:', error.message);
    }
  },

  getCurrentUser: () => {
    try {
      // Get user from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.user;
    } catch (error) {
      return null;
    }
  },

  updateProfile: async (userData) => {
    // Use the real API
    return await apiService.put('/auth/updatedetails', userData);
  },

  updatePassword: async (passwordData) => {
    // Use the real API
    return await apiService.put('/auth/updatepassword', passwordData);
  },

  // Get user orders (used in profile page)
  getUserOrders: async () => {
    // Use the real API
    return await apiService.get('/orders/myorders');
  }
};
