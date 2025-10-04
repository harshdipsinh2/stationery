import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../utils/formatPrice';
import { getProductService } from '../../services/serviceSelector';
import orderService from '../../services/orderService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { notifyWarning, notifyError, notifySuccess } = useNotification();
  const productService = getProductService();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod', // Default to Cash on Delivery
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockValidation, setStockValidation] = useState({});
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      notifyWarning('Your cart is empty. Add some products first.');
    }
  }, [cart, navigate, notifyWarning]);

  // Helper function to get product image URL (same as CartPage)
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

  // Real-time stock validation (same as CartPage)
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

  // Validate stock for all cart items before checkout
  const validateCartStock = async () => {
    try {
      const validations = await Promise.all(
        cart.map(item => validateStock(item._id, item.quantity))
      );
      
      const invalidItems = validations.filter(validation => !validation.isValid);
      return invalidItems.length === 0;
    } catch (error) {
      console.error('Cart stock validation error:', error);
      return false;
    }
  };

  // Load stock validation for existing cart items
  useEffect(() => {
    const loadStockValidation = async () => {
      if (cart.length === 0) return;
      
      try {
        for (const item of cart) {
          if (item._id) {
            await validateStock(item._id, item.quantity);
          }
        }
      } catch (error) {
        console.error('Error loading stock validation:', error);
      }
    };
    
    loadStockValidation();
  }, [cart.length]); // Run when cart items change

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Zip code validation
    if (formData.zipCode && !/^\d{6}$/.test(formData.zipCode)) {
      errors.zipCode = 'Please enter a valid 6-digit PIN code';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notifyError('Please fix the errors in the form.');
      return;
    }

    // Check if user is logged in
    if (!user) {
      notifyError('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Validate stock before processing order
      const stockIsValid = await validateCartStock();
      if (!stockIsValid) {
        setIsProcessing(false);
        notifyError('Some items in your cart are out of stock. Please update your cart.');
        navigate('/cart');
        return;
      }

      // Calculate order totals
      const subtotal = total;
      const shipping = total > 100 ? 0 : 10;
      const tax = total * 0.07;
      const codFee = formData.paymentMethod === 'cod' ? 40 : 0;
      const grandTotal = subtotal + shipping + tax + codFee;

      // Prepare order data for the backend
      const orderData = {
        orderItems: orderService.formatOrderItems(cart),
        shippingAddress: {
          address: `${formData.address}`,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : formData.paymentMethod,
        taxPrice: Number(tax.toFixed(2)),
        shippingPrice: Number(shipping.toFixed(2)),
        totalPrice: Number(grandTotal.toFixed(2)),
      };

      console.log('📦 Submitting order:', orderData);

      // Create order in database
      const response = await orderService.createOrder(orderData);
      console.log('🎯 Order service response:', response);
      
      // The response structure from backend is: { success: true, data: createdOrder }
      const createdOrder = response.data;
      
      if (!createdOrder || !createdOrder._id) {
        throw new Error('Invalid order response from server');
      }

      // Show success notification
      notifySuccess('Order placed successfully!');
      
      // Navigate to confirmation page with the actual order ID
      navigate(`/order-confirmation/${createdOrder._id}`);
      
      // Clear the cart after successful order creation
      setTimeout(() => {
        clearCart();
      }, 100);
      
    } catch (error) {
      console.error('Error processing order:', error);
      notifyError(error.message || 'Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getOrderSummary = () => {
    const subtotal = total;
    const shipping = total > 100 ? 0 : 10;
    const tax = total * 0.07;
    const codFee = formData.paymentMethod === 'cod' ? 40 : 0;
    const grandTotal = subtotal + shipping + tax + codFee;
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    return (
      <div className="order-summary">
        <div className="summary-title">
          Order Summary
        </div>
        
        <div className="summary-header">
          <span className="items-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>
        
        <div className="summary-items">
          {cart.map(item => (
            <div key={item._id} className="summary-item">
              <div className="item-left">
                <img 
                  src={getProductImageUrl(item)} 
                  alt={item.name} 
                  className="item-image" 
                  onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                />
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-quantity">Qty: {item.quantity}</div>
                  {stockValidation[item._id] && !stockValidation[item._id].isValid && (
                    <div className="stock-warning">
                      ⚠️ Only {stockValidation[item._id].available} left
                    </div>
                  )}
                </div>
                <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="summary-divider"></div>
        
        <div className="summary-totals">
          <div className="summary-row">
            <span className="label">Subtotal</span>
            <span className="value">{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span className="label">Shipping</span>
            <span className="value">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row">
            <span className="label">Tax (7%)</span>
            <span className="value">{formatPrice(tax)}</span>
          </div>
          
          {codFee > 0 && (
            <div className="summary-row">
              <span className="label">COD Fee</span>
              <span className="value">{formatPrice(codFee)}</span>
            </div>
          )}
          
          <div className="summary-row total">
            <span>Total</span>
            <span className="grand-total">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <h1>Secure Checkout</h1>
          <div className="checkout-steps">
            <div className="step active">
              <span className="step-number">1</span>
              <span className="step-name">Cart</span>
            </div>
            <div className="step-divider active"></div>
            <div className="step active">
              <span className="step-number">2</span>
              <span className="step-name">Shipping & Payment</span>
            </div>
            <div className="step-divider"></div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-name">Confirmation</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-details">
            <div className="form-section">
              <h2>
                <div className="section-number">1</div>
                Contact Information
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && <div className="form-error">{formErrors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && <div className="form-error">{formErrors.lastName}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 123-456-7890"
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>
                <div className="section-number">2</div>
                Shipping Address
              </h2>
              
              <div className="address-form">
                <div className="form-group">
                  <label htmlFor="address">Street Address <span className="required">*</span></label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House/Flat No., Building, Street, Area"
                    className={formErrors.address ? 'error' : ''}
                  />
                  {formErrors.address && <div className="form-error">{formErrors.address}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="landmark">Landmark <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    id="landmark"
                    name="landmark"
                    placeholder="Nearby landmark for easier navigation"
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City <span className="required">*</span></label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={formErrors.city ? 'error' : ''}
                    />
                    {formErrors.city && <div className="form-error">{formErrors.city}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State/Province <span className="required">*</span></label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={formErrors.state ? 'error' : ''}
                    />
                    {formErrors.state && <div className="form-error">{formErrors.state}</div>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">PIN/ZIP Code <span className="required">*</span></label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="6-digit PIN code"
                      className={formErrors.zipCode ? 'error' : ''}
                    />
                    {formErrors.zipCode && <div className="form-error">{formErrors.zipCode}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country <span className="required">*</span></label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={formErrors.country ? 'error' : ''}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                    {formErrors.country && <div className="form-error">{formErrors.country}</div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>
                <div className="section-number">3</div>
                Payment Method
              </h2>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleInputChange}
                  />
                  <div className="radio-custom"></div>
                  <div className="payment-method-info">
                    <span>Pay Online</span>
                    <div className="payment-icons">
                      <i className="fa-brands fa-paypal"></i>
                      <i className="fa-solid fa-credit-card"></i>
                    </div>
                  </div>
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <div className="radio-custom"></div>
                  <div className="payment-method-info">
                    <span>Cash on Delivery</span>
                    <span className="payment-method-description">Pay when you receive</span>
                  </div>
                </label>
              </div>
              
              {formData.paymentMethod === 'paypal' && (
                <div className="paypal-info">
                  <p>You will be redirected to our secure payment gateway to complete your payment after placing the order.</p>
                  <div className="secure-payment-notice">
                    <i className="fa-solid fa-lock"></i>
                    <span>All online transactions are secure and encrypted</span>
                  </div>
                </div>
              )}
              
              {formData.paymentMethod === 'cod' && (
                <div className="cod-info">
                  <p>Pay with cash upon delivery of your order. Please have the exact amount ready.</p>
                  <div className="cod-notice">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>Cash on Delivery is available for orders under ₹10,000</span>
                  </div>
                  <div className="cod-fee">
                    <span>COD Handling Fee:</span>
                    <span>{formatPrice(40)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-summary-container">
            {getOrderSummary()}
            
            <div className="checkout-actions">
              <button
                type="submit"
                className="checkout-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {formData.paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment'}
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
              
              <div className="secure-checkout-notice">
                <i className="fa-solid fa-lock"></i>
                <span>Your data is protected with secure encryption</span>
              </div>
              
              <div className="return-to-cart">
                <a href="/cart">
                  <i className="fa-solid fa-arrow-left"></i>
                  Return to Cart
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
