import { apiService } from './apiService';

// Helper function for slug normalization
const normalizeSlug = (slug) => {
  if (!slug) return '';
  
  // Decode URL encoded characters if present first
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    console.log('Failed to decode slug:', slug);
  }
  
  // Lowercase the slug
  let normalizedSlug = decodedSlug.toLowerCase();
  
  // Replace special characters with standard ones (for example & with and)
  normalizedSlug = normalizedSlug
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/@/g, 'at')
    .replace(/\./g, 'dot');
  
  // Replace spaces with hyphens
  normalizedSlug = normalizedSlug.replace(/\s+/g, '-');
  
  // Ensure consistent format by replacing multiple hyphens with single hyphen
  normalizedSlug = normalizedSlug.replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  normalizedSlug = normalizedSlug.replace(/^-|-$/g, '');
  
  return normalizedSlug;
};

// Product services using real API
export const productService = {
  getAllProducts: async () => {
    const response = await apiService.get('/products');
    return response.data;
  },

  getProductById: async (id) => {
    try {
      const response = await apiService.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Product not found');
    }
  },

  getProductsByCategory: async (categoryName) => {
    try {
      const response = await apiService.get(`/products?category=${categoryName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await apiService.get('/products?featured=true');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await apiService.get(`/products/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  getAllCategories: async () => {
    try {
      const response = await apiService.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  // Enhanced method for handling nested categories with better format handling
  getProductsByNestedCategory: async (mainCategory, subcategory) => {
    try {
      // Normalize slugs to ensure consistent format
      const normalizedMainCategory = normalizeSlug(mainCategory);
      const normalizedSubcategory = normalizeSlug(subcategory);
      
      console.log(`🔍 Fetching products by nested category: ${normalizedMainCategory}/${normalizedSubcategory}`);
      console.log(`🔍 Original slugs: ${mainCategory}/${subcategory}`);
      
      // Map specific category slugs to their exact database format
      // This handles special cases where the database format is different from the URL format
      const categoryMappings = {
        "art-craft": "ART AND CRAFT",
        "art-and-craft": "ART AND CRAFT",
        "office-stationery": "OFFICE STATIONERY",
        "housekeeping-materials": "HOUSEKEEPING MATERIALS",
        "desk-organizers": "DESK ORGANIZERS",
        "it-electrical": "IT AND ELECTRICAL",
        "it-and-electrical": "IT AND ELECTRICAL",
        "pantry-supplies": "PANTRY SUPPLIES",
        "safety-equipment": "SAFETY EQUIPMENT",
        "packaging-materials": "PACKAGING MATERIALS",
        "corporate-gifts": "CORPORATE GIFTS"
      };
      
      // Subcategory mappings for special cases where the database format differs from URL format
      const subcategoryMappings = {
        // Format: "slug": "DATABASE_FORMAT"
        // Housekeeping Materials subcategories
        "handwash": "HANDWASH",
        "disinfectants": "DISINFECTANTS",
        "floor-cleaners": "FLOOR CLEANERS",
        "glass-cleaners": "GLASS CLEANERS",
        "surface-cleaners": "SURFACE CLEANERS",
        "toilet-cleaners": "TOILET CLEANERS",
        "brooms-brushes": "BROOMS & BRUSHES",
        "mops-wipers": "MOPS & WIPERS",
        "dustbins": "DUSTBINS",
        "dusters-sponges": "DUSTERS & SPONGES",
        "garbage-bags": "GARBAGE BAGS",
        "toilet-paper": "TOILET PAPER",
        "paper-napkins": "PAPER NAPKINS",
        "room-fresheners": "ROOM FRESHENERS",
        "hand-dryers": "HAND DRYERS",
        
        // Office Stationery subcategories
        "pen-stands": "PEN STANDS",
        "coloring-books": "COLORING BOOKS",
        "desk-organizers": "DESK ORGANIZERS",
        "file-folders": "FILE FOLDERS",
        "paper-clips": "PAPER CLIPS",
        "paper-pins": "PAPER PINS",
        "staplers": "STAPLERS",
        "notebooks": "NOTEBOOKS",
        
        // IT and Electrical subcategories
        "keyboards": "KEYBOARDS",
        "mouse-devices": "MOUSE DEVICES",
        "cables-adaptors": "CABLES & ADAPTORS",
        "storage-devices": "STORAGE DEVICES",
        
        // Safety Equipment subcategories
        "first-aid": "FIRST AID",
        "safety-signs": "SAFETY SIGNS",
        "gloves": "GLOVES",
        
        // Pantry Supplies subcategories
        "coffee-tea": "COFFEE & TEA",
        "beverages": "BEVERAGES",
        "snacks": "SNACKS"
      };
      
      // Standard conversion for categories not in the mapping
      let mainCategoryName;
      if (categoryMappings[normalizedMainCategory]) {
        mainCategoryName = categoryMappings[normalizedMainCategory];
      } else {
        mainCategoryName = normalizedMainCategory.replace(/-/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      
      // Convert dashed subcategory to display format (spaces and capitalization)
      let subCategoryName;
      if (subcategoryMappings[normalizedSubcategory]) {
        subCategoryName = subcategoryMappings[normalizedSubcategory];
        console.log(`Using mapped subcategory name: ${normalizedSubcategory} -> ${subCategoryName}`);
      } else {
        subCategoryName = normalizedSubcategory.replace(/-/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      
      console.log(`🔍 Looking for products with mainCategory="${mainCategoryName}" and subcategory="${subCategoryName}"`);
      
      // Try multiple API approaches to maximize chance of finding products
      
      // Approach 0: Try categoryPath with exact path format first (this works well for office-stationery)
      const exactCategoryPath = `/category/${normalizedMainCategory}/${normalizedSubcategory}`;
      let queryParams = `metadata.categoryPath=${encodeURIComponent(exactCategoryPath)}`;
      console.log(`🔍 Using categoryPath query params: ${queryParams}`);
      let response = await apiService.get(`/products?${queryParams}`);
      
      // Check if we have results with the categoryPath approach
      if (response && response.data && response.data.data && 
          Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log(`✅ Found ${response.data.data.length} products with categoryPath match`);
        return response.data;
      }
      
      // Approach 1: Try exact metadata match with both formats
      // First try with exact match
      queryParams = `metadata.mainCategory=${encodeURIComponent(mainCategoryName)}&metadata.subcategory=${encodeURIComponent(subCategoryName)}`;
      console.log(`🔍 Using primary query params: ${queryParams}`);
      response = await apiService.get(`/products?${queryParams}`);
      
      // If no results and we have special characters in subcategory name (like & or +), try alternatives
      if ((!response?.data?.data || response?.data?.data?.length === 0) && 
          (subCategoryName.includes('&') || subCategoryName.includes('+'))) {
        console.log(`⚠️ No results with exact match, trying alternatives for special characters`);
        
        // Try with "AND" instead of "&"
        let alternativeSubName = subCategoryName.replace(/&/g, 'AND');
        if (alternativeSubName !== subCategoryName) {
          const altQueryParams = `metadata.mainCategory=${encodeURIComponent(mainCategoryName)}&metadata.subcategory=${encodeURIComponent(alternativeSubName)}`;
          console.log(`🔍 Trying alternative with "AND" instead of "&": ${altQueryParams}`);
          const altResponse = await apiService.get(`/products?${altQueryParams}`);
          
          // If we found products with this alternative, use it
          if (altResponse?.data?.data && altResponse.data.data.length > 0) {
            console.log(`✅ Found ${altResponse.data.data.length} products with "AND" alternative`);
            response = altResponse;
          }
        }
      }
      
      // Check if we have results with the first approach
      if (response && response.data && response.data.data && 
          Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log(`✅ Found ${response.data.data.length} products with exact metadata match`);
        return response.data;
      }
      
      console.log(`⚠️ No results with exact match, trying case-insensitive search`);
      
      // Approach 2: Try case-insensitive regex search
      queryParams = `metadata.mainCategory[regex]=${encodeURIComponent(mainCategoryName)}&metadata.mainCategory[options]=i&metadata.subcategory[regex]=${encodeURIComponent(subCategoryName)}&metadata.subcategory[options]=i`;
      console.log(`🔍 Using regex query params: ${queryParams}`);
      response = await apiService.get(`/products?${queryParams}`);
      
      // Check if we have results with the second approach
      if (response && response.data && response.data.data && 
          Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log(`✅ Found ${response.data.data.length} products with case-insensitive match`);
        return response.data;
      }
      
      console.log(`⚠️ No results with case-insensitive search, trying other path variations`);
      
      // Approach 3: Try other categoryPath variations
      const pathVariations = [
        // With category prefix
        `/category/${normalizedMainCategory}/${normalizedSubcategory}/`,  // with trailing slash
        `category/${normalizedMainCategory}/${normalizedSubcategory}`,   // without leading slash
        `category/${normalizedMainCategory}/${normalizedSubcategory}/`,  // without leading, with trailing
        
        // Direct path
        `/${normalizedMainCategory}/${normalizedSubcategory}`,           // direct path with leading slash
        `/${normalizedMainCategory}/${normalizedSubcategory}/`,          // direct with trailing
        `${normalizedMainCategory}/${normalizedSubcategory}`             // simple path
      ];
      
      // Try each path variation
      for (const pathVar of pathVariations) {
        queryParams = `metadata.categoryPath=${encodeURIComponent(pathVar)}`;
        console.log(`🔍 Trying path variation: ${pathVar}`);
        response = await apiService.get(`/products?${queryParams}`);
        
        // Check if we have results
        if (response && response.data && response.data.data && 
            Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log(`✅ Found ${response.data.data.length} products with path variation: ${pathVar}`);
          return response.data;
        }
      }
      
      // Check if we have results with the third approach
      if (response && response.data && response.data.data && 
          Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log(`✅ Found ${response.data.data.length} products with categoryPath match`);
        return response.data;
      }
      
      console.log(`🚫 No products found for ${mainCategory}/${subcategory} using multiple approaches`);
      // Return empty results explicitly
      return { data: [], success: true, count: 0 };
    } catch (error) {
      console.error('Error fetching products by nested category:', error);
      // On error, return empty results instead of throwing
      return { data: [], success: false, count: 0 };
    }
  }
};
