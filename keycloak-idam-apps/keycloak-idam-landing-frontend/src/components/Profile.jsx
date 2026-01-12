import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8090/api/user/profile', {
        withCredentials: true
      });
      setUser(response.data);
      setFormData({
        email: response.data.email || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8090/api/user/profile', formData, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      await axios.post('http://localhost:8090/api/user/change-password', {
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>My Profile</h1>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-info">
          <div className="info-group">
            <label>Username</label>
            <div className="info-value">{user?.username}</div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="info-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="info-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>

              <div className="info-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      email: user.email || '',
                      firstName: user.firstName || '',
                      lastName: user.lastName || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="info-group">
                <label>Email</label>
                <div className="info-value">{user?.email}</div>
              </div>

              <div className="info-group">
                <label>First Name</label>
                <div className="info-value">{user?.firstName || 'Not set'}</div>
              </div>

              <div className="info-group">
                <label>Last Name</label>
                <div className="info-value">{user?.lastName || 'Not set'}</div>
              </div>

              <div className="info-group">
                <label>Roles</label>
                <div className="roles-display">
                  {user?.roles?.map(role => (
                    <span key={role} className="role-badge">{role}</span>
                  ))}
                </div>
              </div>

              <div className="info-group">
                <label>Account Status</label>
                <div className="info-value">
                  <span className={`status-badge ${user?.enabled ? 'status-active' : 'status-inactive'}`}>
                    {user?.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="button-group">
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
                <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;