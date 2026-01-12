import React from 'react';
import { Link } from 'react-router-dom';

function Navigation({ user }) {
  const handleLogout = () => {
    // Clear session and redirect to Keycloak logout
    window.location.href = 'http://localhost:8081/realms/multi-app-realm/protocol/openid-connect/logout?redirect_uri=http://localhost:3000';
  };

  const handleBackToLanding = () => {
    window.location.href = 'http://localhost:3000';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1>📊 Report Generation</h1>
        <div className="nav-links">
          <Link to="/">My Reports</Link>
          <Link to="/generate">Generate Report</Link>
          <button onClick={handleBackToLanding} className="btn-secondary">
            Back to Landing
          </button>
          <span className="user-name">{user?.firstName}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;