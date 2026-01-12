import React from 'react';
import '../styles/LandingPage.css';

function LandingPage({ user }) {
  const hasRole = (role) => {
    if (!user?.roles) return false;
    console.log('Checking role:', role, 'User roles:', user.roles);
    return user.roles.some(r => {
      const authority = typeof r === 'string' ? r : r.authority;
      return authority === `ROLE_${role}` || authority === role;
    });
  };

  const isAdmin = () => hasRole('admin');
  const isFileUploadUser = () => hasRole('file-upload-user') || hasRole('fileuploaduser') || hasRole('file_user');
  const isReportUser = () => hasRole('report-user') || hasRole('reportuser') || hasRole('report_user');

  const navigateToFileApp = () => {
    // Open File Upload frontend in new tab
    // It will handle its own authentication with Keycloak SSO
    window.open('http://localhost:3002', '_blank');
  };

  const navigateToReportApp = () => {
    // Open Report Generation frontend in new tab
    // It will handle its own authentication with Keycloak SSO
    window.open('http://localhost:3001', '_blank');
  };

  return (
    <div className="landing-page">
      <div className="welcome-section">
        <h1>Welcome to Multi-App System</h1>
        <p className="welcome-text">
          Hello, <strong>{user?.firstName || user?.username}</strong>! 
          Select an application to continue:
        </p>
      </div>

      <div className="apps-grid">
        {/* Admin Dashboard Card - Only for Admins */}
        {isAdmin() && (
          <div className="app-card admin-card">
            <div className="app-icon">👨‍💼</div>
            <h2>Admin Dashboard</h2>
            <p>Manage users, roles, and system settings</p>
            <button 
              onClick={() => window.location.href = '/users'}
              className="btn-primary"
            >
              Open Dashboard
            </button>
          </div>
        )}

        {/* Report Generation App */}
        {(isAdmin() || isReportUser()) && (
          <div className="app-card report-card">
            <div className="app-icon">📊</div>
            <h2>Report Generation</h2>
            <p>Create and manage reports in various formats</p>
            <button 
              onClick={navigateToReportApp}
              className="btn-primary"
            >
              Open Report App
            </button>
          </div>
        )}

        {/* File Upload App */}
        {(isAdmin() || isFileUploadUser()) && (
          <div className="app-card file-card">
            <div className="app-icon">📁</div>
            <h2>File Upload</h2>
            <p>Upload and manage your files securely</p>
            <button 
              onClick={navigateToFileApp}
              className="btn-primary"
            >
              Open File App
            </button>
          </div>
        )}

        {/* Profile Card - Available to all */}
        <div className="app-card profile-card">
          <div className="app-icon">👤</div>
          <h2>My Profile</h2>
          <p>View and update your profile information</p>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="btn-primary"
          >
            View Profile
          </button>
        </div>

        {/* No Access Message */}
        {!isAdmin() && !isReportUser() && !isFileUploadUser() && (
          <div className="no-access">
            <h3>Limited Access</h3>
            <p>You currently have access to your profile only.</p>
            <p>Contact your administrator for additional permissions.</p>
          </div>
        )}
      </div>

      <div className="user-info">
        <h3>Your Account Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Full Name:</span>
            <span className="info-value">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Roles:</span>
            <span className="info-value roles-display">
              {user?.roles?.map((r, index) => {
                const authority = typeof r === 'string' ? r : r.authority;
                const roleName = authority.replace('ROLE_', '');
                return (
                  <span key={index} className="role-badge">
                    {roleName}
                  </span>
                );
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;