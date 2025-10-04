import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FiltersPanel.css';


const FiltersPanel = ({ categories, onFilterChange, currentCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('default');
  
  // Initialize selected categories based on current category from URL
  useEffect(() => {
    if (currentCategory) {
      setSelectedCategories([currentCategory]);
      applyFilters([currentCategory], priceRange, sortBy);
    } else {
      setSelectedCategories([]);
      applyFilters([], priceRange, sortBy);
    }
  }, [currentCategory]);
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  const handleCategoryChange = (categoryName) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(cat => cat !== categoryName)
      : [...selectedCategories, categoryName];
      
    setSelectedCategories(updatedCategories);
    applyFilters(updatedCategories, priceRange, sortBy);
  };
  
  const handlePriceChange = (e, bound) => {
    const value = parseInt(e.target.value);
    const updatedRange = { ...priceRange, [bound]: value };
    setPriceRange(updatedRange);
    applyFilters(selectedCategories, updatedRange, sortBy);
  };
  
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    applyFilters(selectedCategories, priceRange, value);
  };
  
  const applyFilters = (categories, price, sort) => {
    onFilterChange({
      categories,
      priceRange: price,
      sortBy: sort
    });
  };
  
  // This function resets all filter values to their defaults
  const resetFilters = (e) => {
    // Always prevent default behavior
    if (e) e.preventDefault();
    e?.stopPropagation();
    
    console.log("Reset filters clicked in FiltersPanel");
    
    // Reset component state
    setSelectedCategories(currentCategory ? [currentCategory] : []);
    setPriceRange({ min: 0, max: 5000 });
    setSortBy('default');
    
    // Call parent with reset values
    onFilterChange({
      categories: currentCategory ? [currentCategory] : [],
      priceRange: { min: 0, max: 5000 },
      sortBy: 'default',
      isReset: true
    });
  };

  return (
    <div className={`filters-panel ${isOpen ? 'open' : ''}`}>
      <button className="filters-toggle" onClick={togglePanel}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
        </svg>
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      <div className="filters-container">
        <div className="filters-header">
          <h3>Filter Products</h3>
          <a 
            href="/category"
            className="reset-button"
            onClick={(e) => {
              e.preventDefault();
              resetFilters(e);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset
          </a>
        </div>
        
        {/* Categories removed as requested */}
        
        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="price-range-controls">
            <div className="price-inputs">
              <div className="price-input-group">
                <label htmlFor="min-price">Minimum Price</label>
                <div className="price-input-wrapper">
                  <span className="currency">₹</span>
                  <input
                    id="min-price"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(e, 'min')}
                    min="0"
                    max={priceRange.max}
                  />
                </div>
              </div>
              
              <div className="price-input-group">
                <label htmlFor="max-price">Maximum Price</label>
                <div className="price-input-wrapper">
                  <span className="currency">₹</span>
                  <input
                    id="max-price"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(e, 'max')}
                    min={priceRange.min}
                  />
                </div>
              </div>
            </div>
            
            <div className="range-slider-container">
              {/* Active range track */}
              <div 
                className="active-track" 
                style={{
                  position: 'absolute',
                  borderRadius: 'var(--radius-full)',
                  left: `${(priceRange.min / 5000) * 100}%`,
                  right: `${100 - (priceRange.max / 5000) * 100}%`
                }}
              ></div>
              
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange.min}
                onChange={(e) => handlePriceChange(e, 'min')}
                className="range-slider min-slider"
                aria-label="Minimum price range"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange.max}
                onChange={(e) => handlePriceChange(e, 'max')}
                className="range-slider max-slider"
                aria-label="Maximum price range"
              />
            </div>
            
            <div className="price-range-values">
              <span>₹{priceRange.min.toLocaleString()}</span>
              <span>₹{priceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="filter-section">
          <h4>Sort By</h4>
          <div className="sort-select-wrapper">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              aria-label="Sort products by"
            >
              <option value="default">Default Sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        <button 
          type="button"
          className="apply-filters-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            applyFilters(selectedCategories, priceRange, sortBy);
            if (window.innerWidth <= 768) {
              togglePanel(); // Close panel on mobile after applying filters
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="22" y1="6" x2="3" y2="6"></line>
            <line x1="6" y1="12" x2="3" y2="12"></line>
            <line x1="10" y1="18" x2="3" y2="18"></line>
            <path d="M19 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4z"></path>
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel;
