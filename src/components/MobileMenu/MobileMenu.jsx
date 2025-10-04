import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({ menuItems = [], isAuthenticated, user, onLogout }) => {
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleSubMenu = (index) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(item => item !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  return (
    <div className="mobile-menu">
      <div className="mobile-menu-container">
        {isAuthenticated ? (
          <div className="mobile-user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0) : ''}
            </div>
            <div className="user-details">
              <p className="welcome-text">Hello, {user.name}</p>
              <Link to="/profile" className="view-profile">View Profile</Link>
            </div>
          </div>
        ) : (
          <div className="mobile-auth-links">
            <Link to="/login" className="auth-button login">Login</Link>
            <Link to="/register" className="auth-button register">Register</Link>
          </div>
        )}

        <nav className="mobile-nav">
          <ul className="mobile-menu-items">
            {menuItems.map((item, index) => (
              <li key={index} className={`mobile-menu-item ${expandedItems.includes(index) ? 'expanded' : ''}`}>
                {item.columns ? (
                  <>
                    <button 
                      className="mobile-menu-toggle" 
                      onClick={() => toggleSubMenu(index)}
                      aria-expanded={expandedItems.includes(index)}
                    >
                      {item.title}
                      <span className="toggle-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                      </span>
                    </button>
                    {expandedItems.includes(index) && (
                      <div className="mobile-submenu">
                        {item.columns.map((column, colIndex) => (
                          <div key={colIndex} className="mobile-submenu-section">
                            <h3>{column.title}</h3>
                            <ul>
                              {column.links.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                  <Link to={link.path}>{link.name}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.path}>{item.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-menu-footer">
          <div className="mobile-contact">
            <a href="tel:+911234567890">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
              </svg>
              +91 12345 67890
            </a>
            <a href="mailto:info@therudranterprise.com">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
              </svg>
              info@therudranterprise.com
            </a>
          </div>

          {isAuthenticated && (
            <button onClick={onLogout} className="mobile-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
