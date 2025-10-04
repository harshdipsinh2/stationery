import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      notifyError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      notifySuccess('Password reset instructions sent to your email');
    }, 1500);
  };
  
  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          {isSubmitted ? (
            <div className="password-reset-success">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
              <h1>Check Your Email</h1>
              <p>
                If an account exists for {email}, you will receive password reset instructions.
              </p>
              <p className="email-note">
                Please check your spam folder if you don't see the email in your inbox.
              </p>
              <Link to="/login" className="btn btn-large btn-full">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h1>Forgot Password</h1>
              <p className="auth-subtitle">
                Enter your email address, and we'll send you instructions to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={`btn btn-large btn-full ${isSubmitting ? 'processing' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Reset Password'}
                </button>
              </form>
              
              <div className="auth-footer">
                Remembered your password?{' '}
                <Link to="/login">Log in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
