/**
 * Format a price in Indian Rupees (INR) format
 * @param {number} price - The price to format
 * @param {boolean} includeSymbol - Whether to include the ₹ symbol (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, includeSymbol = true) => {
  // Handle non-number inputs
  if (typeof price !== 'number' || isNaN(price)) {
    return includeSymbol ? '₹ 0' : '0';
  }

  // Format number with Indian thousand separators
  // For numbers like 1,00,000 (Indian format)
  const formattedPrice = price.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2
  });

  return includeSymbol ? `₹ ${formattedPrice}` : formattedPrice;
};
