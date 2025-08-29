import './footer.css';
import { FaInstagram, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <FaMapMarkerAlt className="footer-icon" />
          <p>
            Rudra Stationery Xerox G F 14 Sholk Elysium Opp Uma Bungalows B/H Ganesh Bungalows R C Technical, 
            R C Technical College Road, Ahemdabad, Ellis Bridge-380006
          </p>
        </div>
        
        <div className="footer-section">
          <div className="contact-item">
            <FaPhone className="footer-icon" />
            <a href="tel:+917043493618">+91 70434 93618</a>
          </div>
          
          <div className="contact-item">
            <FaInstagram className="footer-icon" />
            <a href="https://www.instagram.com/rudrastationaryxerox/" target="_blank" rel="noopener noreferrer">
              @rudrastationaryxerox
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Rudra Stationery. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;