// Service selector - Real MongoDB data only
import { authService } from './authService';
import { productService } from './productService';

// Function to check if backend API is available with MongoDB connected
// (Now always returns true to force using MongoDB data)
const checkBackendAvailability = async () => {
  try {
    console.log('💾 Checking MongoDB connection status - FORCING TRUE');
    
    // Log that we're using real MongoDB data
    console.log('✅ ALWAYS using real MongoDB data - mock data disabled');
    
    // Always return true to force real API mode
    return true;
  } catch (error) {
    console.warn('Backend API check error:', error.message);
    // Still return true even on error to force real API
    console.log('✅ Still forcing real API despite error');
    return true;
  }
};

// Service initialization - always use real API
export const initializeServices = async () => {
  // Always use real API (MongoDB)
  localStorage.setItem('useRealAPI', 'true');
  
  console.log('✅ ALWAYS using real MongoDB API - mock data completely disabled');
  
  // Always return true to indicate real API usage
  return true;
};

// Initialize services on load
initializeServices()
  .then(result => {
    console.log('✅ Services initialized with REAL API ONLY mode');
  })
  .catch(error => {
    console.error('Error initializing services, but still forcing real API:', error);
    // Ensure real API mode is set even if there's an error
    localStorage.setItem('useRealAPI', 'true');
  });

// Force real API permanently
localStorage.setItem('useRealAPI', 'true');
console.log('💾 MONGODB DATA ONLY - Mock data removed');

// Service exports - always return real API services
export const getAuthService = () => {
  console.log('🔒 Using MongoDB auth service');
  return authService;
};

export const getProductService = () => {
  console.log('💾 Using MongoDB product service');
  return productService;
};
