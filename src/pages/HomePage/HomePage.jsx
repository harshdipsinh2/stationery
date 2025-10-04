import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProductService } from '../../services/serviceSelector';
import { initializeServices } from '../../services/serviceSelector';
import './HomePage.css';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const heroSliderRef = useRef(null);
  
  const heroSlides = [
    {
      title: "Premium Stationery for Work and Study",
      subtitle: "Discover quality notebooks, pens, and office supplies at Rudra Stationery - Your trusted stationery partner since 2010.",
      image: "/images/hero-slide-1.jpg",
      fallbackColor: "linear-gradient(135deg, #3494e6, #ec6ead)",
      buttonText: "Shop Now",
      buttonLink: "/category"
    },
    {
      title: "Back to School Collection",
      subtitle: "Everything students need for success - from notebooks to calculators at unbeatable prices.",
      image: "/images/hero-slide-2.jpg",
      fallbackColor: "linear-gradient(135deg, #11998e, #38ef7d)",
      buttonText: "View Collection",
      buttonLink: "/category/office-stationery"
    },
    {
      title: "Office Essentials",
      subtitle: "Professional stationery and supplies to boost productivity in any workspace.",
      image: "/images/hero-slide-3.jpg",
      fallbackColor: "linear-gradient(135deg, #4b6cb7, #182848)",
      buttonText: "Shop Office",
      buttonLink: "/category/it-and-electrical"
    }
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Force real API mode for MongoDB connection
        localStorage.setItem('useRealAPI', 'true');
        
        // Force check of backend availability
        const result = await initializeServices();
        console.log('📋 Services initialized on HomePage, using real API:', result);
        
        // Test fetching products from MongoDB
        const productService = getProductService();
        console.log('🔍 Testing MongoDB connection by fetching products...');
        
        const products = await productService.getAllProducts();
        
        // Check the structure of the response
        if (products && products.data && Array.isArray(products.data)) {
          console.log('✅ MongoDB connection successful! Products:', products.data.length);
          // Log first product to examine structure
          if (products.data.length > 0) {
            console.log('Sample product from MongoDB:', products.data[0]);
          }
        } else if (Array.isArray(products)) {
          console.log('✅ Products fetched (array format):', products.length);
          if (products.length > 0) {
            console.log('Sample product:', products[0]);
          }
        } else {
          console.warn('⚠️ Unexpected product data format:', products);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching data on HomePage:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Auto-rotate hero slides
    const slideInterval = setInterval(() => {
      setActiveHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, []);
  
  return (
    <div className="home-page">
      <section className="hero-slider" ref={heroSliderRef}>
        <div className="hero-slides-container">
          {heroSlides.map((slide, index) => (
            <div 
              key={index} 
              className={`hero-slide ${index === activeHeroSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${slide.image}), ${slide.fallbackColor}`,
              }}
              data-slide-id={`slide-${index + 1}`}
            >
              <div className="container">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <Link to={slide.buttonLink} className="btn btn-primary btn-large">
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <button 
              key={index} 
              className={`hero-dot ${index === activeHeroSlide ? 'active' : ''}`}
              onClick={() => setActiveHeroSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
      
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
                </svg>
              </div>
              <h3>Free Shipping</h3>
              <p>On all orders over ₹500</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z"/>
                </svg>
              </div>
              <h3>Customer Support</h3>
              <p>24/7 dedicated assistance</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                </svg>
              </div>
              <h3>Secure Payment</h3>
              <p>100% secure payment</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                  <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products section removed */}
      
      {/* New Arrivals section removed */}
      
      {/* Shop by Category section removed */}
      
      <section className="promotion-section">
        <div className="container">
          <div className="promotions-grid">
            <div className="promotion-card primary">
              <div className="promotion-content">
                <span className="promo-label">Limited Time</span>
                <h2>Back to School Sale</h2>
                <p>Get up to 30% off on all school supplies</p>
                <Link to="/category/office-stationery" className="btn btn-outline">
                  Shop Now
                </Link>
              </div>
            </div>
            
            <div className="promotion-card secondary">
              <div className="promotion-content">
                <span className="promo-label">New Collection</span>
                <h2>Premium Office Supplies</h2>
                <p>Upgrade your workspace with our premium collection</p>
                <Link to="/category/office-stationery" className="btn btn-outline">
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header center">
            <h2>What Our Customers Say</h2>
          </div>
          
          <p className="section-description center">
            Don't just take our word for it - see what our customers have to say about their experience shopping with us.
          </p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                ))}
              </div>
              <p className="testimonial-text">"The quality of the notebooks I ordered exceeded my expectations. The paper is thick and doesn't bleed through. Will definitely purchase again!"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RM</div>
                <div className="testimonial-info">
                  <h4>Rahul Mehta</h4>
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                ))}
              </div>
              <p className="testimonial-text">"Fast shipping and excellent customer service. The team was very helpful when I needed to change my order. Will shop here again."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PK</div>
                <div className="testimonial-info">
                  <h4>Priya Kapoor</h4>
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                ))}
              </div>
              <p className="testimonial-text">"I've been ordering my office supplies from Therudranterprise for over a year now. The products are consistently high-quality and competitively priced."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AS</div>
                <div className="testimonial-info">
                  <h4>Arjun Singh</h4>
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-container">
            <div className="newsletter-content">
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter for exclusive offers, new arrivals, and stationery tips.</p>
              
              <form className="newsletter-form">
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="form-control"
                    aria-label="Email address for newsletter subscription"
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </div>
                <div className="form-check">
                  <input type="checkbox" id="newsletter-consent" className="form-check-input" />
                  <label htmlFor="newsletter-consent" className="form-check-label">
                    I agree to receive promotional emails and accept the <Link to="/privacy-policy">Privacy Policy</Link>
                  </label>
                </div>
              </form>
            </div>
            <div className="newsletter-image">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trusted Brands section removed */}
    </div>
  );
};

export default HomePage;
