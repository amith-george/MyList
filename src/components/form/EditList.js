import React, { useEffect, useState } from 'react';
import '../../styles/components/AddList.css'; // Reuse AddList styles
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EditList = ({ listId, currentTitle, currentDescription, onClose }) => {
  const [title, setTitle] = useState(currentTitle || '');
  const [description, setDescription] = useState(currentDescription || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get userId from the token to match the backend route
  const userId = getUserIdFromToken();

  useEffect(() => {
    setTitle(currentTitle);
    setDescription(currentDescription);
  }, [currentTitle, currentDescription]);

  const handleEditList = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/lists/${userId}/${listId}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update list');
      }

      onClose(true); // Pass true to indicate success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-list-overlay" onClick={() => onClose(false)}>
      <div className="add-list-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={() => onClose(false)}>
          ×
        </button>

        <div className="add-list-content">
          <h2 className="add-list-title">✏️ Edit List</h2>

          <div className="form-container">
            <div className="form-group">
              <label className="form-label">📝 List Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter list title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">📄 List Description</label>
              <textarea
                className="form-textarea"
                placeholder="Enter list description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-actions">
              <button
                className="confirm-button edit-list-confirm-button"
                onClick={handleEditList}
                disabled={loading}
              >
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditList;
