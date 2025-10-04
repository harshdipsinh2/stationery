import { createContext, useState, useEffect, useContext } from 'react';
import { getAuthService } from '../services/serviceSelector';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const authService = getAuthService();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user in localStorage on initial render
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // Handle login - use auth service
  const login = (userData) => {
    setCurrentUser(userData);
    return userData;
  };

  // Handle logout - use auth service
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Handle user registration - use auth service
  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setCurrentUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Update user profile - use auth service
  const updateUserProfile = async (userData) => {
    try {
      console.log('AuthContext: Updating user profile with data:', userData);
      
      // Call the auth service to update the profile
      const response = await authService.updateProfile(userData);
      console.log('AuthContext: Update profile response:', response);
      
      // Get updated user from the response
      const updatedUser = response.data || response;
      
      // Update localStorage with new user data
      try {
        const storedData = JSON.parse(localStorage.getItem('user'));
        if (storedData && storedData.user) {
          storedData.user = { ...storedData.user, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(storedData));
          console.log('AuthContext: Updated user in localStorage');
        }
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      
      // Update state with new user data
      const newUserState = { ...currentUser, ...updatedUser };
      setCurrentUser(newUserState);
      console.log('AuthContext: Updated current user state:', newUserState);
      
      return updatedUser;
    } catch (error) {
      console.error('AuthContext: Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user: currentUser,
    loading,
    login,
    logout,
    register,
    updateUserProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
