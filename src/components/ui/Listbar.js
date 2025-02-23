import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../styles/components/Listbar.css';
import logo from '../../assets/logo4.svg';
import DeleteList from '../form/DeleteList';


const Sidebar = ({ onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const { userId, listId } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src={logo} 
          alt="MyList Logo" 
          className="sidebar-logo"
        />
        <h2>MyList</h2>
      </div>
      <nav className="sidebar-nav">
        <Link to="/lists" className="nav-link">
          <span className="nav-icon">◀️</span>
          <span className="nav-text">Back</span>
        </Link>
        <Link to={`/list/${userId}/${listId}`} className="nav-link">
          <span className="nav-icon">📂</span>
          <span className="nav-text">All Media</span>
        </Link>
        <Link to={`/list/${userId}/${listId}/movies`} className="nav-link">
          <span className="nav-icon">🎥</span>
          <span className="nav-text">Movies</span>
        </Link>
        <Link to={`/list/${userId}/${listId}/tvshows`} className="nav-link">
          <span className="nav-icon">📺</span>
          <span className="nav-text">TV Shows</span>
        </Link>
        <div className="nav-link" onClick={() => setShowDeleteModal(true)}>
          <span className="nav-icon">🗑️</span>
          <span className="nav-text">Delete List</span>
        </div>
      </nav>

      
      {showDeleteModal && (
        <DeleteList
          userId={userId}
          listId={listId}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;


