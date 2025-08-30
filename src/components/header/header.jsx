import "./header.css";
import Navbar from "../navbar/navbar";

function Header() {
  return (
    <header className="header">
      <div className="top-bar">
        <div className="left">
          <div className="logo-text">
            <span className="company-name">Rudra</span>
            <span className="company-type">enterprise</span>
          </div>
        </div>

        <div className="center">
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Search..." />
            <button className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="right">
          <button className="profile-btn">👤 </button>
        </div>
      </div>
      <Navbar />
    </header>
  );
}

export default Header;
