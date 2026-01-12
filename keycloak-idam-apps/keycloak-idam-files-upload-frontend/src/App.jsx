import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Navigation from './components/Navigation';
import { userApi } from './services/api';

const API_BASE_URL = 'http://localhost:8092';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Try to get user info from the backend
      const response = await userApi.getUser();
      console.log('User data:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Not authenticated, redirecting to OAuth2 login...');
      // Redirect to backend OAuth2 endpoint
      // Keycloak SSO will recognize the user if they're already logged in
      window.location.href = `${API_BASE_URL}/oauth2/authorization/keycloak`;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = `${API_BASE_URL}/logout`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading File Upload App...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading">Authenticating...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navigation user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<FileList />} />
          <Route path="/upload" element={<FileUpload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;