// Additional structure for mobile view
export const MobileCartItem = ({ item, handleQuantityChange, handleRemoveItem, formatPrice, stockValidation }) => {
  return (
    <div className="item-details-wrapper">
      <div className="item-detail-row">
        <span className="detail-label">Price:</span>
        <div className="item-price">{formatPrice(item.price)}</div>
      </div>
      <div className="item-detail-row">
        <span className="detail-label">Quantity:</span>
        <div className="item-quantity">
          <div className="quantity-selector">
            <button 
              className="quantity-btn quantity-decrease"
              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="quantity-value">{item.quantity}</span>
            <button 
              className="quantity-btn quantity-increase"
              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
              disabled={
                stockValidation && stockValidation[item._id] && 
                item.quantity >= stockValidation[item._id].available
              }
              aria-label="Increase quantity"
              title={
                stockValidation && stockValidation[item._id] && 
                item.quantity >= stockValidation[item._id].available
                  ? `Only ${stockValidation[item._id].available} items available`
                  : "Increase quantity"
              }
            >
              +
            </button>
          </div>
        </div>
      </div>
      {stockValidation && stockValidation[item._id] && !stockValidation[item._id].isValid && (
        <div className="item-detail-row">
          <span className="detail-label">Stock:</span>
          <div className="stock-warning">
            ⚠️ Only {stockValidation[item._id].available} left
          </div>
        </div>
      )}
      <div className="item-detail-row">
        <span className="detail-label">Total:</span>
        <div className="item-total">
          {formatPrice(item.price * item.quantity)}
        </div>
      </div>
    </div>
  );
};
