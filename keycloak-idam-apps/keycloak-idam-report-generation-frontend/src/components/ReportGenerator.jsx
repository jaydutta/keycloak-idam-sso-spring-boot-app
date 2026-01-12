import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';

function ReportGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: 'PDF',
    data: {}
  });
  const [dataFields, setDataFields] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDataFieldChange = (index, field, value) => {
    const newFields = [...dataFields];
    newFields[index][field] = value;
    setDataFields(newFields);
  };

  const addDataField = () => {
    setDataFields([...dataFields, { key: '', value: '' }]);
  };

  const removeDataField = (index) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataObj = {};
    dataFields.forEach(field => {
      if (field.key && field.value) {
        dataObj[field.key] = field.value;
      }
    });

    try {
      await reportApi.generateReport({
        ...formData,
        data: dataObj
      });
      navigate('/');
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <h1>Generate New Report</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Report Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Report Type</label>
          <select
            name="reportType"
            value={formData.reportType}
            onChange={handleChange}
          >
            <option value="PDF">PDF</option>
            <option value="EXCEL">Excel</option>
            <option value="CSV">CSV</option>
          </select>
        </div>

        <div className="form-group">
          <label>Report Data</label>
          {dataFields.map((field, index) => (
            <div key={index} className="data-field">
              <input
                type="text"
                placeholder="Field name"
                value={field.key}
                onChange={(e) => handleDataFieldChange(index, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleDataFieldChange(index, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeDataField(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addDataField} className="btn-secondary">
            Add Field
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportGenerator;