import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import UserManagement from './components/UserManagement';
import Navigation from './components/Navigation';
import { authApi } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Try to get the current user
      const response = await authApi.getUser();
      console.log('User data:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      // If not authenticated, redirect to OAuth2 login
      if (error.response?.status === 401 || error.code === 'ERR_NETWORK') {
        // Redirect to backend OAuth2 login endpoint
        window.location.href = 'http://localhost:8090/oauth2/authorization/keycloak';
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await authApi.logout();
      if (response.data.logoutUrl) {
        window.location.href = response.data.logoutUrl;
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback logout
      window.location.href = 'http://localhost:8081/realms/multi-app-realm/protocol/openid-connect/logout?post_logout_redirect_uri=http://localhost:3000&client_id=landing-page-client';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-container">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/users" element={<UserManagement user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;