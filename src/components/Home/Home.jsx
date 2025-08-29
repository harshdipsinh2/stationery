import './Home.css';
import { FaBuilding, FaIndustry, FaSchool, FaBoxOpen } from 'react-icons/fa';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to Rudra Stationery</h1>
        <p className="tagline">Your One-Stop Shop for All Office & Housekeeping Needs</p>
      </section>

      <section className="about">
        <h2>About Us</h2>
        <p>
          At Rudra Stationery, we take pride in being your trusted supplier of high-quality 
          stationery, housekeeping materials, and packaging solutions. With years of experience, 
          we serve diverse clients across Ahmedabad and surrounding areas.
        </p>
      </section>

      <section className="services">
        <h2>We Serve</h2>
        <div className="service-grid">
          <div className="service-card">
            <FaBuilding className="service-icon" />
            <h3>Corporate Offices</h3>
            <p>Complete office supply solutions for businesses of all sizes</p>
          </div>
          <div className="service-card">
            <FaIndustry className="service-icon" />
            <h3>Industrial Units</h3>
            <p>Bulk supplies and packaging materials for industrial needs</p>
          </div>
          <div className="service-card">
            <FaSchool className="service-icon" />
            <h3>Educational Institutions</h3>
            <p>Quality stationery and supplies for schools and colleges</p>
          </div>
          <div className="service-card">
            <FaBoxOpen className="service-icon" />
            <h3>Retail Customers</h3>
            <p>Wide range of stationery and art supplies for individuals</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Quality Products</h3>
            <p>We source only the best quality products from trusted manufacturers</p>
          </div>
          <div className="feature">
            <h3>Competitive Pricing</h3>
            <p>Get the best value for your money with our competitive prices</p>
          </div>
          <div className="feature">
            <h3>Timely Delivery</h3>
            <p>Quick and reliable delivery service to meet your deadlines</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;