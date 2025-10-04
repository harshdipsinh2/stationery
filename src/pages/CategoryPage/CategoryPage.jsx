import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductService } from '../../services/serviceSelector';
import ProductCard from '../../components/ProductCard/ProductCard';
import FiltersPanel from '../../components/FiltersPanel/FiltersPanel';
import './CategoryPage.css';

// Debug helper to log information about the current route and parameters
const debugCategoryPath = (categoryId, subcategory) => {
  console.group('🔍 CATEGORY PATH DEBUG INFO');
  console.log('Path parameters:', { categoryId, subcategory });
  console.log('Full path:', `/category/${categoryId}${subcategory ? '/' + subcategory : ''}`);
  
  if (categoryId && subcategory) {
    // Log normalized versions
    const normalizedCat = categoryId.toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
    const normalizedSub = subcategory.toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
    console.log('Normalized path:', `/category/${normalizedCat}/${normalizedSub}`);
    
    // Log display formats
    const displayCat = categoryId.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const displaySub = subcategory.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    console.log('Display format:', `${displayCat} > ${displaySub}`);
  }
  console.groupEnd();
};

const CategoryPage = () => {
  // Extract parameters from URL - these will be used to fetch the right products
  const { categoryId: rawCategoryId, subcategory: rawSubcategory } = useParams();
  
  // Normalize the URL parameters to ensure consistent handling
  const categoryId = rawCategoryId ? rawCategoryId.toLowerCase() : '';
  const subcategory = rawSubcategory ? rawSubcategory.toLowerCase() : '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Determine the actual category to filter by
  const categoryName = subcategory || categoryId;
  
  useEffect(() => {
    // Scroll to top when category changes
    window.scrollTo(0, 0);
    
    // Debug the current category path
    debugCategoryPath(categoryId, subcategory);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let productsToShow = [];
        
        // Get the product service that uses real MongoDB API
        const productService = getProductService();
        console.log('⚠️ CATEGORY PAGE - FORCING REAL API MODE');
        localStorage.setItem('useRealAPI', 'true');
        
        // Add debug info for current route parameters
        console.log(`🚨 Current route parameters - categoryId: ${categoryId}, subcategory: ${subcategory}`);
        console.log(`🚨 Full route: /category/${categoryId}${subcategory ? '/' + subcategory : ''}`);
        
        // NEW: First try to fetch products directly by metadata.categoryPath with multiple variations
        if (categoryId && subcategory) {
          // Try multiple path formats to maximize chance of finding products
          const pathVariations = [
            `/category/${categoryId}/${subcategory}`,       // Standard format
            `/category/${categoryId}/${subcategory}/`,      // With trailing slash
            `category/${categoryId}/${subcategory}`,        // Without leading slash
            `category/${categoryId}/${subcategory}/`,       // Without leading slash, with trailing slash
            `/${categoryId}/${subcategory}`                 // Shorter format
          ];
          
          console.log('🔍 Trying metadata.categoryPath lookup with multiple variations');
          
          // Try each path variation sequentially
          for (const fullPath of pathVariations) {
            console.log('🔍 Trying path variation:', fullPath);
            
            try {
              // Important: DON'T encode the slashes in the path, but DO encode other special characters
              // This ensures that `/category/desk-organizers/pen-stands` remains intact
              const encodedPath = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
              console.log('🔍 Encoded path for API:', encodedPath);
              
              // Use a direct fetch for more reliable querying of nested fields
              const response = await fetch(`http://localhost:5000/api/products?metadata.categoryPath=${encodedPath}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (!response.ok) {
                console.log(`⚠️ API error for path ${fullPath}: ${response.status}`);
                continue; // Try next variation
              }
              
              const jsonData = await response.json();
              console.log(`📋 Products from metadata.categoryPath lookup (${fullPath}):`, jsonData);
              
              if (jsonData && jsonData.success && jsonData.data && jsonData.data.length > 0) {
                console.log(`✅ Found products with metadata.categoryPath: ${fullPath}`);
                productsToShow = jsonData.data;
                setProducts(productsToShow);
                setFilteredProducts(productsToShow);
                setIsLoading(false);
                return; // Exit early if we found products
              } else {
                console.log(`⚠️ No products found with path: ${fullPath}, trying next variation`);
              }
            } catch (error) {
              console.error(`❌ Error looking up by metadata.categoryPath (${fullPath}):`, error);
              // Continue with next path variation
            }
          }
          
          console.log('⚠️ No products found with any metadata.categoryPath variation, continuing with other methods');
        }
        
        // ALSO try metadata.categoryPath lookup for single-level categories (like "office-stationery")
        if (categoryId && !subcategory) {
          console.log('🔍 Trying single-level category metadata.categoryPath lookup');
          
          const singlePathVariations = [
            `/category/${categoryId}`,           // Standard format: /category/office-stationery
            `/category/${categoryId}/`,          // With trailing slash
            `category/${categoryId}`,            // Without leading slash
            `/${categoryId}`                     // Short format
          ];
          
          // Try each single path variation
          for (const fullPath of singlePathVariations) {
            console.log('🔍 Trying single path variation:', fullPath);
            
            try {
              const encodedPath = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
              console.log('🔍 Encoded single path for API:', encodedPath);
              
              const response = await fetch(`http://localhost:5000/api/products?metadata.categoryPath=${encodedPath}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (!response.ok) {
                console.log(`⚠️ API error for single path ${fullPath}: ${response.status}`);
                continue;
              }
              
              const jsonData = await response.json();
              console.log(`📋 Products from single metadata.categoryPath lookup (${fullPath}):`, jsonData);
              
              if (jsonData && jsonData.success && jsonData.data && jsonData.data.length > 0) {
                console.log(`✅ Found products with single metadata.categoryPath: ${fullPath}`);
                productsToShow = jsonData.data;
                setProducts(productsToShow);
                setFilteredProducts(productsToShow);
                setIsLoading(false);
                return; // Exit early if we found products
              } else {
                console.log(`⚠️ No products found with single path: ${fullPath}, trying next variation`);
              }
            } catch (error) {
              console.error(`❌ Error looking up by single metadata.categoryPath (${fullPath}):`, error);
            }
          }
          
          console.log('⚠️ No products found with any single metadata.categoryPath variation, continuing with other methods');
        }
        
        // Try to find category by slug in MongoDB
        console.log('🔍 Fetching categories from MongoDB API');
        const categoriesResponse = await productService.getAllCategories();
        console.log('📋 Categories from MongoDB API:', categoriesResponse);
        
        // MongoDB returns data differently than mock data
        const categoriesData = Array.isArray(categoriesResponse) 
          ? categoriesResponse 
          : (categoriesResponse.data || []);
          
        let queryParams = '';
          
        if (categoryId) {
          // The URL format might be /category/desk-organizers/pen-stands
          // Where desk-organizers is the main category and pen-stands is the subcategory
          // Or it might be directly a subcategory path
          
          // Process the categoryId which might be a path like "desk-organizers"
          const categoryPathParts = categoryId.split('-');
          const categoryNameSearch = categoryPathParts.join(' ');
          
          console.log('🔍 Searching for main category:', categoryNameSearch);
          
          // Try to find the main category
          const category = categoriesData.find(cat => 
            cat.slug === categoryId || 
            cat.name.toLowerCase() === categoryId.toLowerCase() ||
            cat.name.toLowerCase().includes(categoryNameSearch.toLowerCase())
          );
          
          if (category) {
            console.log('✅ Found main category in MongoDB:', category);
            
            // Check if we're using the new category structure with main/sub
            if (subcategory) {
              // Clean up the subcategory string (convert dash to space)
              const subCategoryParts = subcategory.split('-');
              const subCategorySearch = subCategoryParts.join(' ');
              console.log('🔍 Searching for subcategory:', subCategorySearch);
              
              // Try to find a matching subcategory object in the categories
              const subcategoryObj = categoriesData.find(cat => 
                cat.slug === subcategory || 
                cat.name.toLowerCase() === subcategory.toLowerCase() ||
                cat.name.toLowerCase().includes(subCategorySearch.toLowerCase())
              );
              
              if (subcategoryObj) {
                console.log('✅ Found subcategory in MongoDB:', subcategoryObj);
                
                // Make sure we have valid IDs before constructing the query
                const mainId = category._id && typeof category._id !== 'function' ? category._id : null;
                const subId = subcategoryObj._id && typeof subcategoryObj._id !== 'function' ? subcategoryObj._id : null;
                
                console.log('Main category ID for query:', mainId);
                console.log('Sub category ID for query:', subId);
                
                if (mainId && subId) {
                  // Using the new category structure with main and sub fields
                  // Search for products with both main and sub category matching
                  queryParams = `?category.main=${mainId}&category.sub=${subId}`;
                } else {
                  // Fall back to a name-based query
                  queryParams = `?name[regex]=${categoryNameSearch}|${subCategorySearch}&name[options]=i`;
                }
              } else {
                // No subcategory found, but we can still search by main category and name
                queryParams = `?category.main=${category._id}&name[regex]=${subCategorySearch}&name[options]=i`;
              }
            } else {
              // No subcategory in URL, just search by main category
              queryParams = `?category.main=${category._id}`;
            }
          } else if (subcategory) {
            // If we can't find the main category but have a subcategory,
            // let's try different approaches to find products
            
            console.log('❌ Main category not found, trying alternative approaches for:', subcategory);
            const subCategoryParts = subcategory.split('-');
            const subCategorySearch = subCategoryParts.join(' ');
            
            // Try to find the subcategory directly in categories
            const subcategoryObj = categoriesData.find(cat => 
              cat.slug === subcategory || 
              cat.name.toLowerCase() === subcategory.toLowerCase() ||
              cat.name.toLowerCase().includes(subCategorySearch.toLowerCase())
            );
            
            if (subcategoryObj) {
              console.log('✅ Found subcategory object in MongoDB:', subcategoryObj);
              // Search by subcategory in the category.sub field
              queryParams = `?category.sub=${subcategoryObj._id}`;
            } else {
              // Search by name as a last resort
              console.log('❌ Subcategory not found in categories, searching by name:', subcategory);
              queryParams = `?name[regex]=${subCategorySearch}&name[options]=i`;
            }
          } else {
            console.log('❌ Category not found in MongoDB:', categoryId);
            
            // Try finding products with the category name in their name or brand field
            // This is a fallback when we can't find the category
            queryParams = `?name[regex]=${categoryNameSearch}|${categoryId}&name[options]=i`;
          }
        }
        
        let response = null;
        
        // IMPROVED PATH CHECK: Log the current path to help with debugging
        if (categoryId && subcategory) {
          console.log(`🚨 CATEGORY PATH INFO: ${categoryId}/${subcategory}`);
          
          // We've removed the early filtering logic that was preventing subcategory products from showing
          // Now we'll use a consistent approach for all subcategories by using the getProductsByNestedCategory method
        }
        
          // Handle nested categories like housekeeping-materials/handwash or office-stationery/pen-stands
        // This should now work for ALL subcategory paths, not just office-stationery
        if (categoryId && subcategory) {
          console.log(`🔍 Detected nested category path: ${categoryId}/${subcategory}, using specialized method`);
          
          // Enhanced debug logging to track nested category handling
          console.log(`🔍 Processing nested category: Main=${categoryId}, Sub=${subcategory}`);
          
          try {
            // Use the enhanced nested category method that's been improved to handle all formats
            response = await productService.getProductsByNestedCategory(categoryId, subcategory);
            console.log('📋 Products from nested category method:', response);            // If we got no results, try a direct metadata fields search
            if (!response || (response.data && response.data.length === 0) || (Array.isArray(response) && response.length === 0)) {
              console.log('⚠️ No products found with nested method, trying metadata fields search');
              
              // Convert dashed category names to display format (spaces and capitalization)
              // More comprehensive mapping for main categories
              const categoryMappings = {
                "office-stationery": "OFFICE STATIONERY",
                "housekeeping-materials": "HOUSEKEEPING MATERIALS",
                "art-craft": "ART AND CRAFT",
                "it-electrical": "IT AND ELECTRICAL",
                "pantry-supplies": "PANTRY SUPPLIES",
                "safety-equipment": "SAFETY EQUIPMENT",
                "packaging-materials": "PACKAGING MATERIALS",
                "corporate-gifts": "CORPORATE GIFTS"
              };
              
              // Subcategory mappings for better matching
              const subcategoryMappings = {
                "handwash": "HANDWASH",
                "disinfectants": "DISINFECTANTS",
                "floor-cleaners": "FLOOR CLEANERS",
                "glass-cleaners": "GLASS CLEANERS",
                "pen-stands": "PEN STANDS",
                "coloring-books": "COLORING BOOKS",
                "brooms-brushes": "BROOMS & BRUSHES",
                "mops-wipers": "MOPS & WIPERS"
              };
              
              // Use mappings if available
              let mainCategoryName;
              if (categoryMappings[categoryId]) {
                mainCategoryName = categoryMappings[categoryId];
              } else {
                mainCategoryName = categoryId.replace(/-/g, ' ').split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              }
              
              let subCategoryName;
              if (subcategoryMappings[subcategory]) {
                subCategoryName = subcategoryMappings[subcategory];
              } else {
                subCategoryName = subcategory.replace(/-/g, ' ').split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              }
              
              console.log('🔍 Searching by metadata fields with:', mainCategoryName, subCategoryName);
              
              // Try a direct metadata fields query
              try {
                // Try multiple query approaches for subcategories
                
                // 1. First try exact match with both mainCategory and subcategory
                const metadataQueryParams = `?metadata.mainCategory=${encodeURIComponent(mainCategoryName)}&metadata.subcategory=${encodeURIComponent(subCategoryName)}`;
                console.log('🔍 Trying exact match with both fields:', metadataQueryParams);
                
                const metadataResponse = await fetch(`http://localhost:5000/api/products${metadataQueryParams}`, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (metadataResponse.ok) {
                  const metadataJsonData = await metadataResponse.json();
                  
                  if (metadataJsonData && metadataJsonData.success && 
                      metadataJsonData.data && metadataJsonData.data.length > 0) {
                    console.log('✅ Found products with metadata fields search!');
                    response = metadataJsonData;
                  } else {
                    console.log('⚠️ No products found with metadata fields search');
                    // Now try regex search with multiple approaches
                    // First try with both fields
                    const regexQueryParams = `?metadata.mainCategory[regex]=${encodeURIComponent(mainCategoryName)}&metadata.mainCategory[options]=i&metadata.subcategory[regex]=${encodeURIComponent(subCategoryName)}&metadata.subcategory[options]=i`;
                    console.log('🔍 Trying regex metadata search with both fields:', regexQueryParams);
                    
                    // If that fails, we'll try just the subcategory field which is more important for this search
                    
                    const regexResponse = await fetch(`http://localhost:5000/api/products${regexQueryParams}`, {
                      method: 'GET',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (regexResponse.ok) {
                      const regexJsonData = await regexResponse.json();
                      if (regexJsonData && regexJsonData.success && 
                          regexJsonData.data && regexJsonData.data.length > 0) {
                        console.log('✅ Found products with regex metadata search!');
                        response = regexJsonData;
                      } else {
                        // Try with just the subcategory field (more important for this search)
                        console.log('⚠️ No products found with combined regex search, trying subcategory-only search');
                        
                        const subCategoryOnlyQuery = `?metadata.subcategory[regex]=${encodeURIComponent(subCategoryName)}&metadata.subcategory[options]=i`;
                        console.log('🔍 Trying subcategory-only search:', subCategoryOnlyQuery);
                        
                        const subCategoryResponse = await fetch(`http://localhost:5000/api/products${subCategoryOnlyQuery}`, {
                          method: 'GET',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (subCategoryResponse.ok) {
                          const subCategoryJsonData = await subCategoryResponse.json();
                          if (subCategoryJsonData && subCategoryJsonData.success && 
                              subCategoryJsonData.data && subCategoryJsonData.data.length > 0) {
                            console.log('✅ Found products with subcategory-only search!');
                            response = subCategoryJsonData;
                          } else {
                            // Last resort: use the original queryParams
                            console.log('⚠️ No products found with all metadata approaches, falling back to regular query');
                            console.log('🔍 Fetching products with queryParams:', queryParams);
                            response = await productService.getAllProducts(queryParams);
                          }
                        } else {
                          // Last resort: use the original queryParams
                          console.log('🔍 Subcategory-only search failed, fetching with original queryParams:', queryParams);
                          response = await productService.getAllProducts(queryParams);
                        }
                      }
                    } else {
                      // Fall back to regular query
                      console.log('🔍 Metadata regex query failed, fetching with original queryParams:', queryParams);
                      response = await productService.getAllProducts(queryParams);
                    }
                  }
                } else {
                  // Fall back to regular query
                  console.log('🔍 Metadata fields query failed, fetching with original queryParams:', queryParams);
                  response = await productService.getAllProducts(queryParams);
                }
              } catch (metadataError) {
                console.error('❌ Error in metadata fields search:', metadataError);
                // Fall back to regular query
                console.log('🔍 Fetching products with queryParams after metadata error:', queryParams);
                response = await productService.getAllProducts(queryParams);
              }
            }
          } catch (error) {
            console.error('❌ Error in nested category method:', error);
            // Fall back to regular query
            console.log('🔍 Fetching products with queryParams:', queryParams);
            response = await productService.getAllProducts(queryParams);
          }
        } else {
          // Standard query for non-nested categories
          console.log('🔍 Fetching products with queryParams:', queryParams);
          response = await productService.getAllProducts(queryParams);
        }
        
        console.log('📋 Final products response:', response);
        
        // Debug information to help troubleshoot category fetching
        if (categoryId && subcategory) {
          console.log(`🔍 DEBUG: Processing final response for: ${categoryId}/${subcategory}`);
          console.log(`🔍 Response type: ${typeof response}`);
          
          // Log data structure
          if (response && typeof response === 'object') {
            if (response.data) {
              console.log(`🔍 response.data exists: ${Array.isArray(response.data) ? 'array' : typeof response.data}`);
              if (Array.isArray(response.data)) {
                console.log(`🔍 response.data length: ${response.data.length}`);
              } else if (response.data.data && Array.isArray(response.data.data)) {
                console.log(`🔍 response.data.data length: ${response.data.data.length}`);
              }
            } else if (Array.isArray(response)) {
              console.log(`🔍 response is array with length: ${response.length}`);
            }
          }
        }
        
        // Handle response for subcategories consistently
        if (categoryId && subcategory) {
          console.log(`🚨 PROCESSING RESPONSE for ${categoryId}/${subcategory}`);
          
          // REMOVED the "knownGoodSubcategories" whitelist - all subcategories should work the same way
          console.log(`🔍 Processing products for: ${categoryId}/${subcategory}`);
          
          // Use response data if available - apply common logic for ALL subcategories
          if (response && response.data && Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} products in response.data`);
            productsToShow = response.data;
          } 
          else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
            console.log(`Found ${response.data.data.length} products in response.data.data`);
            productsToShow = response.data.data;
          }
          else if (Array.isArray(response)) {
            console.log(`Found ${response.length} products in array response`);
            productsToShow = response;
          }
          // Handle empty response
          else {
            console.log(`⚠️ No products found for ${categoryId}/${subcategory}`);
            productsToShow = [];
          }
          
          // Add debugging to verify the products array content
          if (productsToShow && productsToShow.length > 0) {
            console.log(`✅ Found ${productsToShow.length} products for ${categoryId}/${subcategory}`);
            console.log('Sample product:', productsToShow[0].name, 
                       'Category:', productsToShow[0].metadata?.mainCategory, 
                       'Subcategory:', productsToShow[0].metadata?.subcategory);
          } else {
            console.log(`⚠️ No products available for ${categoryId}/${subcategory}`);
          }
        }
        // For main categories or all products view, use standard logic
        else {
          console.log(`🔍 Standard category check for ${categoryId || 'all products'}`);
          
          // Handle MongoDB response format
          if (response && response.data) {
            console.log('✅ Found MongoDB data array in response.data');
            productsToShow = response.data;
          }
          // Handle direct array response
          else if (Array.isArray(response)) {
            console.log('✅ Response is already an array');
            productsToShow = response;
          }
          // Handle null, undefined, or unexpected formats
          else {
            console.error('❌ Unexpected API response format:', response);
            productsToShow = [];
          }
        }
        
        // CRITICAL FIX: If we are specifically querying a category/subcategory, make sure we only show products for that category
        // If no products are found for the specific category, show empty results instead of all products
        if ((categoryId || subcategory) && productsToShow.length === 0) {
          console.log('⚠️ No products found for the specific category/subcategory, showing empty results');
          // Keep productsToShow as empty array
        }
        
        // Fetch categories for the filter panel
        const fetchedCategories = await productService.getAllCategories();
        console.log('📋 Categories for filter panel:', fetchedCategories);
        
        const filterCategories = Array.isArray(fetchedCategories) 
          ? fetchedCategories 
          : (fetchedCategories.data || []);
        
        // Debug products and categories to ensure proper structure
        console.log('Debug - First product:', productsToShow[0]);
        console.log('Debug - First category:', filterCategories[0]);
        
        // FINAL SAFETY CHECK: For all subcategory pages
        if (categoryId && subcategory) {
          console.log(`🔍 FINAL CHECK: Validating results for ${categoryId}/${subcategory}`);
          
          // IMPROVED: Handle all subcategories consistently like Office Stationery
          
          // First, make one last attempt to find products if we have none
          if (productsToShow.length === 0) {
            console.log(`🚫 FINAL CHECK: No products found for ${categoryId}/${subcategory}, making one last attempt`);
            
            try {
              // Try a direct subcategory-only search as a last resort
              const simplifiedSubcat = subcategory.replace(/-/g, ' ');
              const lastResortQuery = `?metadata.subcategory[regex]=${encodeURIComponent(simplifiedSubcat)}&metadata.subcategory[options]=i`;
              console.log('🔍 LAST RESORT: Trying simplified subcategory search:', lastResortQuery);
              
              const lastResortResponse = await fetch(`http://localhost:5000/api/products${lastResortQuery}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (lastResortResponse.ok) {
                const lastResortData = await lastResortResponse.json();
                if (lastResortData && lastResortData.success && 
                    lastResortData.data && lastResortData.data.length > 0) {
                  // Filter these products to ensure they are actually for this subcategory
                  const relevantProducts = lastResortData.data.filter(product => {
                    const subCategoryText = subcategory.replace(/-/g, ' ').toLowerCase();
                    const productSubCategory = (product.metadata?.subcategory || '').toLowerCase();
                    return productSubCategory.includes(subCategoryText);
                  });
                  
                  if (relevantProducts.length > 0) {
                    console.log(`✅ LAST RESORT: Found ${relevantProducts.length} relevant products!`);
                    productsToShow = relevantProducts;
                  } else {
                    console.log(`⚠️ LAST RESORT: Products found but none match this subcategory`);
                    productsToShow = []; // Empty results if none match
                  }
                }
              }
            } catch (error) {
              console.error('Error in last resort search:', error);
            }
          }
          
          // Now filter ANY products we have to ensure they're truly for this subcategory
          // This is critical to prevent showing all products when subcategory has none
          if (productsToShow.length > 0) {
            console.log(`⚠️ SUBCATEGORY CHECK: Validating ${productsToShow.length} products for ${categoryId}/${subcategory}`);
            
            // Always filter products to ensure they actually belong to this subcategory
            const filteredProducts = productsToShow.filter(product => {
              const subCategoryText = subcategory.replace(/-/g, ' ').toLowerCase();
              
              // Check metadata fields - stricter matching
              const matchesMetadata = product.metadata && (
                // Direct match on subcategory field
                (product.metadata.subcategory && 
                 product.metadata.subcategory.toLowerCase() === subCategoryText) ||
                // Partial match on subcategory field if exact match fails
                (product.metadata.subcategory && 
                 product.metadata.subcategory.toLowerCase().includes(subCategoryText)) ||
                // Check categoryPath field
                (product.metadata.categoryPath && 
                 product.metadata.categoryPath.toLowerCase().includes(subcategory.toLowerCase()))
              );
              
              // Check category fields
              const matchesCategory = product.category && 
                product.category.sub && 
                ((typeof product.category.sub === 'object' && 
                  product.category.sub.name && 
                  product.category.sub.name.toLowerCase().includes(subCategoryText)) ||
                 (product.category.sub.slug && 
                  product.category.sub.slug.toLowerCase() === subcategory.toLowerCase()));
              
              return matchesMetadata || matchesCategory;
            });
            
            if (filteredProducts.length === 0) {
              console.log(`🚫 SUBCATEGORY CHECK: All products filtered out - showing "No Products Found"`);
              productsToShow = []; // Empty results if no products match subcategory
            } else if (filteredProducts.length < productsToShow.length) {
              console.log(`✅ SUBCATEGORY CHECK: Filtered from ${productsToShow.length} to ${filteredProducts.length} relevant products`);
              productsToShow = filteredProducts;
            } else {
              console.log(`✅ SUBCATEGORY CHECK: All ${productsToShow.length} products are relevant`);
              // Keep products as is
            }
          } else {
            console.log(`🚫 FINAL CHECK: No products found for ${categoryId}/${subcategory}`);
            // Keep productsToShow as empty
          }
        }
        
        // Add count property to each category based on number of products
        const categoriesWithCount = filterCategories.map(category => {
          // Handle the new category structure with main and sub fields
          const count = productsToShow.filter(product => {
            if (!product.category) return false;
            
            if (typeof product.category === 'object') {
              // Check if using the new structure with main/sub
              if (product.category.main && product.category.sub) {
                // Check if this category matches either main or sub
                return (
                  (product.category.main._id === category._id || product.category.main === category._id) ||
                  (product.category.sub._id === category._id || product.category.sub === category._id)
                );
              } else if (product.category._id) {
                // Old structure with direct category reference
                return product.category._id === category._id;
              }
            } else {
              // Simple string reference
              return product.category === category._id;
            }
            return false;
          }).length;
          
          return { 
            ...category, 
            count,
            displayName: category.name
          };
        });
        
        setCategories(categoriesWithCount);
        
        // Find current category for display purposes
        if (categoryId) {
          // Convert dashes to spaces for better matching
          const cleanCategoryName = categoryId.replace(/-/g, ' ');
          
          const currentCat = categoriesWithCount.find(cat => 
            cat.slug === categoryId || 
            cat.name.toLowerCase() === categoryId.toLowerCase() ||
            cat.name.toLowerCase().includes(cleanCategoryName.toLowerCase())
          );
          
          if (currentCat) {
            setCurrentCategory(currentCat);
          } else {
            // If we can't find the exact category, set a placeholder
            console.log('⚠️ Creating placeholder category for UI display');
            const placeholderCategory = {
              name: categoryId.replace(/-/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              _id: 'placeholder',
              count: productsToShow.length,
              displayName: categoryId.replace(/-/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
            };
            setCurrentCategory(placeholderCategory);
          }
        }
        
        // Handle setting the current category more intelligently
        
        // For subcategory pages, set a more appropriate category object
        if (categoryId && subcategory && filterCategories.length > 0) {
          // Try to find the subcategory object first
          const subCat = filterCategories.find(cat => 
            cat.slug === subcategory || 
            cat.name.toLowerCase() === subcategory.toLowerCase() ||
            cat.name.toLowerCase().includes(subcategory.replace(/-/g, ' ').toLowerCase())
          );
          
          if (subCat) {
            console.log('✅ Using subcategory object for current category:', subCat);
            setCurrentCategory(subCat);
          } else {
            // Create a specialized subcategory display object
            console.log('⚠️ Creating subcategory display object');
            const formattedSubName = subcategory.replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            const formattedCatName = categoryId.replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            setCurrentCategory({
              name: formattedSubName,
              displayName: formattedSubName,
              parentCategory: formattedCatName,
              _id: `subcategory-${subcategory}`,
              count: productsToShow.length
            });
          }
        }
        
        setProducts(productsToShow);
        setFilteredProducts(productsToShow);
        
        console.log('Products to display:', productsToShow);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId, subcategory, categoryName]);
  
  const handleFilterChange = (filters) => {
    console.log("Filter change:", filters);
    
    // Handle explicit reset
    if (filters.isReset) {
      console.log("Resetting filters and showing all products");
      // Set filtered products to all products for the current category
      setFilteredProducts([...products]);
      return;
    }
    
    // Start with all products for filtering
    let result = [...products];
    
    // Apply category filters if any are selected
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category));
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      result = result.filter(product => 
        product.price >= filters.priceRange.min && 
        product.price <= filters.priceRange.max
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Default sorting (by id or featured status)
          break;
      }
    }
    
    // Update filtered products
    setFilteredProducts(result);
  };
  
  // Add some console debugging for better troubleshooting
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      console.log('🧪 Testing CategoryPage with:', {
        categoryId,
        subcategory,
        productCount: products.length,
        firstProduct: products[0],
        categoryStructure: products[0]?.category,
        currentCategory
      });
    }
  }, [isLoading, products, categoryId, subcategory, currentCategory]);
  
  return (
    <div className="category-page">
      <div className="container">
        <div className="category-breadcrumb">
          <Link to="/">Home</Link> {' > '}
          {categoryId || subcategory ? (
            <>
              <Link to="/category">Categories</Link> {' > '}
              {categoryId && subcategory ? (
                <>
                  <Link to={`/category/${categoryId}`}>
                    {categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' ')}
                  </Link> {' > '}
                  <span>{subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}</span>
                </>
              ) : (
                <span>
                  {currentCategory ? currentCategory.displayName : (categoryName || '').charAt(0).toUpperCase() + (categoryName || '').slice(1).replace('-', ' ')}
                </span>
              )}
            </>
          ) : (
            <span>Categories</span>
          )}
        </div>
        
        <div className="category-header">
          <div className="category-title-section">
            <h1>
              {currentCategory 
                ? currentCategory.displayName 
                : categoryName 
                  ? `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Products` 
                  : 'All Products'}
            </h1>
            <p>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
          
          <div className="category-actions">
            <button 
              className="mobile-filters-toggle" 
              onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
              </svg>
              {mobileFiltersVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        <div className="category-layout">
          <aside className={`filters-sidebar ${mobileFiltersVisible ? 'mobile-visible' : ''}`}>
            <FiltersPanel 
              categories={categories} 
              onFilterChange={handleFilterChange}
              currentCategory={categoryName}
            />
          </aside>
          
          <div className="products-container">
            {isLoading ? (
              <div className="products-grid">
                {[...Array(6)].map((_, index) => (
                  <div className="product-card-skeleton" key={index}>
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-price"></div>
                      <div className="skeleton-button"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id || product.id || index} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
                </svg>
                <h3>No Products Found</h3>
                
                {/* Different messages for subcategory vs regular category pages */}
                {categoryId && subcategory ? (
                  <>
                    <p>
                      No products found in "{subcategory.replace(/-/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}" subcategory.
                    </p>
                    <div className="action-links">
                      <Link 
                        to={`/category/${categoryId}`}
                        className="btn btn-primary" 
                        style={{ textDecoration: 'none', marginRight: '10px' }}
                      >
                        View All {categoryId.replace(/-/g, ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')} Products
                      </Link>
                      <Link 
                        to="/category"
                        className="btn btn-outline-secondary" 
                        style={{ textDecoration: 'none' }}
                      >
                        Browse All Categories
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p>No products found matching your criteria.</p>
                    <Link 
                      to="/category"
                      className="btn btn-primary" 
                      style={{ textDecoration: 'none' }}
                    >
                      Reset Filters
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
