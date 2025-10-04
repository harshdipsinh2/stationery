import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getProductService } from '../services/serviceSelector';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const authContext = useAuth();
  const user = authContext?.user;
  const productService = getProductService();

  // Create a unique cart key for each user
  const getCartKey = () => {
    return user ? `cart_${user.id || user._id}` : 'cart_guest';
  };

  // Load cart from localStorage on initial render and when user changes
  useEffect(() => {
    const loadAndValidateCart = async () => {
      setIsInitialized(false); // Reset initialization flag
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Filter out any invalid items first
          const basicValidCart = Array.isArray(parsedCart) 
            ? parsedCart.filter(item => item && item._id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number')
            : [];
          
          // Validate and enrich with fresh database data
          const enrichedCart = await validateAndEnrichCartItems(basicValidCart);
          
          setCart(enrichedCart);
          console.log(`📦 Loaded and validated cart for ${cartKey}:`, enrichedCart);
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setIsInitialized(true);
    };

    loadAndValidateCart();
  }, [user]); // Re-run when user changes

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save after initial load is complete
    if (!isInitialized) return;
    
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log(`💾 Saved cart for ${cartKey}:`, cart);
    
    // Calculate total price
    const newTotal = cart.reduce((sum, item) => {
      // Ensure item has valid price and quantity
      if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        console.warn('Invalid cart item for total calculation:', item);
        return sum;
      }
      return sum + (item.price * item.quantity);
    }, 0);
    setTotal(newTotal);
  }, [cart, user, isInitialized]); // Include isInitialized in dependencies

  // Helper function to get the unique identifier for a MongoDB product
  const getProductId = (product) => {
    return product._id; // MongoDB uses _id
  };

  // Helper to check if two MongoDB product IDs match
  const isProductMatch = (item, productId) => {
    return item._id === productId;
  };

  // Validate and enrich cart items with fresh data from database
  const validateAndEnrichCartItems = async (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return [];
    }

    try {
      const validatedItems = [];
      
      for (const item of cartItems) {
        if (!item || !item._id) {
          console.warn('Skipping invalid cart item:', item);
          continue;
        }

        try {
          // Fetch fresh product data from database
          const freshProduct = await productService.getProductById(item._id);
          
          if (freshProduct) {
            // Merge cart quantity with fresh product data
            const enrichedItem = {
              ...freshProduct,
              quantity: item.quantity || 1,
              // Ensure we have the MongoDB _id
              _id: freshProduct._id
            };
            
            validatedItems.push(enrichedItem);
          } else {
            console.warn(`Product ${item._id} not found in database, removing from cart`);
          }
        } catch (productError) {
          console.warn(`Failed to fetch product ${item._id}:`, productError.message);
          // Keep original item if we can't fetch fresh data
          if (item.name && item.price && typeof item.quantity === 'number') {
            validatedItems.push(item);
          }
        }
      }
      
      return validatedItems;
    } catch (error) {
      console.error('Error validating cart items:', error);
      // Return original items if validation fails
      return cartItems.filter(item => item && item._id && item.name && typeof item.price === 'number');
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const productId = getProductId(product);
    
    try {
      // Check stock availability before adding
      const freshProduct = await productService.getProductById(productId);
      const availableStock = freshProduct.stock || 0;
      
      setCart(prevCart => {
        // Check if item is already in cart
        const existingItem = prevCart.find(item => isProductMatch(item, productId));
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequested = currentQuantity + quantity;
        
        if (totalRequested > availableStock) {
          console.warn(`Not enough stock. Requested: ${totalRequested}, Available: ${availableStock}`);
          // Still add what we can, up to available stock
          const maxCanAdd = Math.max(0, availableStock - currentQuantity);
          if (maxCanAdd <= 0) {
            return prevCart; // Can't add any more
          }
          quantity = maxCanAdd;
        }
        
        if (existingItem) {
          // Update quantity if item exists
          const updatedCart = prevCart.map(item => 
            isProductMatch(item, productId)
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          console.log(`➕ Updated quantity for product ${productId}:`, updatedCart);
          return updatedCart;
        } else {
          // Add new item to cart with fresh data
          const newCart = [...prevCart, { ...freshProduct, quantity }];
          console.log(`🆕 Added new product to cart:`, { ...freshProduct, quantity });
          return newCart;
        }
      });
      
      return { success: true, availableStock, addedQuantity: quantity };
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to original behavior if API call fails
      setCart(prevCart => {
        const existingItem = prevCart.find(item => isProductMatch(item, productId));
        
        if (existingItem) {
          const updatedCart = prevCart.map(item => 
            isProductMatch(item, productId)
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          return updatedCart;
        } else {
          const newCart = [...prevCart, { ...product, quantity }];
          return newCart;
        }
      });
      
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        isProductMatch(item, productId)
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => !isProductMatch(item, productId)));
  };

  const clearCart = () => {
    console.log('🗑️ Clearing cart');
    setCart([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      items: cart, // Adding items as an alias for cart
      total, 
      cartCount,
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
