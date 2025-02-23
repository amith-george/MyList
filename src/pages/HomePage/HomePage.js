import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/ui/Sidebar';
import Card from '../../components/form/Card';
import ScrollArrow from '../../components/ui/ScrollArrow';
import CardDetail from '../../components/form/CardDetail';
import '../../styles/pages/HomePage.css';
import { getUserIdFromToken, fetchUserData } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [sections, setSections] = useState({
    latest: [],
    topRated: [],
    action: [],
    comedy: [],
    romance: [],
    horror: [],
    animation: [],
    topTV: []
  });
  const [scrollPositions, setScrollPositions] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const scrollRefs = useRef({});

  const handleScrollEvent = useCallback(debounce(() => {
    const newPositions = {};
    Object.keys(scrollRefs.current).forEach(key => {
      const container = scrollRefs.current[key];
      if (container) {
        newPositions[key] = {
          left: container.scrollLeft,
          right: container.scrollWidth - container.clientWidth - container.scrollLeft
        };
      }
    });
    setScrollPositions(prev => ({ ...prev, ...newPositions }));
  }, 100), []);

  useEffect(() => {
    const loadData = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        navigate('/login');
        return;
      }

      const userData = await fetchUserData(userId, token);
      if (!userData) {
        navigate('/login');
        return;
      }
      setUsername(userData.username);

      try {
        const endpoints = [
          { key: 'latest', url: `${BACKEND_URL}/tmdb/movies/latest` },
          { key: 'topRated', url: `${BACKEND_URL}/tmdb/movies/top-rated` },
          { key: 'action', url: `${BACKEND_URL}/tmdb/movies/category/action` },
          { key: 'comedy', url: `${BACKEND_URL}/tmdb/movies/category/comedy` },
          { key: 'romance', url: `${BACKEND_URL}/tmdb/movies/category/romance` },
          { key: 'horror', url: `${BACKEND_URL}/tmdb/movies/category/horror` },
          { key: 'animation', url: `${BACKEND_URL}/tmdb/movies/category/animation` },
          { key: 'topTV', url: `${BACKEND_URL}/tmdb/tv/top-rated` }
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axios.get(endpoint.url);
            return { key: endpoint.key, data: response.data };
          })
        );

        const newSections = results.reduce((acc, curr) => {
          acc[curr.key] = curr.data;
          return acc;
        }, {});

        setSections(newSections);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    loadData();
  }, [navigate, token]);

  useEffect(() => {
    const containers = Object.values(scrollRefs.current).filter(Boolean);
    containers.forEach(container => {
      container.addEventListener('scroll', handleScrollEvent, { passive: true });
    });

    handleScrollEvent();

    return () => {
      containers.forEach(container => {
        container.removeEventListener('scroll', handleScrollEvent);
      });
    };
  }, [sections, handleScrollEvent]);

  const handleScroll = (sectionKey, direction) => {
    const container = scrollRefs.current[sectionKey];
    if (container) {
      const scrollAmount = 600;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCardClick = (media) => {
    setSelectedMedia({
      id: media.id,
      type: media.media_type || (media.title ? 'movie' : 'tv')
    });
  };

  const handleCloseDetail = () => {
    setSelectedMedia(null);
  };

  const renderSection = (title, media, sectionKey) => {
    const position = scrollPositions[sectionKey] || { left: 0, right: 0 };
    const canScrollLeft = position.left > 0;
    const canScrollRight = position.right > 0;

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
              <Card
                key={item.id}
                media={item}
                onClick={() => handleCardClick(item)}
              />
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

  return (
    <div className="home-container">
      <Sidebar />
      <div className="home-content">
        <h1 className="welcome-message">Welcome back, {username} 👋</h1>
        
        {renderSection('Latest Releases', sections.latest, 'latest')}
        {renderSection('Top Rated Movies', sections.topRated, 'topRated')}
        {renderSection('Action Movies', sections.action, 'action')}
        {renderSection('Comedy Movies', sections.comedy, 'comedy')}
        {renderSection('Romance Movies', sections.romance, 'romance')}
        {renderSection('Horror Movies', sections.horror, 'horror')}
        {renderSection('Animation', sections.animation, 'animation')}
        {renderSection('Top TV Shows', sections.topTV, 'topTV')}

        {selectedMedia && (
          <CardDetail
            mediaType={selectedMedia.type}
            mediaId={selectedMedia.id}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;