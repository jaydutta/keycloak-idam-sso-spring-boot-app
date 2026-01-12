import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';

function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportApi.getAllReports();
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const response = await reportApi.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download report');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportApi.deleteReport(reportId);
      loadReports();
    } catch (error) {
      alert('Failed to delete report');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="report-list">
      <div className="page-header">
        <h1>My Reports</h1>
        <button onClick={() => navigate('/generate')} className="btn-primary">
          Generate New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="no-reports">
          <p>No reports yet. Generate your first report!</p>
        </div>
      ) : (
        <table className="reports-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Created</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td><span className={`badge ${report.reportType.toLowerCase()}`}>
                  {report.reportType}
                </span></td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>{(report.fileSize / 1024).toFixed(2)} KB</td>
                <td>
                  <button
                    onClick={() => handleDownload(report.id, report.fileName)}
                    className="btn-small"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
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

export default ReportList;