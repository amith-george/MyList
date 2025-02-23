import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/ui/Sidebar';
import '../../styles/pages/ListPage.css';
import { getUserIdFromToken } from '../../utils/auth';
import ListCardImage from '../../assets/ListCard.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ListPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchLists();
  }, [navigate, token, userId]);

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/lists/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists(response.data);
    } catch (error) {
      setError('Failed to fetch lists');
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = () => {
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/lists/${userId}/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '' });
        await fetchLists(); // Refresh the lists
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({ title: '', description: '' });
  };

  if (loading) return <div className="list-container">Loading...</div>;
  if (error) return <div className="list-container">{error}</div>;

  return (
    <div className="list-container">
      <Sidebar />
      <div className="list-content">
        <div className="list-header">
          <h1 className="list-heading">Your Personalized Lists</h1>
          <button className="create-list-btn" onClick={handleCreateList}>
            ➕ Create List
          </button>
        </div>

        {/* Create List Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create New List</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="modal-buttons">
                  <button type="button" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="lists-grid">
          {lists.map((list) => (
            <Link 
              to={`/list/${userId}/${list._id}`} 
              className="list-card-link" 
              key={list._id}  // Moved key here
            >
              <div className="list-card">
                <img
                  src={ListCardImage}
                  alt="List thumbnail"
                  className="list-card-image"
                />
                <div className="list-card-content">
                  <h3 className="list-title">{list.title}</h3>
                  <p className="list-description">{list.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListPage;