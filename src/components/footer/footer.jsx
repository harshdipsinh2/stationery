import './footer.css';
import { FaInstagram, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Address Section */}
        <div className="footer-section">
          <h3 className="footer-title">Our Location</h3>
          <div className="footer-address">
            <FaMapMarkerAlt className="footer-icon" />
            <p>
              Rudra Stationery Xerox <br />
              G F 14 Sholk Elysium Opp Uma Bungalows <br />
              B/H Ganesh Bungalows R C Technical, <br />
              R C Technical College Road, Ahmedabad, Ellis Bridge-380006
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <div className="contact-item">
            <FaPhone className="footer-icon" />
            <a href="tel:+917043493618">+91 70434 93618</a>
          </div>
          <div className="contact-item">
            <FaInstagram className="footer-icon" />
            <a 
              href="https://www.instagram.com/rudrastationaryxerox/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              @rudrastationaryxerox
            </a>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="footer-section map-container">
          <h3 className="footer-title">Find Us on Map</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3682.554673348186!2d72.5292361!3d23.0811826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e83006bb5e1c9%3A0x49a4374b7e352d02!2sRudra%20Enterprise%20Stationery%20%26%20xerox!5e0!3m2!1sen!2sin!4v1694000000000!5m2!1sen!2sin"
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: "10px" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Rudra Stationery Location"
          ></iframe>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Rudra Stationery. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
