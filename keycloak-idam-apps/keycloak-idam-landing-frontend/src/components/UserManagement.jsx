import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import '../styles/UserManagement.css';

function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roles: [],
    enabled: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadUsers();
    await loadRoles();
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const response = await adminApi.getAllUsers();
      console.log('Users loaded:', response.data);
      setUsers(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Failed to load users:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load users';
      setError(`Failed to load users: ${errorMsg}. Make sure you have admin permissions.`);
    }
  };

  const loadRoles = async () => {
    try {
      console.log('Loading roles...');
      const response = await adminApi.getAllRoles();
      console.log('Roles loaded:', response.data);
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to load roles:', err);
      // Don't set error here, roles are less critical
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await adminApi.createUser(newUser);
      setMessage('User created successfully');
      setShowCreateModal(false);
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        roles: [],
        enabled: true,
      });
      loadUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Failed to create user: ${errorMsg}`);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await adminApi.updateUser(selectedUser.id, {
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        roles: selectedUser.roles,
        enabled: selectedUser.enabled,
      });
      setMessage('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Failed to update user: ${errorMsg}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      setMessage('User deleted successfully');
      loadUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Failed to delete user: ${errorMsg}`);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      await adminApi.resetPassword(userId, newPassword);
      setMessage('Password reset successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Failed to reset password: ${errorMsg}`);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const toggleRole = (role, isNewUser = false) => {
    if (isNewUser) {
      setNewUser(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    } else {
      setSelectedUser(prev => ({
        ...prev,
        roles: prev.roles?.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...(prev.roles || []), role]
      }));
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="page-header">
          <h1>User Management</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary"
          disabled={error && users.length === 0}
        >
          Create New User
        </button>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
          <button 
            onClick={() => setMessage('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          <div style={{ marginBottom: '0.5rem' }}>{error}</div>
          <small style={{ display: 'block', marginTop: '0.5rem' }}>
            <strong>Debug Info:</strong>
            <br />- Current user: {user?.username}
            <br />- User roles: {user?.roles?.map(r => typeof r === 'string' ? r : r.authority).join(', ')}
            <br />- Make sure the user has 'ROLE_admin' or 'admin' role in Keycloak
          </small>
          <button 
            onClick={() => setError('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', marginTop: '-2rem' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="users-table-container">
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            {error ? 'Cannot load users. Check your permissions.' : 'No users found.'}
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.roles?.join(', ') || 'No roles'}</td>
                  <td>
                    <span className={`status ${u.enabled ? 'active' : 'inactive'}`}>
                      {u.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openEditModal(u)} className="btn-small">
                        Edit
                      </button>
                      <button onClick={() => handleResetPassword(u.id)} className="btn-small">
                        Reset Password
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.username)} 
                        className="btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength="8"
                />
              </div>
              <div className="form-group">
                <label>Roles</label>
                <div className="role-checkboxes">
                  {roles.length > 0 ? (
                    roles.map(role => (
                      <label key={role} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newUser.roles.includes(role)}
                          onChange={() => toggleRole(role, true)}
                        />
                        {role}
                      </label>
                    ))
                  ) : (
                    <p>No roles available</p>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Username (cannot be changed)</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={selectedUser.firstName}
                    onChange={e => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.lastName}
                    onChange={e => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Roles</label>
                <div className="role-checkboxes">
                  {roles.length > 0 ? (
                    roles.map(role => (
                      <label key={role} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedUser.roles?.includes(role)}
                          onChange={() => toggleRole(role, false)}
                        />
                        {role}
                      </label>
                    ))
                  ) : (
                    <p>No roles available</p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedUser.enabled}
                    onChange={e => setSelectedUser({...selectedUser, enabled: e.target.checked})}
                  />
                  Enabled
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;