// src/components/form/DeleteListModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/AddList.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DeleteList = ({ userId, listId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${BACKEND_URL}/lists/${userId}/${listId}/delete`, // Correct endpoint for lists
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete list');
            }

            navigate('/lists'); // Navigate after successful deletion
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-list-overlay" onClick={onClose}>
            <div className="add-list-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <div className="add-list-content">
                    <h2 className="add-list-title">🗑️ Delete List</h2>
                    <div className="form-container">
                        <p className="delete-confirm-text">
                            Are you sure you want to delete this entire list? 
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
                                onClick={onClose}
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