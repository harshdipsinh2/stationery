import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileSettings.css';

export default function ProfileSettings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email notification settings
  const [emailSettings, setEmailSettings] = useState({
    orderConfirmations: true,
    promotions: false,
    newArrivals: false,
    accountUpdates: true
  });
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Simulate password change
    setLoading(true);
    try {
      // Here we would normally call an API to change the password
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset the form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Here we would normally call an API to update notification settings
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Notification preferences updated successfully');
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <h2>Account Settings</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="profile-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input 
              type="password" 
              id="oldPassword" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-buttons">
            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="profile-section">
        <h3>Email Preferences</h3>
        <form onSubmit={handleNotificationsSubmit}>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="orderConfirmations" 
              name="orderConfirmations"
              checked={emailSettings.orderConfirmations}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="orderConfirmations">Order confirmations and updates</label>
          </div>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="promotions" 
              name="promotions"
              checked={emailSettings.promotions}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="promotions">Special offers and promotions</label>
          </div>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="newArrivals" 
              name="newArrivals"
              checked={emailSettings.newArrivals}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="newArrivals">New product arrivals</label>
          </div>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="accountUpdates" 
              name="accountUpdates"
              checked={emailSettings.accountUpdates}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="accountUpdates">Account and security updates</label>
          </div>
          
          <div className="form-buttons">
            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="profile-section">
        <h3>Delete Account</h3>
        <p className="warning-text">
          Warning: This action cannot be undone. All your data will be permanently deleted.
        </p>
        <button className="button-danger">Delete My Account</button>
      </div>
    </div>
  );
}