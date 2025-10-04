import { apiService } from './apiService';

const orderService = {
  // Create a new order in the database
  createOrder: async (orderData) => {
    try {
      console.log('📦 Creating order in database:', orderData);
      const response = await apiService.post('/orders', orderData);
      console.log('✅ Order created successfully:', response);
      // Return the response directly since apiService already extracts the data
      return response;
    } catch (error) {
      console.error('❌ Error creating order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create order');
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      const response = await apiService.get('/orders/myorders');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user orders:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await apiService.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  // Update order payment status
  updateOrderPayment: async (orderId, paymentResult) => {
    try {
      const response = await apiService.put(`/orders/${orderId}/pay`, paymentResult);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update payment');
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      console.log('📦 Fetching user orders from API');
      const response = await apiService.get('/orders/myorders');
      console.log('✅ User orders fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user orders:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log(`📦 Fetching order ${orderId} from API`);
      const response = await apiService.get(`/orders/${orderId}`);
      console.log('✅ Order fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching order ${orderId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order');
    }
  },

  // Update order payment status
  updateOrderPayment: async (orderId, paymentResult) => {
    try {
      const response = await apiService.put(`/orders/${orderId}/pay`, paymentResult);
      return response;
    } catch (error) {
      console.error('❌ Error updating payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update payment');
    }
  },

  // Convert cart items to order items format expected by backend
  formatOrderItems: (cartItems) => {
    return cartItems.map(item => {
      // Helper function to get product image URL (same as CartPage)
      const getImageUrl = (product) => {
        if (!product) return '/images/placeholder.jpg';
        
        // Handle MongoDB image structure
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const firstImage = product.images[0];
          // If it's a full URL, use it as-is
          if (firstImage.startsWith('http')) {
            return firstImage;
          }
          // If it's a relative path from uploads folder
          if (firstImage.startsWith('/uploads/') || firstImage.startsWith('uploads/')) {
            return `http://localhost:5000${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
          }
          // If it's just a filename, assume it's in uploads
          return `http://localhost:5000/uploads/${firstImage}`;
        }
        
        // Fallback to placeholder
        return '/images/placeholder.jpg';
      };

      return {
        name: item.name,
        qty: item.quantity,
        image: getImageUrl(item),
        price: item.price,
        product: item._id, // MongoDB product ID
      };
    });
  },

  // Calculate order totals
  calculateOrderTotals: (cartItems, shippingPrice = 0, taxRate = 0.08) => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = Number((itemsPrice * taxRate).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    return {
      itemsPrice: Number(itemsPrice.toFixed(2)),
      shippingPrice: Number(shippingPrice.toFixed(2)),
      taxPrice,
      totalPrice,
    };
  },
};

export default orderService;