import React, { useState } from 'react';
import '../../styles/components/AddList.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


const DeleteList = ({ listId, mediaId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${BACKEND_URL}/media/${listId}/${mediaId}/delete`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete media');
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
                        🗑️ Delete Media
                    </h2>
                    
                    <div className="form-container">
                        <p className="delete-confirm-text">
                            Are you sure you want to remove this media from your list?
                            This action cannot be undone.
                        </p>

                        {error && <div className="error-message">⚠️ {error}</div>}

                        <div className="form-actions delete-actions">
                            <button
                                className="confirm-button delete-confirm"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                                className="confirm-button delete-cancel"
                                onClick={() => onClose(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteList;