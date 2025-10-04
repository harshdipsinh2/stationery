import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getProductService } from '../../services/serviceSelector';
import ProductCard from '../../components/ProductCard/ProductCard';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get search query from URL
  const query = new URLSearchParams(location.search).get('q') || '';
  
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Use the real product service to search
        const productService = getProductService();
        const results = await productService.searchProducts(query.trim());
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [query]);
  
  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Search Results</h1>
          {query ? (
            <p>Showing results for: <strong>"{query}"</strong></p>
          ) : (
            <p>Please enter a search term to find products</p>
          )}
        </div>
        
        {isLoading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, index) => (
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
        ) : searchResults.length > 0 ? (
          <>
            <div className="search-result-count">
              {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} found
            </div>
            <div className="search-results-grid">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : query ? (
          <div className="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <h3>No Results Found</h3>
            <p>We couldn't find any products matching your search.</p>
            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <h3>Search for Products</h3>
            <p>Enter a search term to find products</p>
            <Link to="/" className="btn btn-primary">Browse Categories</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
