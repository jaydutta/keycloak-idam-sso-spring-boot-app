import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import '../styles/Navigation.css';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const hasRole = (role) => {
    if (!user?.roles) return false;
    return user.roles.some(r => {
      const authority = typeof r === 'string' ? r : r.authority;
      return authority === `ROLE_${role}` || authority === role;
    });
  };

  const isAdmin = () => hasRole('admin');
  const isFileUploadUser = () => hasRole('file-upload-user') || hasRole('fileuploaduser') || hasRole('file_user');
  const isReportUser = () => hasRole('report-user') || hasRole('reportuser') || hasRole('report_user');

  const handleLogout = async () => {
    try {
      const response = await authApi.logout();
      // Redirect to Keycloak logout URL
      if (response.data.logoutUrl) {
        window.location.href = response.data.logoutUrl;
      } else {
        // Fallback
        window.location.href = 'http://localhost:8081/realms/multi-app-realm/protocol/openid-connect/logout?post_logout_redirect_uri=http://localhost:3000&client_id=landing-page-client';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback direct logout
      window.location.href = 'http://localhost:8081/realms/multi-app-realm/protocol/openid-connect/logout?post_logout_redirect_uri=http://localhost:3000&client_id=landing-page-client';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Multi-App System</h1>
          {user && (
            <span className="user-welcome">
              Welcome, {user.firstName || user.username}
            </span>
          )}
        </div>
        
        <div className="nav-links">
          {/* Admin sees Dashboard/Landing Admin, Profile, and both apps */}
          {isAdmin() && (
            <>
              <Link 
                to="/users" 
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
              >
                Dashboard/Landing Admin
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
              <a 
                href="http://localhost:3002" 
                className="nav-link nav-external"
                target="_blank"
                rel="noopener noreferrer"
              >
                File Upload App
              </a>
              <a 
                href="http://localhost:3001" 
                className="nav-link nav-external"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report Generation App
              </a>
            </>
          )}

          {/* File Upload User (non-admin) sees Profile and File Upload App */}
          {!isAdmin() && isFileUploadUser() && (
            <>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
              <a 
                href="http://localhost:3002" 
                className="nav-link nav-external"
                target="_blank"
                rel="noopener noreferrer"
              >
                File Upload App
              </a>
            </>
          )}

          {/* Report User (non-admin) sees Profile and Report Generation App */}
          {!isAdmin() && isReportUser() && !isFileUploadUser() && (
            <>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
              <a 
                href="http://localhost:3001" 
                className="nav-link nav-external"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report Generation App
              </a>
            </>
          )}

          {/* Normal User (no special roles) sees only Profile */}
          {!isAdmin() && !isFileUploadUser() && !isReportUser() && (
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
          )}

          {/* Logout button for all users */}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;