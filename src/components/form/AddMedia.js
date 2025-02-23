import React, { useEffect, useState } from 'react';
import '../../styles/components/AddList.css';
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


const AddList = ({ media, onClose }) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [customRating, setCustomRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const userId = getUserIdFromToken();
        const response = await fetch(
          `${BACKEND_URL}/lists/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        if (!response.ok) throw new Error('Failed to fetch lists');
        
        const data = await response.json();
        setLists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleSaveToList = async () => {
    try {
      if (!selectedList || !selectedRating) {
        throw new Error('Please select a list and rating');
      }
  
      const mediaType = media.title ? 'movie' : 'tv';
      const userId = getUserIdFromToken(); // Get user ID from token
    
      const response = await fetch(
        `${BACKEND_URL}/media/${selectedList}/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            tmdbId: media.id,
            title: media.title || media.name,
            type: mediaType,
            rating: Number(selectedRating), // Convert to number
            review: customRating,
            userId: userId, // Add user ID to request body
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save to list');
      }
  
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  

  if (!media) return null;

  return (
    <div className="add-list-overlay" onClick={onClose}>
      <div className="add-list-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="add-list-content">
          <h2 className="add-list-title">
            🎬 {media.title || media.name}
          </h2>
          
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">
                📋 Add to List
              </label>
              <select
                className="form-select"
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose a list...</option>
                {lists.map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.title}
                  </option>
                ))}
              </select>
            </div>

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
                value={customRating}
                onChange={(e) => setCustomRating(e.target.value)}
                rows="3"
              />
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-actions">
              <button
                className="confirm-button"
                onClick={handleSaveToList}
                disabled={!selectedList || !selectedRating || loading}
              >
                {loading ? 'Loading...' : '💾 Save to List'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddList;