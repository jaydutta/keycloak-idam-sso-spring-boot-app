import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileApi } from '../services/api';

function FileUpload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      await fileApi.uploadFile(selectedFile);
      navigate('/');
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="file-upload-page">
      <h1>Upload File</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="upload-container">
        <div className="upload-area">
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="upload-label">
            <div className="upload-icon">📤</div>
            <p>Click to select a file</p>
            <p className="upload-hint">Maximum file size: 50MB</p>
          </label>
        </div>

        {selectedFile && (
          <div className="selected-file">
            <h3>Selected File:</h3>
            <div className="file-details">
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
              <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;