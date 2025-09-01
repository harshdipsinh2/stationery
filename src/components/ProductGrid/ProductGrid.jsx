import { useState } from "react";
import './ProductGrid.css';

function ProductGrid({ products }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [quantities, setQuantities] = useState({}); // track qty per product

  // Calculate indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination info
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Quantity handler
  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, value) // minimum 1
    }));
  };

  return (
    <div>
      {/* Product Grid */}
      <div className="product-grid">
        {currentItems?.map((product) => {
          const qty = quantities[product.id] || 1;
          return (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`star ${star <= 4 ? "filled" : ""}`} // 4/5 stars filled example
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="price-section">
                  <span className="mrp">MRP: </span>
                  <span className="price">₹{product.price.toFixed(2)}</span>
                </div>
                <div className="quantity-section">
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(product.id, qty - 1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={qty} 
                    min="1"
                    className="qty-input" 
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                  />
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(product.id, qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button className="add-to-cart">
                  🛒 Add {qty} to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <div className="items-per-page">
          <label>Items per page: </label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
          </select>
        </div>

        <div className="page-info">
          {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length} items
        </div>

        <div className="page-buttons">
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>
          <span className="page-number">{currentPage} / {totalPages}</span>
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductGrid;
