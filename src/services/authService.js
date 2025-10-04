import { apiService } from './apiService';

// Authentication and user services using real API
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

  getUserOrders: async () => {
    // Use the real API
    return await apiService.get('/orders/myorders');
  },

  updateProfile: async (userData) => {
    // Use the real API
    console.log('authService: Updating profile with data:', userData);
    try {
      const response = await apiService.put('/auth/updatedetails', userData);
      console.log('authService: Update profile response:', response);
      
      // Update the user in local storage
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          // Update only the fields that were changed
          storedUser.user = { ...storedUser.user, ...userData };
          localStorage.setItem('user', JSON.stringify(storedUser));
          console.log('authService: Updated user in localStorage');
        }
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      
      return response;
    } catch (error) {
      console.error('authService: Error updating profile:', error);
      throw error;
    }
  },
  
  updatePassword: async (passwordData) => {
    // Use the real API
    return await apiService.put('/auth/updatepassword', passwordData);
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
  }
};
