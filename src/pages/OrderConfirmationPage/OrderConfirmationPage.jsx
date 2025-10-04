import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  // Get the order ID from URL parameters
  const { orderId } = useParams();
  const [orderNumber, setOrderNumber] = useState(null);
  
  useEffect(() => {
    if (orderId) {
      // Store the order ID in local storage to maintain it even after page refresh
      localStorage.setItem('lastOrderId', orderId);
      setOrderNumber(orderId);
    } else {
      // If no order ID in URL, try to get from local storage
      const storedOrderId = localStorage.getItem('lastOrderId');
      if (storedOrderId) {
        setOrderNumber(storedOrderId);
      } else {
        // If no stored order ID, redirect to home page
        navigate('/');
      }
    }
  }, [orderId, navigate]);
  
  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          
          <h1>Order Confirmed!</h1>
          
          <p className="order-number">
            Order Number: <span>#{orderNumber}</span>
          </p>
          
          <p className="confirmation-message">
            Thank you for your purchase. We've received your order and will begin processing it right away.
            You will receive an email confirmation shortly.
          </p>
          
          <div className="order-info">
            <div className="info-item">
              <h3>Estimated Delivery</h3>
              <p>September 18-25, 2025</p>
            </div>
            
            <div className="info-item">
              <h3>Payment Method</h3>
              <p>Cash on Delivery (COD)</p>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <Link to="/profile/orders" className="btn">
              Track Order
            </Link>
            <Link to="/" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
