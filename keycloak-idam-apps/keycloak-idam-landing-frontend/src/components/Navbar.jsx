import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8090/api/auth/logout', {}, {
        withCredentials: true
      });
      
      if (response.data.logoutUrl) {
        window.location.href = response.data.logoutUrl;
      } else {
        window.location.href = 'http://localhost:3000';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = 'http://localhost:3000';
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
  const isNormalUser = () => hasRole('user') && !isAdmin() && !isFileUploadUser() && !isReportUser();

  if (isLoading) {
    return <div className="navbar-loading">Loading...</div>;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Multi-App System</h2>
          {user && <span className="user-welcome">Welcome, {user.firstName || user.username}</span>}
        </div>

        <ul className="navbar-menu">
          {/* Admin sees everything */}
          {isAdmin() && (
            <>
              <li>
                <button 
                  className="nav-link"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard/Landing Admin
                </button>
              </li>
              <li>
                <button 
                  className="nav-link"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
              </li>
              <li>
                <a 
                  href="http://localhost:3002" 
                  className="nav-link nav-link-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  File Upload App
                </a>
              </li>
              <li>
                <a 
                  href="http://localhost:3001" 
                  className="nav-link nav-link-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report Generation App
                </a>
              </li>
            </>
          )}

          {/* File Upload User */}
          {!isAdmin() && isFileUploadUser() && (
            <>
              <li>
                <button 
                  className="nav-link"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
              </li>
              <li>
                <a 
                  href="http://localhost:3002" 
                  className="nav-link nav-link-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  File Upload App
                </a>
              </li>
            </>
          )}

          {/* Report User */}
          {!isAdmin() && isReportUser() && (
            <>
              <li>
                <button 
                  className="nav-link"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
              </li>
              <li>
                <a 
                  href="http://localhost:3001" 
                  className="nav-link nav-link-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report Generation App
                </a>
              </li>
            </>
          )}

          {/* Normal User - Only Profile */}
          {isNormalUser() && (
            <li>
              <button 
                className="nav-link"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
            </li>
          )}

          {/* Logout button for all users */}
          <li>
            <button 
              className="nav-link logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;