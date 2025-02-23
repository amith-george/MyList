import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Card from '../../components/form/Card';
import CardDetail from '../../components/form/CardDetail';
import Pagination from '../../components/ui/Pagination';
import '../../styles/pages/SearchPage.css';
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SearchPage = () => {
  const navigate = useNavigate();
  const { page } = useParams();
  const token = localStorage.getItem('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Convert page parameter to number or default to 1
  const currentPageFromURL = page ? parseInt(page) : 1;

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      navigate('/login');
    } else {
      if (!searchQuery.trim()) {
        fetchPopularMovies(currentPageFromURL);
      }
    }
  }, [navigate, token, currentPageFromURL, searchQuery]);

  const fetchPopularMovies = async (pageNumber) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/tmdb/movies/popular?page=${pageNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch popular movies');
      
      const data = await response.json();
      setSearchResults(data.results);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setSearchResults([]);
    }
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        navigate('/search/1');
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/tmdb/media/search/${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setCurrentPage(1);
      setTotalPages(1);
      setErrorMessage('');
      navigate('/search/1');
    } catch (error) {
      setErrorMessage(error.message);
      setSearchResults([]);
    }
  };

  const handleCardClick = (media) => {
    const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
    setSelectedMedia({ ...media, mediaType });
  };

  const handleCloseDetail = () => {
    setSelectedMedia(null);
  };

  const handlePageChange = (newPage) => {
    if (!searchQuery.trim()) {
      navigate(`/search/${newPage}`);
    }
  };

  return (
    <div className="list-container search-page">
      <Sidebar />
      <div className="list-content">
        <h1 className="list-heading">Search Media</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search movies and TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        
        <div className="results-container">
          {searchResults.length === 0 ? (
            <p className="empty-results">No results found</p>
          ) : (
            searchResults.map((media) => (
              <Card 
                key={`${media.id}-${media.media_type}`} 
                media={media}
                onClick={() => handleCardClick(media)}
              />
            ))
          )}
        </div>

        {selectedMedia && (
          <CardDetail
            mediaType={selectedMedia.mediaType}
            mediaId={selectedMedia.id}
            onClose={handleCloseDetail}
          />
        )}

        {!searchQuery.trim() && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => handlePageChange(currentPage - 1)}
            onNext={() => handlePageChange(currentPage + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
