import "./header.css";
import Navbar from "../navbar/navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="header">
      <div className="top-bar">
        <div className="left">
          <button
            className="logo-text"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            onClick={() => window.location.reload()}
            aria-label="Refresh page"
          >
            <span className="company-name">Rudra</span>
            <span className="company-type">enterprise</span>
          </button>
        </div>

        <div className="center">
          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" 
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className="right">
          <button className="cart-btn" aria-label="Cart">
            {/* Shopping cart SVG icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
            aria-label="Profile"
          >
            👤
          </button>
        </div>
      </div>
      <Navbar />
    </header>
  );
}

export default Header;
