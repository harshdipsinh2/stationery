// Base API configuration
const API_URL = 'http://localhost:5000/api'; // Updated port to 5000 to match backend

// Helper function for handling API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data?.error || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

// Get authentication token from local storage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Common headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// API service with common fetch methods
export const apiService = {
  // Helper function to clean URL parameters
  _cleanEndpoint: (endpoint) => {
    // Check if the endpoint contains function parameters or native code references
    if (endpoint.includes('function') || endpoint.includes('[native code]')) {
      console.warn('Detected function in endpoint URL:', endpoint);
      
      // Replace function sub() references with more comprehensive patterns
      endpoint = endpoint.replace(/function\s+sub\(\)\s+\{\s*\[native\s+code\]\s*\}/g, '');
      endpoint = endpoint.replace(/function[^&=]*/, ''); // More aggressive removal
      endpoint = endpoint.replace(/\[native\s+code\][^&=]*/, ''); // Remove native code references
      
      // Remove any parameter containing function
      endpoint = endpoint.replace(/([?&])[^=&]+=function[^&]*/g, '$1');
      endpoint = endpoint.replace(/([?&])[^=&]+=\[native code\][^&]*/g, '$1');
      
      // Clean up any resulting malformed query strings
      endpoint = endpoint.replace(/(\?|&)(&|$)/g, '$1');
      endpoint = endpoint.replace(/[?&]$/g, '');
      endpoint = endpoint.replace(/\?&/g, '?');
      
      // If we've removed everything and just have a question mark, remove it too
      if (endpoint.endsWith('?')) {
        endpoint = endpoint.slice(0, -1);
      }
      
      console.log('Cleaned endpoint:', endpoint);
    }
    
    return endpoint;
  },
  
  get: async (endpoint, authRequired = true) => {
    // Clean the endpoint to remove any problematic values
    endpoint = apiService._cleanEndpoint(endpoint);
    
    console.log(`API Request: GET ${API_URL}${endpoint}`);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(authRequired),
      });
      
      // Log response status
      console.log('API Response Status:', response.status, response.statusText);
      
      // Get the response data
      const responseData = await response.json().catch(e => {
        console.error('Error parsing JSON response:', e);
        return { success: false, error: 'Invalid JSON response' };
      });
      console.log('API Response Data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData?.error || response.statusText);
      }
      
      return responseData;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  },
  
  post: async (endpoint, data, authRequired = true) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(authRequired),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  put: async (endpoint, data, authRequired = true) => {
    // Clean the endpoint
    endpoint = apiService._cleanEndpoint(endpoint);
    
    console.log(`API Request: PUT ${API_URL}${endpoint}`, data);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(authRequired),
        body: JSON.stringify(data),
      });
      
      // Log response status
      console.log('API Response Status:', response.status, response.statusText);
      
      // Get the response data
      const responseData = await response.json().catch(e => {
        console.error('Error parsing JSON response:', e);
        return { success: false, error: 'Invalid JSON response' };
      });
      console.log('API Response Data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData?.error || response.statusText);
      }
      
      return responseData;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  },
  
  delete: async (endpoint, authRequired = true) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(authRequired),
    });
    return handleResponse(response);
  },
};
