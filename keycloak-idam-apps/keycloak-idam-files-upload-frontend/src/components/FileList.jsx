import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileApi } from '../services/api';

function FileList() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fileApi.getAllFiles();
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fileApi.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileApi.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="file-list">
      <div className="page-header">
        <h1>My Files</h1>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          Upload New File
        </button>
      </div>

      {files.length === 0 ? (
        <div className="no-files">
          <p>No files uploaded yet. Upload your first file!</p>
        </div>
      ) : (
        <table className="files-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.originalFileName}</td>
                <td>{file.contentType}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleDownload(file.id, file.originalFileName)}
                    className="btn-small"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileList;