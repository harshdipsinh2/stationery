import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthService } from '../../services/serviceSelector';
import './ProfileOrders.css';

export default function ProfileOrders() {
  const { user } = useAuth();
  const authService = getAuthService();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserOrders();
      console.log("Fetched orders:", response); // Debug log
      
      // Check if response has a data property (API response structure)
      if (response && response.data) {
        const ordersData = response.data || [];
        
        // Log detailed order price information for debugging
        console.log("Order prices structure:", ordersData.map(order => {
          // Log each item's price in the order
          const itemDetails = order.orderItems?.map(item => {
            return {
              name: item.name,
              price: item.price,
              qty: item.qty || item.quantity,
              totalItemPrice: item.price * (item.qty || item.quantity)
            };
          });
          
          return {
            id: order._id,
            itemsPrice: order.itemsPrice,
            subtotal: order.subtotal,
            shippingPrice: order.shippingPrice,
            shipping: order.shipping,
            taxPrice: order.taxPrice,
            tax: order.tax,
            totalPrice: order.totalPrice,
            total: order.total,
            orderItems: itemDetails
          };
        }));
        
        setOrders(ordersData);
      } else {
        // Fallback for direct array response
        console.log("Direct array response - Order prices structure:", response.map(order => {
          // Log each item's price in the order
          const itemDetails = order.orderItems?.map(item => {
            return {
              name: item.name,
              price: item.price,
              qty: item.qty || item.quantity,
              totalItemPrice: item.price * (item.qty || item.quantity)
            };
          });
          
          return {
            id: order._id,
            itemsPrice: order.itemsPrice,
            subtotal: order.subtotal,
            shippingPrice: order.shippingPrice,
            shipping: order.shipping,
            taxPrice: order.taxPrice,
            tax: order.tax,
            totalPrice: order.totalPrice,
            total: order.total,
            orderItems: itemDetails
          };
        }));
        
        setOrders(response || []);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, authService]);

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>
          <button 
            className="button-primary"
            onClick={() => {
              setError('');
              setLoading(true);
              if (user) {
                fetchOrders();
              }
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="no-orders">
        <h2>Order History</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="button-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Order History</h2>
        <div className="orders-summary">
          <span className="order-count">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>
      </div>
      
      <div className="orders-list">
        {orders.map(order => (
          <div className="order-card" key={order._id || order.id}>
            <div className="order-header">
              <div>
                <h3>Order #{order.orderNumber || order._id}</h3>
                <div className="order-date">
                  Placed on {formatDate(order.orderDate || order.createdAt)}
                </div>
              </div>
              <div className={`order-status ${getStatusClass(order.status || 'processing')}`}>
                {order.status || 'Processing'}
              </div>
            </div>
            
            <div className="order-items">
              {(order.orderItems || order.items || []).map(item => (
                <div className="order-item" key={item._id || item.id || item.productId || item.product}>
                  <div className="order-item-info">
                    <div className="order-item-image">
                      {item.image && <img src={item.image} alt={item.name || item.product?.name} />}
                    </div>
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name || item.product?.name}</div>
                      <div className="order-item-quantity">Quantity: {item.qty || item.quantity || 1}</div>
                    </div>
                  </div>
                  <div className="order-item-price">
                    ₹ {formatPrice(getItemPrice(item))}
                    <div className="item-total-price">
                      Total: ₹ {formatPrice(getItemPrice(item) * (item.qty || item.quantity || 1))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-details">
              <div className="order-subtotal">
                <span>Subtotal</span>
                <span>₹ {formatPrice(calculateSubtotal(order))}</span>
              </div>
              <div className="order-shipping">
                <span>Shipping</span>
                <span>₹ {formatPrice(getShippingPrice(order))}</span>
              </div>
              <div className="order-tax">
                <span>Tax</span>
                <span>₹ {formatPrice(getTaxPrice(order))}</span>
              </div>
              <div className="order-total">
                <span>Total Amount</span>
                <span>₹ {formatPrice(getTotalPrice(order))}</span>
              </div>
            </div>
            
            <div className="order-actions">
              <Link 
                to={`/track-order/${order._id || order.id}`} 
                className="button-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Track Order
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get the correct item price
function getItemPrice(item) {
  // Get the price, with fallbacks
  let price = item.price || (item.product && item.product.price) || 0;
  
  // Convert to number if it's a string
  if (typeof price === 'string') {
    price = Number(price);
    if (isNaN(price)) price = 0;
  }
  
  // Ensure we're working with numbers, not objects or null values
  if (typeof price !== 'number' || isNaN(price)) {
    console.warn("Invalid price value detected:", price, "for item:", item.name || "unknown item");
    price = 0;
  }
  
  // Log the item price for debugging
  console.log("Item price for", item.name || "unknown item", ":", price);
  return price;
}

// Helper function to get shipping price
function getShippingPrice(order) {
  let price = order.shippingPrice || order.shipping || 0;
  
  // Convert to number if it's a string
  if (typeof price === 'string') {
    price = Number(price);
    if (isNaN(price)) price = 0;
  }
  
  return price;
}

// Helper function to get tax price
function getTaxPrice(order) {
  let price = order.taxPrice || order.tax || 0;
  
  // Convert to number if it's a string
  if (typeof price === 'string') {
    price = Number(price);
    if (isNaN(price)) price = 0;
  }
  
  return price;
}

// Helper function to calculate total price when it's missing
function getTotalPrice(order) {
  // Always calculate the total from components to ensure accuracy
  const subtotal = calculateSubtotal(order);
  const shipping = getShippingPrice(order);
  const tax = getTaxPrice(order);
  
  // Calculate the correct total
  const calculatedTotal = subtotal + shipping + tax;
  console.log("Calculated total:", calculatedTotal, "from", { subtotal, shipping, tax });
  return calculatedTotal;
}

// Helper function to calculate the subtotal from order items
function calculateSubtotal(order) {
  console.log("Calculating subtotal for order:", order._id || order.id, {
    itemsPrice: order.itemsPrice,
    subtotal: order.subtotal,
    orderItems: order.orderItems,
    items: order.items
  });

  // If the order has an itemsPrice field already, use that
  if (order.itemsPrice !== undefined && order.itemsPrice !== null) {
    let itemsPrice = typeof order.itemsPrice === 'string' 
      ? Number(order.itemsPrice) 
      : order.itemsPrice;
      
    if (!isNaN(itemsPrice)) {
      console.log("Using itemsPrice:", itemsPrice);
      return itemsPrice;
    }
  }
  
  // If the order has a subtotal field, use that
  if (order.subtotal !== undefined && order.subtotal !== null) {
    let subtotal = typeof order.subtotal === 'string' 
      ? Number(order.subtotal) 
      : order.subtotal;
      
    if (!isNaN(subtotal)) {
      console.log("Using subtotal:", subtotal);
      return subtotal;
    }
  }
  
  // Otherwise calculate from order items
  if (order.orderItems && order.orderItems.length > 0) {
    const subtotal = order.orderItems.reduce((total, item) => {
      // Ensure we're getting the correct price
      let price = getItemPrice(item);
      let quantity = item.qty || item.quantity || 1;
      
      // Ensure both values are numbers
      price = Number(price);
      quantity = Number(quantity);
      
      if (isNaN(price)) price = 0;
      if (isNaN(quantity)) quantity = 1;
      
      const itemTotal = price * quantity;
      console.log(`Item: ${item.name}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`);
      
      return total + itemTotal;
    }, 0);
    console.log("Calculated from orderItems:", subtotal);
    return subtotal;
  }
  
  // If no items found, check if there are items in a different format
  if (order.items && order.items.length > 0) {
    const subtotal = order.items.reduce((total, item) => {
      // Ensure we're getting the correct price
      let price = getItemPrice(item);
      let quantity = item.qty || item.quantity || 1;
      
      // Ensure both values are numbers
      price = Number(price);
      quantity = Number(quantity);
      
      if (isNaN(price)) price = 0;
      if (isNaN(quantity)) quantity = 1;
      
      const itemTotal = price * quantity;
      console.log(`Item: ${item.name}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`);
      
      return total + itemTotal;
    }, 0);
    console.log("Calculated from items:", subtotal);
    return subtotal;
  }
  
  // Fallback to 0 if no data available
  console.log("No subtotal data found, using 0");
  return 0;
}

// Helper function to format price with commas for thousands
function formatPrice(price) {
  // Check if price is valid
  if (price === undefined || price === null) {
    return "0.00";
  }
  
  // Log the raw price for debugging
  console.log("Raw price value:", price, typeof price);
  
  // Make sure we're working with a number
  let numPrice = Number(price);
  if (isNaN(numPrice)) {
    console.warn("Invalid price value:", price);
    return "0.00";
  }

  // In our backend model, price is stored directly in rupees, so no conversion is needed
  let finalPrice = numPrice;
  
  // Format with commas for Indian numbering system (1,00,000 instead of 100,000)
  return finalPrice.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

// Helper function for formatting date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format: 15 June 2023 at 14:30
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${day} ${month} ${year} at ${formattedHours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}