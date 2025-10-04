import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Service initialization
import { initializeServices } from './services/serviceSelector';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toast from './components/Toast/Toast';

// Pages
import HomePage from './pages/HomePage/HomePage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage/OrderConfirmationPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SearchPage from './pages/SearchPage/SearchPage';
import TrackOrderPage from './pages/TrackOrderPage/TrackOrderPage';

function App() {
  // Initialize services on component mount
  useEffect(() => {
    const init = async () => {
      const result = await initializeServices();
      console.log('Services initialized, using real API:', result);
    };
    
    init();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="app">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category" element={<CategoryPage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/category/:categoryId/:subcategory" element={<CategoryPage />} />
                  <Route path="/product/:productId" element={<CategoryPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/profile/*" element={<ProfilePage />} />
                  <Route path="/orders" element={<Navigate to="/profile/orders" replace />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
