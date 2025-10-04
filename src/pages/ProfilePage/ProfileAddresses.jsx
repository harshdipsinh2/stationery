import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileAddresses.css';

export default function ProfileAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([
    // If user has address in their profile, add it as the first address
    ...(user?.address ? [{
      id: 'default',
      isDefault: true,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ')[1] || '',
      street: user.address.street || '',
      city: user.address.city || '',
      state: user.address.state || '',
      zipCode: user.address.zipCode || '',
      country: user.address.country || '',
    }] : [])
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    setNewAddress(prev => ({
      ...prev,
      isDefault: e.target.checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing address
      const updatedAddresses = addresses.map(addr => 
        addr.id === editingId ? { ...newAddress, id: editingId } : addr
      );
      
      // Handle default address change
      if (newAddress.isDefault) {
        updatedAddresses.forEach(addr => {
          if (addr.id !== editingId) {
            addr.isDefault = false;
          }
        });
      }
      
      setAddresses(updatedAddresses);
      setEditingId(null);
    } else {
      // Add new address
      const newId = `address-${Date.now()}`;
      const addressToAdd = { ...newAddress, id: newId };
      
      // Handle default address
      if (addressToAdd.isDefault) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: false
        })).concat(addressToAdd));
      } else {
        setAddresses(prev => [...prev, addressToAdd]);
      }
    }
    
    // Reset form
    setNewAddress({
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setShowAddForm(false);
  };

  const handleEditClick = (address) => {
    setNewAddress({ ...address });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDeleteClick = (addressId) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setNewAddress({
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setShowAddForm(false);
  };

  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h2>Saved Addresses</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="button-primary"
          >
            Add New Address
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="address-form-container">
          <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={newAddress.firstName} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={newAddress.lastName} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input 
                type="text" 
                id="street" 
                name="street" 
                value={newAddress.street} 
                onChange={handleAddressChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  value={newAddress.city} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input 
                  type="text" 
                  id="state" 
                  name="state" 
                  value={newAddress.state} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">Zip/Postal Code</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  name="zipCode" 
                  value={newAddress.zipCode} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input 
                  type="text" 
                  id="country" 
                  name="country" 
                  value={newAddress.country} 
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isDefault" 
                name="isDefault" 
                checked={newAddress.isDefault} 
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isDefault">Set as default address</label>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="button-primary">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button 
                type="button" 
                onClick={handleCancelClick}
                className="button-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="addresses-list">
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>You don't have any saved addresses yet.</p>
          </div>
        ) : (
          addresses.map(address => (
            <div className="address-card" key={address.id}>
              {address.isDefault && <div className="address-default">Default</div>}
              
              <div className="address-name">
                {address.firstName} {address.lastName}
              </div>
              <div className="address-details">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
              </div>
              
              <div className="address-actions">
                <button 
                  onClick={() => handleEditClick(address)}
                  className="button-secondary button-small"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteClick(address.id)}
                  className="button-danger button-small"
                  disabled={addresses.length === 1 || address.isDefault}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}