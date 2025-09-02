import React from "react";
import "./ProfilePage.css";
import { Mail, Phone, Home, User } from "lucide-react"; // lightweight icons

function ProfilePage() {
  const user = {
    name: "Jayveersinh Gohil",
    address: "Ahmedabad, India",
    phone: "+91 70******68",
    email: "jayv*******0@example.com",
  };

  return (
    <div id="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.name.charAt(0)}
          </div>
          <h2>{user.name}</h2>
          <p className="profile-subtitle">Member since 2025</p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <User size={18} />
            <span>{user.name}</span>
          </div>
          <div className="detail-item">
            <Home size={18} />
            <span>{user.address}</span>
          </div>
          <div className="detail-item">
            <Phone size={18} />
            <span>{user.phone}</span>
          </div>
          <div className="detail-item">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}

export default ProfilePage;
