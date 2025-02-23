import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/ui/Sidebar';
import Card from '../../components/form/Card';
import ScrollArrow from '../../components/ui/ScrollArrow';
import '../../styles/pages/ProfilePage.css';
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simple debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [bioError, setBioError] = useState('');
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [scrollPositions, setScrollPositions] = useState({});
  const scrollRefs = useRef({});

  // Enrichment function remains unchanged
  const fetchMediaDetails = async (mediaItems) => {
    const token = localStorage.getItem('token');
    return Promise.all(
      mediaItems.map(async (item) => {
        try {
          const tmdbResponse = await axios.get(
            `${BACKEND_URL}/tmdb/${item.type}/${item.tmdbId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return {
            ...item,
            poster_path: tmdbResponse.data.poster_path,
            list: item.listname || 'Default List',
            media_type: item.type,
            release_date: item.releaseDate,
            title: item.title,
          };
        } catch (error) {
          console.error('Error fetching TMDB data:', error);
          return {
            ...item,
            poster_path: null,
            list: item.listname || 'Default List',
            media_type: item.type,
            release_date: item.releaseDate,
            title: item.title,
          };
        }
      })
    );
  };

  // Load user data and media on mount
  useEffect(() => {
    const loadData = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        navigate('/login');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${BACKEND_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userResponse.data);
        setNewBio(userResponse.data.bio || '');
        const [moviesRes, tvRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/media/latest/${userId}/movie`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKEND_URL}/media/latest/${userId}/tv`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        // Enrich media items
        const moviesWithDetails = await fetchMediaDetails(moviesRes.data);
        const tvShowsWithDetails = await fetchMediaDetails(tvRes.data);
        setMovies(moviesWithDetails);
        setTvShows(tvShowsWithDetails);
      } catch (error) {
        console.error('Error loading data:', error);
        navigate('/login');
      } finally {
        setIsLoadingMedia(false);
      }
    };
    loadData();
  }, [navigate]);

  // Debounced scroll handler to update arrow visibility
  const handleScrollEvent = useCallback(
    debounce(() => {
      const newPositions = {};
      Object.keys(scrollRefs.current).forEach((key) => {
        const container = scrollRefs.current[key];
        if (container) {
          newPositions[key] = {
            left: container.scrollLeft,
            right: container.scrollWidth - container.clientWidth - container.scrollLeft,
          };
        }
      });
      setScrollPositions((prev) => ({ ...prev, ...newPositions }));
    }, 100),
    []
  );

  // Attach scroll listeners to each container
  useEffect(() => {
    const containers = Object.values(scrollRefs.current).filter(Boolean);
    containers.forEach((container) => {
      container.addEventListener('scroll', handleScrollEvent, { passive: true });
    });
    // Initialize positions
    handleScrollEvent();
    return () => {
      containers.forEach((container) => {
        container.removeEventListener('scroll', handleScrollEvent);
      });
    };
  }, [movies, tvShows, handleScrollEvent]);

  // Scroll container by a fixed amount when an arrow is clicked
  const handleScroll = (sectionKey, direction) => {
    const container = scrollRefs.current[sectionKey];
    if (container) {
      const scrollAmount = 600;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
      // Force update after the smooth scroll completes
      setTimeout(() => {
        handleScrollEvent();
      }, 400);
    }
  };

  // Handle bio update with a maximum of 200 words
  const handleBioUpdate = async () => {
    // Count words in newBio
    const wordCount = newBio.trim().split(/\s+/).filter(word => word !== '').length;
    if (wordCount > 200) {
      setBioError(`Bio cannot exceed 200 words (currently ${wordCount} words)`);
      return;
    } else {
      setBioError('');
    }
    
    try {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_URL}/users/${userId}`,
        { bio: newBio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingBio(false);
      setUserData((prev) => ({ ...prev, bio: newBio }));
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  // Render a media section (movies or TV shows)
  const renderMediaSection = (title, media, sectionKey) => {
    if (isLoadingMedia) {
      return <div className="loading-text">Loading {title.toLowerCase()}...</div>;
    }
    if (media.length === 0) {
      return <div className="empty-message">No {title.toLowerCase()} have been added yet</div>;
    }
    // Use a threshold of 5px to account for minor offsets.
    const position = scrollPositions[sectionKey] || { left: 0, right: 0 };
    const canScrollLeft = position.left > 5;
    const canScrollRight = position.right > 5;
    return (
      <div className="media-section">
        <h2 className="section-title">{title}</h2>
        <div className="scroll-wrapper">
          <ScrollArrow
            direction="left"
            onClick={() => handleScroll(sectionKey, 'left')}
            visible={canScrollLeft}
          />
          <div
            className="scroll-container"
            ref={(el) => (scrollRefs.current[sectionKey] = el)}
          >
            {media.map((item) => (
              <Card key={item._id} media={item} profileMode={true} />
            ))}
          </div>
          <ScrollArrow
            direction="right"
            onClick={() => handleScroll(sectionKey, 'right')}
            visible={canScrollRight}
          />
        </div>
      </div>
    );
  };

  if (!userData) {
    return <div className="home-container">Loading...</div>;
  }

  return (
    <div className="home-container">
      <Sidebar />
      <div className="profile-content">
        <h1 className="profile-title">Profile Information</h1>
        <div className="profile-info-container">
          <div className="profile-info-item">
            <span className="profile-info-label">Username:</span>
            <input type="text" value={userData.username} className="profile-info-input" readOnly />
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Email:</span>
            <input type="email" value={userData.email} className="profile-info-input" readOnly />
          </div>
          <div className="profile-info-item bio-section">
            <span className="profile-info-label">About Me:</span>
            <div className="profile-info-input">
              {isEditingBio ? (
                <>
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="bio-textarea"
                    placeholder="Write something about yourself..."
                  />
                  {bioError && <div className="error-message">{bioError}</div>}
                  <div className="bio-buttons">
                    <button onClick={handleBioUpdate} className="bio-save-btn">
                      Save Changes
                    </button>
                    <button onClick={() => setIsEditingBio(false)} className="bio-cancel-btn">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bio-display">{userData.bio || 'No bio added yet.'}</div>
                  <button onClick={() => setIsEditingBio(true)} className="bio-edit-btn">
                    Edit Bio
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {renderMediaSection('Newly Added Movies', movies, 'movies')}
        {renderMediaSection('Newly Added TV Shows', tvShows, 'tv')}
      </div>
    </div>
  );
};

export default ProfilePage;
