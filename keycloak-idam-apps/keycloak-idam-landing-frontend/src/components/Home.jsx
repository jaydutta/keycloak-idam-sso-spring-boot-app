import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8090/api/auth/user', {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => 
      r.authority === `ROLE_${role}` || 
      r.authority === role ||
      (typeof r === 'string' && (r === `ROLE_${role}` || r === role))
    );
  };

  const isAdmin = () => hasRole('admin');
  const isFileUploadUser = () => hasRole('file-upload-user') || hasRole('fileuploaduser');
  const isReportUser = () => hasRole('report-user') || hasRole('reportuser');

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to Multi-App System</h1>
        {user && (
          <p className="welcome-message">
            Hello, <strong>{user.firstName || user.username}</strong>! You're logged in successfully.
          </p>
        )}
      </div>

      <div className="apps-grid">
        {/* Admin Dashboard */}
        {isAdmin() && (
          <div className="app-card admin-card">
            <div className="card-icon">👨‍💼</div>
            <h3>Admin Dashboard</h3>
            <p>Manage users, roles, and system settings</p>
            <a href="/dashboard" className="card-button">
              Go to Dashboard
            </a>
          </div>
        )}

        {/* File Upload App */}
        {(isAdmin() || isFileUploadUser()) && (
          <div className="app-card file-card">
            <div className="card-icon">📁</div>
            <h3>File Upload App</h3>
            <p>Upload, manage, and share your files</p>
            <a 
              href="http://localhost:3002" 
              className="card-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open File Upload
            </a>
          </div>
        )}

        {/* Report Generation App */}
        {(isAdmin() || isReportUser()) && (
          <div className="app-card report-card">
            <div className="card-icon">📊</div>
            <h3>Report Generation App</h3>
            <p>Create and download various reports</p>
            <a 
              href="http://localhost:3001" 
              className="card-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Report Generator
            </a>
          </div>
        )}

        {/* Profile - Available to all users */}
        <div className="app-card profile-card">
          <div className="card-icon">👤</div>
          <h3>My Profile</h3>
          <p>View and update your profile information</p>
          <a href="/profile" className="card-button">
            View Profile
          </a>
        </div>
      </div>

      {user && (
        <div className="user-info-section">
          <h2>Your Access Level</h2>
          <div className="roles-display">
            {user.roles?.map((role, index) => {
              const roleName = typeof role === 'string' ? role : role.authority;
              return (
                <span key={index} className="role-badge">
                  {roleName.replace('ROLE_', '')}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;