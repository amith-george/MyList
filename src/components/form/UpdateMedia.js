import React, { useEffect, useState } from 'react';
import '../../styles/components/AddList.css'; // Reuse AddList styles
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


const UpdateList = ({ mediaId, currentRating, currentReview, onClose }) => {
  const [selectedRating, setSelectedRating] = useState(currentRating || '');
  const [customReview, setCustomReview] = useState(currentReview || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize form with existing values
    setSelectedRating(currentRating);
    setCustomReview(currentReview);
  }, [currentRating, currentReview]);

  const handleUpdateMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/media/${mediaId}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
            review: customReview,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update media');
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
        <button className="close-button" onClick={() => onClose(false)}>×</button>
        
        <div className="add-list-content">
          <h2 className="add-list-title">
            ✏️ Update Media
          </h2>
          
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">
                ⭐ Rating Score
              </label>
              <select
                className="form-select"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option value="">Select numerical rating...</option>
                <option value="10">10 (Masterpiece)</option>
                <option value="9">9 (Great)</option>
                <option value="8">8 (Very Good)</option>
                <option value="7">7 (Good)</option>
                <option value="6">6 (Fine)</option>
                <option value="5">5 (Average)</option>
                <option value="4">4 (Bad)</option>
                <option value="3">3 (Very Bad)</option>
                <option value="2">2 (Horrible)</option>
                <option value="1">1 (Appalling)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                📝 Review Comments
              </label>
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts about this media..."
                value={customReview}
                onChange={(e) => setCustomReview(e.target.value)}
                rows="3"
              />
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-actions">
              <button
                className="confirm-button"
                onClick={handleUpdateMedia}
                disabled={loading}
              >
                {loading ? 'Updating...' : '📝 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateList;