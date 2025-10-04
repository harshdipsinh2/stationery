import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../utils/formatPrice';
import orderService from '../../services/orderService';
import './TrackOrderPage.css';

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notifyError } = useNotification();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 Fetching order details for ${orderId}...`);
        
        const response = await orderService.getOrderById(orderId);
        console.log('📦 Order details response:', response);
        
        const orderData = response.data || response;
        setOrder(orderData);
        
      } catch (err) {
        console.error('❌ Error fetching order details:', err);
        setError(err.message || 'Failed to load order details');
        notifyError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      navigate('/profile/orders');
    }
  }, [orderId, isAuthenticated, navigate, notifyError]);

  const getOrderProgress = (status) => {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(status);
    return {
      currentStep: currentIndex + 1,
      totalSteps: statuses.length,
      steps: statuses.map((step, index) => ({
        name: step,
        completed: index <= currentIndex,
        active: index === currentIndex
      }))
    };
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (orderDate, status) => {
    const order = new Date(orderDate);
    const estimatedDays = status === 'Shipped' ? 2 : 5;
    const estimated = new Date(order);
    estimated.setDate(order.getDate() + estimatedDays);
    
    return estimated.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="track-order-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="track-order-page">
        <div className="container">
          <div className="error-state">
            <h1>Order Not Found</h1>
            <p>{error || 'The order you are looking for could not be found.'}</p>
            <div className="error-actions">
              <Link to="/profile/orders" className="btn">
                View All Orders
              </Link>
              <button 
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = getOrderProgress(order.status || 'Processing');

  return (
    <div className="track-order-page">
      <div className="container">
        <div className="page-header">
          <Link to="/profile/orders" className="back-link">
            ← Back to Orders
          </Link>
          <h1>Track Your Order</h1>
          <p className="order-number">Order #{order._id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="tracking-layout">
          <div className="tracking-main">
            {/* Order Progress */}
            <div className="order-progress-card">
              <h2>Order Status</h2>
              <div className="progress-timeline">
                {progress.steps.map((step, index) => (
                  <div 
                    key={step.name} 
                    className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
                  >
                    <div className="step-indicator">
                      {step.completed ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.name}</div>
                      {step.active && (
                        <div className="step-description">
                          {step.name === 'Processing' && 'We are preparing your order'}
                          {step.name === 'Shipped' && 'Your order is on its way'}
                          {step.name === 'Delivered' && 'Your order has been delivered'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="order-timeline-card">
              <h2>Order Timeline</h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot active"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Order Placed</div>
                    <div className="timeline-date">{formatOrderDate(order.createdAt)}</div>
                    <div className="timeline-description">
                      Your order has been placed and is being processed.
                    </div>
                  </div>
                </div>

                {order.status !== 'Processing' && (
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Order Confirmed</div>
                      <div className="timeline-date">{formatOrderDate(order.createdAt)}</div>
                      <div className="timeline-description">
                        Your order has been confirmed and is being prepared for shipment.
                      </div>
                    </div>
                  </div>
                )}

                {(order.status === 'Shipped' || order.status === 'Delivered') && (
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Order Shipped</div>
                      <div className="timeline-date">{formatOrderDate(order.updatedAt || order.createdAt)}</div>
                      <div className="timeline-description">
                        Your order has been shipped and is on its way to you.
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'Delivered' && order.deliveredAt && (
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Order Delivered</div>
                      <div className="timeline-date">{formatOrderDate(order.deliveredAt)}</div>
                      <div className="timeline-description">
                        Your order has been successfully delivered.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tracking-sidebar">
            {/* Delivery Information */}
            <div className="delivery-info-card">
              <h3>Delivery Information</h3>
              
              <div className="delivery-detail">
                <div className="detail-label">Estimated Delivery</div>
                <div className="detail-value">
                  {order.status === 'Delivered' 
                    ? 'Delivered' 
                    : getEstimatedDelivery(order.createdAt, order.status)
                  }
                </div>
              </div>

              <div className="delivery-detail">
                <div className="detail-label">Delivery Address</div>
                <div className="detail-value">
                  <div>{order.shippingAddress?.address}</div>
                  <div>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</div>
                  <div>{order.shippingAddress?.country}</div>
                </div>
              </div>

              <div className="delivery-detail">
                <div className="detail-label">Payment Method</div>
                <div className="detail-value">{order.paymentMethod}</div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="order-items">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.image || '/images/placeholder.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        Qty: {item.qty} × {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateSubtotal(order))}</span>
                </div>
                {order.shippingPrice > 0 && (
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                  </div>
                )}
                {order.taxPrice > 0 && (
                  <div className="total-row">
                    <span>Tax</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                )}
                <div className="total-row total">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal(order))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate subtotal from order items
const calculateSubtotal = (order) => {
  if (!order) return 0;
  
  // If we have itemsPrice or subtotal field, use that
  if (order.itemsPrice) return Number(order.itemsPrice);
  if (order.subtotal) return Number(order.subtotal);
  
  // Otherwise calculate from order items
  if (order.orderItems && order.orderItems.length > 0) {
    return order.orderItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.qty || item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
  }
  
  return 0;
};

// Helper function to calculate total correctly
const calculateTotal = (order) => {
  if (!order) return 0;
  
  const subtotal = calculateSubtotal(order);
  const shipping = Number(order.shippingPrice || order.shipping || 0);
  const tax = Number(order.taxPrice || order.tax || 0);
  
  return subtotal + shipping + tax;
};

export default TrackOrderPage;