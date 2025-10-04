import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductService } from '../../services/serviceSelector';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../utils/formatPrice';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { notifySuccess, notifyError } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  // For demo purposes, we'll pretend we have multiple product images
  const productImages = [
    { url: '/images/product-1.jpg', alt: 'Product front view' },
    { url: '/images/product-2.jpg', alt: 'Product side view' },
    { url: '/images/product-3.jpg', alt: 'Product back view' },
  ];
  
  useEffect(() => {
    const fetchProductData = async () => {
      const productService = getProductService();
      try {
        setIsLoading(true);
        const fetchedProduct = await productService.getProductById(productId);
        setProduct(fetchedProduct);
        
        // Fetch products from the same category for "related products" section
        const sameCategoryProducts = await productService.getProductsByCategory(fetchedProduct.category);
        const filtered = sameCategoryProducts.filter(p => p.id !== fetchedProduct.id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching product:', error);
        notifyError('Product not found');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
  }, [productId, navigate, notifyError]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      notifySuccess(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-skeleton">
            <div className="product-gallery-skeleton">
              <div className="main-image-skeleton"></div>
              <div className="thumbnail-row">
                <div className="thumbnail-skeleton"></div>
                <div className="thumbnail-skeleton"></div>
                <div className="thumbnail-skeleton"></div>
              </div>
            </div>
            
            <div className="product-info-skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h1>Product Not Found</h1>
          <p>Sorry, the product you are looking for does not exist.</p>
          <Link to="/products" className="btn">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/categories">Categories</Link>
          <span>/</span>
          <Link to={`/categories/${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>
        
        <div className="product-detail-layout">
          <div className="product-gallery">
            {/* Display product images */}
            <div className="main-image">
              <img 
                src={product.images && product.images.length > 0
                  ? `http://localhost:5000${product.images[activeImage]}` 
                  : (product.imageUrl || productImages[activeImage]?.url || '/images/placeholder.jpg')} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>
            <div className="thumbnail-row">
              {/* Fake thumbnails for demo purposes */}
              {[0, 1, 2].map(index => (
                <button 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={productImages[index]?.url || '/images/placeholder.jpg'} 
                    alt={`Thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">{formatPrice(product.price)}</div>
            

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                {product.category && product.category.main && product.category.main.name ? (
                  <Link to={`/categories/${product.category.main._id}`}>{product.category.main.name}</Link>
                ) : (
                  <span>Uncategorized</span>
                )}
              </div>
              {product.category && product.category.sub && product.category.sub.name && (
                <div className="meta-item">
                  <span className="meta-label">Subcategory:</span>
                  <Link to={`/categories/${product.category.sub._id}`}>{product.category.sub.name}</Link>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Availability:</span>
                {product.stock > 0 ? (
                  <span className="in-stock">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>
            
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button onClick={decrementQuantity} disabled={quantity <= 1}>-</button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock} 
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                <button onClick={incrementQuantity} disabled={quantity >= product.stock}>+</button>
              </div>
              
              <button 
                className="btn btn-large add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="related-product-card">
                  <Link to={`/products/${product.id}`}>
                    <img 
                      src={product.imageUrl || '/images/placeholder.jpg'} 
                      alt={product.name} 
                    />
                    <h3>{product.name}</h3>
                    <div className="price">{formatPrice(product.price)}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile sticky add to cart button */}
      <div className="mobile-add-to-cart">
        <div className="container">
          <div className="price">{formatPrice(product.price)}</div>
          <button 
            className="btn add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
