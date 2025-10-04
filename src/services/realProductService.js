import { apiService } from './apiService';
// Removed import of mock data to force using only MongoDB data

// Helper function to sanitize query parameters
const sanitizeQueryParams = (queryParams) => {
  if (!queryParams) return '';
  
  // Check for function references in the query - more comprehensive detection
  if (queryParams.includes('function') || queryParams.includes('[Function:') || queryParams.includes('[native code]')) {
    console.warn('⚠️ Detected function in query parameters:', queryParams);
    
    // More thorough cleanup of query string to remove any function references
    // Remove any parameter that contains function reference
    queryParams = queryParams.replace(/([?&])[^=&]+=function[^&]*/g, '$1');
    queryParams = queryParams.replace(/([?&])[^=&]+=\[native code\][^&]*/g, '$1');
    
    // Also handle specific cases
    queryParams = queryParams.replace(/([?&])(category\.sub|category\.main)=function[^&]*/g, '$1');
    
    // Fix any double && or trailing & or ? in the query
    queryParams = queryParams.replace(/(\?|&)(&)/g, '$1');
    queryParams = queryParams.replace(/[?&]$/g, '');
    queryParams = queryParams.replace(/\?&/g, '?');
    
    // If we've removed everything and just have a question mark, return empty string
    if (queryParams === '?') {
      queryParams = '';
    }
    
    console.log('🔧 Sanitized query parameters:', queryParams);
  }
  
  return queryParams;
};

// Special handling for page and limit parameters to avoid issues
const buildSafePageQuery = (page = 1, limit = 10) => {
  // Ensure page and limit are valid numbers
  const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  
  return `?page=${safePage}&limit=${safeLimit}`;
};

// Product service with real API and fallback to mock data
export const productService = {
  getAllProducts: async (queryParams = '') => {
    try {
      // Check if queryParams contains pagination info
      let hasPagination = queryParams.includes('page=') || queryParams.includes('limit=');
      
      // If no pagination and queryParams has other filters, extract them
      let filters = '';
      if (!hasPagination && queryParams) {
        if (queryParams.startsWith('?')) {
          filters = queryParams;
        } else {
          filters = `?${queryParams.startsWith('&') ? queryParams.substring(1) : queryParams}`;
        }
        
        // Add safe pagination to existing filters
        queryParams = buildSafePageQuery(1, 10) + filters.replace('?', '&');
      } else if (!hasPagination) {
        // No pagination and no filters, use default safe pagination
        queryParams = buildSafePageQuery(1, 10);
      }
      
      // Sanitize the query parameters
      queryParams = sanitizeQueryParams(queryParams);
      
      // Try to use the real API
      console.log(`Fetching products from real API: /products${queryParams}`);
      
        // Use apiService instead of direct fetch
      try {
        // Use safer direct fetch that avoids passing functions in the URL
        let cleanUrl = `http://localhost:5000/api/products${queryParams}`;
        
        // Additional URL cleaning to ensure all function references are removed
        cleanUrl = cleanUrl.replace(/function[^&]*/g, '');
        cleanUrl = cleanUrl.replace(/\[native code\][^&]*/g, '');
        cleanUrl = cleanUrl.replace(/(\?|&)(&)/g, '$1'); // Fix double &&
        cleanUrl = cleanUrl.replace(/[?&]$/g, ''); // Remove trailing ? or &
        
        console.log('Clean URL:', cleanUrl);
        
        const response = await fetch(cleanUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });        if (!response.ok) {
          console.error(`❌ API error: ${response.status} ${response.statusText}`);
          throw new Error(`API returned error: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log('Raw API response:', jsonData);
        
        // Check if this is MongoDB data (success + data property) or mock data (array)
        if (jsonData && jsonData.success === true && Array.isArray(jsonData.data)) {
          console.log('✅ Using MONGODB DATA - Found MongoDB product structure');
          return jsonData.data; // Return the actual data array
        } else if (Array.isArray(jsonData)) {
          console.log('⚠️ Using ARRAY DATA - Found direct array structure');
          return jsonData; // Return the array directly
        } else {
          console.error('❌ Invalid API response format:', jsonData);
          throw new Error('Invalid API response format');
        }
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Error fetching products from MongoDB:', error.message);
      // No fallback to mock data - show error and return empty array
      console.log('⚠️ Returning empty products array - no mock data fallback');
      return [];
    }
  },

  getProductById: async (id) => {
    try {
      // Try to use the real API
      const response = await apiService.get(`/products/${id}`, false);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching product ${id} from MongoDB:`, error.message);
      // No fallback to mock data - throw error
      throw new Error(`Product ${id} not found in database`);
    }
  },

  getProductsByCategory: async (categoryName) => {
    try {
      // Get category ID first by slug/name
      const categoryResponse = await apiService.get('/categories', false);
      const category = categoryResponse.data.find(c => c.name.toLowerCase() === categoryName.toLowerCase() || 
                                                  c.slug === categoryName.toLowerCase());
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Handle both category formats (legacy and new structure with main/sub)
      // First try with the new structure
      let response;
      try {
        // Try the new structure first
        console.log(`Trying new category structure: /products?category.main=${category._id}`);
        response = await apiService.get(`/products?category.main=${category._id}`, false);
      } catch (err) {
        console.log('New category structure failed, falling back to legacy format');
        // Fall back to legacy format
        response = await apiService.get(`/products?category=${category._id}`, false);
      }
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categoryName} from MongoDB:`, error.message);
      // No fallback to mock data - return empty array
      return [];
    }
  },

  getFeaturedProducts: async () => {
    try {
      // Try to use the real API
      const response = await apiService.get('/products?featured=true', false);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching featured products from MongoDB:', error.message);
      // No fallback to mock data - return empty array
      return [];
    }
  },

  searchProducts: async (query) => {
    try {
      // Try to use the real API
      const response = await apiService.get(`/products?name=${query}`, false);
      return response.data;
    } catch (error) {
      console.error(`❌ Error searching for products with query "${query}" in MongoDB:`, error.message);
      // No fallback to mock data - return empty array
      return [];
    }
  },

  getAllCategories: async () => {
    try {
      // Try to use the real API with direct fetch
      console.log('Fetching categories from real API: /categories');
      
      // Direct fetch to bypass any potential middleware issues
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API returned error: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Raw API categories response:', jsonData);
      
      // Check if this is MongoDB data (success + data property) or mock data (array)
      if (jsonData && jsonData.success === true && Array.isArray(jsonData.data)) {
        console.log('✅ Using MONGODB CATEGORIES - Found MongoDB structure');
        return jsonData.data; // Return the actual data array
      } else if (Array.isArray(jsonData)) {
        console.log('⚠️ Using ARRAY CATEGORIES - Found direct array structure');
        return jsonData; // Return the array directly
      } else {
        console.error('❌ Invalid API categories response format:', jsonData);
        throw new Error('Invalid API categories response format');
      }
    } catch (error) {
      console.error('❌ Error fetching categories from MongoDB:', error.message);
      // No fallback to mock data - return empty array
      console.log('⚠️ Returning empty categories array - no mock data fallback');
      return [];
    }
  },

  // Method for handling nested categories (like desk-organizers/pen-stands)
  getProductsByNestedCategory: async (mainCategoryName, subCategoryName) => {
    try {
      // Try multiple path formats to maximize chance of finding products
      const pathVariations = [
        `/category/${mainCategoryName}/${subCategoryName}`,       // Standard format
        `/category/${mainCategoryName}/${subCategoryName}/`,      // With trailing slash
        `category/${mainCategoryName}/${subCategoryName}`,        // Without leading slash
        `category/${mainCategoryName}/${subCategoryName}/`,       // Without leading slash, with trailing slash
        `/${mainCategoryName}/${subCategoryName}`                 // Shorter format
      ];
      
      console.log('🔍 Trying metadata.categoryPath lookup with multiple variations in productService');
      
      // Try each path variation sequentially
      for (const fullPath of pathVariations) {
        console.log(`🔍 Searching for products with path variation: ${fullPath}`);
        
        try {
          // Important: DON'T encode the slashes in the path, but DO encode other special characters
          // This ensures that `/category/desk-organizers/pen-stands` remains intact
          const encodedPath = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
          console.log('🔍 Encoded path for API in realProductService:', encodedPath);
          
          // Direct fetch to bypass any potential issues with the api service
          const response = await fetch(`http://localhost:5000/api/products?metadata.categoryPath=${encodedPath}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!response.ok) {
            console.log(`⚠️ API error when searching by metadata.categoryPath (${fullPath}): ${response.status}`);
            continue; // Try next variation
          }
          
          const metadataResponse = await response.json();
          
          if (metadataResponse && metadataResponse.success && 
              metadataResponse.data && metadataResponse.data.length > 0) {
            console.log(`✅ Found ${metadataResponse.data.length} products with metadata.categoryPath (${fullPath})`);
            return metadataResponse.data;
          } else {
            console.log(`⚠️ No products found with metadata.categoryPath: ${fullPath}, trying next variation`);
          }
        } catch (err) {
          console.log(`⚠️ Error searching by metadata.categoryPath (${fullPath}): ${err.message}`);
          // Continue with next variation
        }
      }
      
      console.log('⚠️ No products found with any metadata.categoryPath variation, trying additional approaches');
      
      // Try with direct metadata fields as an additional fallback
      try {
        // Convert dashed category names to display format (spaces and capitalization)
        const mainDisplayName = mainCategoryName.replace(/-/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const subDisplayName = subCategoryName.replace(/-/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          
        console.log(`🔍 Trying direct metadata fields search with: ${mainDisplayName}, ${subDisplayName}`);
        
        const metadataFieldsResponse = await fetch(
          `http://localhost:5000/api/products?metadata.mainCategory=${encodeURIComponent(mainDisplayName)}&metadata.subcategory=${encodeURIComponent(subDisplayName)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        if (metadataFieldsResponse.ok) {
          const metadataFieldsData = await metadataFieldsResponse.json();
          if (metadataFieldsData && metadataFieldsData.success && 
              metadataFieldsData.data && metadataFieldsData.data.length > 0) {
            console.log(`✅ Found ${metadataFieldsData.data.length} products with direct metadata fields`);
            return metadataFieldsData.data;
          }
        }
        
        console.log('⚠️ Direct metadata fields search failed, continuing with other methods');
      } catch (metadataFieldsError) {
        console.log('⚠️ Error in direct metadata fields search:', metadataFieldsError.message);
      }
      
      // Get all categories as fallback
      const categoriesResponse = await apiService.get('/categories', false);
      const categories = categoriesResponse.data;
      
      // Find main category
      const mainCategory = categories.find(c => c.name.toLowerCase().includes(mainCategoryName.toLowerCase()) || 
                                            c.slug === mainCategoryName.toLowerCase() ||
                                            c.slug.includes(mainCategoryName.toLowerCase()));
      
      // Find subcategory
      const subCategory = categories.find(c => c.name.toLowerCase().includes(subCategoryName.toLowerCase()) || 
                                           c.slug === subCategoryName.toLowerCase() ||
                                           c.slug.includes(subCategoryName.toLowerCase()));
      
      if (!mainCategory && !subCategory) {
        // Before giving up, try one more approach with metadata fields
        console.log('🔍 Trying alternative metadata search with regex');
        const altQueryParams = `?metadata[mainCategory][regex]=${encodeURIComponent(mainCategoryName.replace(/-/g, ' '))}&metadata[mainCategory][options]=i&metadata[subcategory][regex]=${encodeURIComponent(subCategoryName.replace(/-/g, ' '))}&metadata[subcategory][options]=i`;
        try {
          const metadataAltResponse = await apiService.get(`/products${altQueryParams}`, false);
          if (metadataAltResponse && metadataAltResponse.data && metadataAltResponse.data.length > 0) {
            console.log(`✅ Found ${metadataAltResponse.data.length} products with metadata fields`);
            return metadataAltResponse.data;
          }
        } catch (err) {
          console.log(`⚠️ Error searching by alternative metadata approach: ${err.message}`);
        }
        throw new Error('Categories not found');
      }
      
      // Build query based on what we found
      let queryParams = '';
      
      if (mainCategory && subCategory) {
        // If we found both, query by both main and sub categories
        // Make sure we're using string values for the IDs and not function references
        const mainId = typeof mainCategory._id === 'function' ? '' : mainCategory._id;
        const subId = typeof subCategory._id === 'function' ? '' : subCategory._id;
        
        console.log('Main category ID:', mainId);
        console.log('Sub category ID:', subId);
        
        if (mainId && subId) {
          queryParams = `?category.main=${mainId}&category.sub=${subId}`;
        } else {
          // Fall back to just the names if we don't have valid IDs
          queryParams = `?name[regex]=${mainCategoryName.replace(/-/g, ' ')}|${subCategoryName.replace(/-/g, ' ')}&name[options]=i`;
        }
      } else if (mainCategory) {
        // If only main category found, query by main and filter by subcategory name
        const mainId = typeof mainCategory._id === 'function' ? '' : mainCategory._id;
        if (mainId) {
          queryParams = `?category.main=${mainId}&name[regex]=${subCategoryName.replace(/-/g, ' ')}&name[options]=i`;
        } else {
          queryParams = `?name[regex]=${mainCategoryName.replace(/-/g, ' ')}&name[options]=i`;
        }
      } else if (subCategory) {
        // If only subcategory found, query by subcategory only
        const subId = typeof subCategory._id === 'function' ? '' : subCategory._id;
        if (subId) {
          queryParams = `?category.sub=${subId}`;
        } else {
          queryParams = `?name[regex]=${subCategoryName.replace(/-/g, ' ')}&name[options]=i`;
        }
      }
      
      // Get products by constructed query
      console.log(`Fetching nested category products with: ${queryParams}`);
      const response = await apiService.get(`/products${queryParams}`, false);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching products for nested categories: ${error.message}`);
      return [];
    }
  },
  
  // Additional methods for cart and checkout
  createOrder: async (orderData) => {
    try {
      // Try to use the real API
      const response = await apiService.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating order in MongoDB:', error.message);
      // No fallback to mock data - throw error
      throw new Error('Failed to create order in database: ' + error.message);
    }
  }
};
