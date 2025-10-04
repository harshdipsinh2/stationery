import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthService } from '../../services/serviceSelector';
import './ProfilePage.css';

// Profile subpages
import ProfileInfo from './ProfileInfo';
import ProfileOrders from './ProfileOrders';
import ProfileSettings from './ProfileSettings';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const authService = getAuthService();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/orders')) {
      setActiveTab('orders');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('info');
    }
  }, [location]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div className="loading-profile">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h1>My Account</h1>
          <div className="welcome-text">Welcome back, <span className="user-name">{user.name}</span>!</div>
        </div>
      </div>

      <div className="profile-content">
        <aside className="profile-sidebar">
          <div className="user-info">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <ul>
              <li className={activeTab === 'info' ? 'active' : ''}>
                <Link to="/profile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile Information
                </Link>
              </li>
              <li className={activeTab === 'orders' ? 'active' : ''}>
                <Link to="/profile/orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Order History
                </Link>
              </li>
              <li className={activeTab === 'settings' ? 'active' : ''}>
                <Link to="/profile/settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Account Settings
                </Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="profile-main">
          <Routes>
            <Route index element={<ProfileInfo />} />
            <Route path="orders" element={<ProfileOrders />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}