import './ProductGrid.css';

function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products?.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-info">
            <h3>{product.name}</h3>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="star">★</span>
              ))}
            </div>
            <div className="price-section">
              <span className="mrp">MRP: </span>
              <span className="price">₹{product.price.toFixed(2)}</span>
            </div>
            <div className="quantity-section">
              <button className="qty-btn">-</button>
              <input type="number" value="1" min="1" className="qty-input" />
              <button className="qty-btn">+</button>
              <button className="add-to-cart">ADD TO CART</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;