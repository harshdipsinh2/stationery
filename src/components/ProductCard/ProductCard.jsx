import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../utils/formatPrice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { notifySuccess } = useNotification();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [quantityChanged, setQuantityChanged] = useState(false);
  
  // Handle both MongoDB (_id) and mock data (id) formats for product identification
  const productId = product._id || product.id; 
  
  // Handle both MongoDB (stock) and mock data (countInStock) formats for stock
  const productStock = product.stock || product.countInStock || 0; 
  
  // Extract category name from MongoDB format
  let productCategory = '';
  if (product.category) {
    if (typeof product.category === 'object' && product.category !== null) {
      if (product.category.main && product.category.main.name) {
        productCategory = product.category.main.name;
      } else if (product.category.name) {
        productCategory = product.category.name;
      }
    } else {
      productCategory = product.category;
    }
  }
  
  // Log details about this product for debugging
  console.log('MongoDB product in card:', { 
    _id: productId, 
    name: product.name, 
    countInStock: productStock,
    category: productCategory,
    price: product.price
  });
  
  // Find if product is already in cart
  const cartItem = cart.find(item => (item._id === productId || item.id === productId));
  const isInCart = !!cartItem;
  
  // Animate quantity changes
  useEffect(() => {
    if (quantityChanged) {
      const timer = setTimeout(() => {
        setQuantityChanged(false);
      }, 300); // Duration of animation
      
      return () => clearTimeout(timer);
    }
  }, [quantityChanged]);
  
  const handleAddToCart = () => {
    addToCart(product, 1);
    notifySuccess(`✓ ${product.name} added to your cart!`);
    setQuantityChanged(true);
  };
  
  const increaseQuantity = () => {
    if (cartItem && cartItem.quantity < productStock) {
      updateQuantity(productId, cartItem.quantity + 1);
      notifySuccess(`✓ Quantity updated: ${cartItem.quantity + 1} ${product.name}${cartItem.quantity + 1 > 1 ? 's' : ''}`);
      setQuantityChanged(true);
    }
  };
  
  const decreaseQuantity = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(productId, cartItem.quantity - 1);
        notifySuccess(`✓ Quantity updated: ${cartItem.quantity - 1} ${product.name}${cartItem.quantity - 1 > 1 ? 's' : ''}`);
        setQuantityChanged(true);
      } else {
        removeFromCart(productId);
        notifySuccess(`✓ ${product.name} removed from your cart`);
      }
    }
  };
  
  // Use a placeholder image if product image fails to load
  const fallbackImageUrl = '/images/placeholder.jpg';
  
  // Handle both MongoDB and mock data image formats
  const getImageUrl = () => {
    // Check for MongoDB image format (images array)
    if (product.images && product.images.length > 0) {
      // Add server URL if the path starts with / but doesn't include http
      if (product.images[0].startsWith('/') && !product.images[0].startsWith('http')) {
        return `http://localhost:5000${product.images[0]}`;
      }
      return product.images[0];
    }
    
    // Check for single image format
    if (product.image) {
      if (product.image.startsWith('/') && !product.image.startsWith('http')) {
        return `http://localhost:5000${product.image}`;
      }
      return product.image;
    }
    
    // Fallback to mock data format
    return product.imageUrl || fallbackImageUrl;
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {!isImageLoaded && (
          <div className="product-image-skeleton"></div>
        )}
        <img
          src={getImageUrl()}
          alt={product.name}
          className="product-image"
          style={{ display: isImageLoaded ? 'block' : 'none' }}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            e.target.src = fallbackImageUrl;
            setIsImageLoaded(true);
          }}
        />
        {productStock < 10 && productStock > 0 && (
          <span className="product-badge stock-low">Low Stock</span>
        )}
        {productStock === 0 && (
          <span className="product-badge out-of-stock">Out of Stock</span>
        )}
        {product.featured && (
          <span className="product-badge featured">Featured</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">
          {product.name}
        </h3>
        <div className="product-price">{formatPrice(product.price)}</div>
        <div className="product-category">{productCategory}</div>
        {productStock > 0 && (
          <div className={`product-stock ${productStock > 5 ? 'in-stock' : 'low-stock'}`}>
            {productStock > 5 
              ? <span>In Stock</span> 
              : <span>Only {productStock} left</span>}
          </div>
        )}
        
        {productStock > 0 ? (
          isInCart ? (
            // Show quantity controls if product is in cart
            <div className="product-cart-controls">
              <div className="quantity-controls">
                <button 
                  className="quantity-btn" 
                  onClick={decreaseQuantity}
                  aria-label="Decrease quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                  </svg>
                </button>
                <span className={`quantity-display ${quantityChanged ? 'quantity-added' : ''}`}>{cartItem.quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={increaseQuantity}
                  disabled={cartItem.quantity >= productStock}
                  aria-label="Increase quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            // Show Add to Cart button if product is not in cart
            <button
              className="product-add-to-cart"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <span style={{ fontSize: '1rem' }}>Add to Cart</span>
            </button>
          )
        ) : (
          <button
            className="product-add-to-cart out-of-stock"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
            </svg>
            <span style={{ fontSize: '1rem' }}>Out of Stock</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
