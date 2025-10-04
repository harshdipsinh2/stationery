import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../utils/formatPrice';
import { MobileCartItem } from './MobileCartItem';
import { getProductService } from '../../services/serviceSelector';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const { notifySuccess, notifyError } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stockValidation, setStockValidation] = useState({});
  const productService = getProductService();
  
  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load stock validation for existing cart items
  useEffect(() => {
    const loadStockValidation = async () => {
      if (cart.length === 0) return;
      
      try {
        const validations = {};
        for (const item of cart) {
          if (item._id) {
            const validation = await validateStock(item._id, item.quantity);
            validations[item._id] = validation;
          }
        }
        setStockValidation(validations);
      } catch (error) {
        console.error('Error loading stock validation:', error);
      }
    };
    
    loadStockValidation();
  }, [cart.length]); // Run when cart items change
  
  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return '/images/placeholder.jpg';
    
    // Handle MongoDB image structure
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      // If it's a full URL, use it as-is
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      // If it's a relative path from uploads folder
      if (firstImage.startsWith('/uploads/') || firstImage.startsWith('uploads/')) {
        return `http://localhost:5000${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
      }
      // If it's just a filename, assume it's in uploads
      return `http://localhost:5000/uploads/${firstImage}`;
    }
    
    // Fallback to placeholder
    return '/images/placeholder.jpg';
  };
  
  // Real-time stock validation
  const validateStock = async (productId, requestedQuantity) => {
    try {
      const product = await productService.getProductById(productId);
      const availableStock = product.stock || 0;
      
      setStockValidation(prev => ({
        ...prev,
        [productId]: {
          available: availableStock,
          isValid: requestedQuantity <= availableStock,
          lastChecked: Date.now()
        }
      }));
      
      return {
        isValid: requestedQuantity <= availableStock,
        availableStock,
        requestedQuantity
      };
    } catch (error) {
      console.error('Stock validation error:', error);
      return { isValid: true, availableStock: 999, requestedQuantity }; // Assume valid on error
    }
  };
  
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return;
    }
    
    try {
      // Validate stock before updating
      const stockCheck = await validateStock(productId, newQuantity);
      
      if (!stockCheck.isValid) {
        notifyError(`Only ${stockCheck.availableStock} items available in stock`);
        return;
      }
      
      updateQuantity(productId, parseInt(newQuantity));
      
      // Show success message for stock validation
      if (stockCheck.availableStock <= 5 && stockCheck.availableStock > 0) {
        notifySuccess(`Updated quantity. Only ${stockCheck.availableStock} items left in stock!`);
      }
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      notifyError('Failed to update quantity. Please try again.');
    }
  };
  
  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    notifySuccess(`${productName} removed from cart`);
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Validate stock for all items before proceeding
      const stockValidations = await Promise.all(
        cart.map(item => validateStock(item._id, item.quantity))
      );
      
      const invalidItems = stockValidations.filter(validation => !validation.isValid);
      
      if (invalidItems.length > 0) {
        setIsProcessing(false);
        notifyError('Some items in your cart are out of stock. Please update quantities.');
        return;
      }
      
      // All items are valid, proceed to checkout
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/checkout');
      }, 1000);
      
    } catch (error) {
      console.error('Checkout validation error:', error);
      setIsProcessing(false);
      notifyError('Failed to validate stock. Please try again.');
    }
  };
  
  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/category" className="btn btn-large">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {!isMobile && (
                <div className="cart-headers">
                  <div className="header-product">Product</div>
                  <div className="header-price">Price</div>
                  <div className="header-quantity">Quantity</div>
                  <div className="header-total">Total</div>
                  <div className="header-actions"></div>
                </div>
              )}
              
              {cart.map(item => {
                // Ensure item has required properties
                if (!item || !item._id || !item.name) {
                  console.warn('Invalid cart item:', item);
                  return null;
                }
                
                return (
                <div className="cart-item" key={item._id}>
                  <div className="item-product">
                    <div className="item-image">
                      <img 
                        src={getProductImageUrl(item)} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <div className="item-name">
                        {item.name}
                      </div>
                      {stockValidation[item._id] && !stockValidation[item._id].isValid && (
                        <div className="stock-warning">
                          ⚠️ Only {stockValidation[item._id].available} left in stock
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isMobile ? (
                    <>
                      <div className="item-price">{formatPrice(item.price)}</div>
                      <div className="item-quantity">
                        <div className="quantity-selector">
                          <button 
                            className="quantity-btn quantity-decrease"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn quantity-increase"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={
                              stockValidation[item._id] && 
                              item.quantity >= stockValidation[item._id].available
                            }
                            aria-label="Increase quantity"
                            title={
                              stockValidation[item._id] && 
                              item.quantity >= stockValidation[item._id].available
                                ? `Only ${stockValidation[item._id].available} items available`
                                : "Increase quantity"
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="item-total">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="remove-item" 
                          onClick={() => handleRemoveItem(item._id, item.name)}
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <MobileCartItem 
                        item={item} 
                        handleQuantityChange={handleQuantityChange} 
                        handleRemoveItem={handleRemoveItem} 
                        formatPrice={formatPrice}
                        stockValidation={stockValidation}
                      />
                      <div className="item-actions">
                        <button 
                          className="remove-item" 
                          onClick={() => handleRemoveItem(item._id, item.name)}
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                );
              })}
            </div>
            
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatPrice(total)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">Calculated at checkout</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Total</span>
                <span className="summary-value">{formatPrice(total)}</span>
              </div>
              <button 
                className={`btn btn-large checkout-btn ${isProcessing ? 'processing' : ''}`}
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                      <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" className="spinner-path"/>
                    </svg>
                    Processing...
                  </>
                ) : 'Proceed to Checkout'}
              </button>
              <Link to="/category" className="continue-shopping">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
