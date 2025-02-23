import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Listbar from '../../components/ui/Listbar';
import Card from '../../components/form/Card';
import ListCardDetail from '../../components/form/ListCardDetail';
import Pagination from '../../components/ui/Pagination';
import '../../styles/pages/ListDetail.css';
import { getUserIdFromToken } from '../../utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ListDetail = () => {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  // Holds the count of movies & tv shows for this list
  const [counts, setCounts] = useState({ movie: 0, tv: 0 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35;
  
  const { userId, listId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const Id = getUserIdFromToken();

  // Fetch the list data & media items
  const fetchListMedia = async () => {
    try {
      const listResponse = await axios.get(
        `${BACKEND_URL}/lists/${userId}/${listId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch TMDB details for each media item
      const mediaWithDetails = await Promise.all(
        listResponse.data.mediaItems.map(async (media) => {
          try {
            const tmdbResponse = await axios.get(
              `${BACKEND_URL}/tmdb/${media.type}/${media.tmdbId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...media,
              poster_path: tmdbResponse.data.poster_path,
              release_date:
                media.type === 'movie'
                  ? tmdbResponse.data.release_date
                  : tmdbResponse.data.first_air_date,
              overview: tmdbResponse.data.overview,
              vote_average: tmdbResponse.data.vote_average,
              media_type: media.type,
            };
          } catch (tmdbError) {
            console.error('Error fetching TMDB details:', tmdbError);
            return media;
          }
        })
      );

      setList({
        ...listResponse.data,
        mediaItems: mediaWithDetails,
      });
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the counts for movies & tv shows in this list
  const fetchMediaCounts = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/lists/${userId}/${listId}/counts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCounts(response.data.counts || { movie: 0, tv: 0 });
    } catch (err) {
      console.error('Error fetching media counts:', err);
    }
  };

  useEffect(() => {
    if (!Id) {
      navigate('/login');
      return;
    }

    const pathSegments = location.pathname.split('/');
    const currentFilter = pathSegments[pathSegments.length - 1];
    setFilterType(
      currentFilter === 'movies'
        ? 'movie'
        : currentFilter === 'tvshows'
        ? 'tv'
        : 'all'
    );

    // Reset pagination when filter or search changes
    setCurrentPage(1);

    fetchListMedia();
    fetchMediaCounts();
    // eslint-disable-next-line
  }, [userId, listId, navigate, token, location.pathname, Id, searchQuery]);

  const handleFetchError = (error) => {
    if (error.response?.status === 403) {
      setError('You do not have access to this list');
    } else {
      setError('Failed to load list');
    }
    console.error('Error fetching list:', error);
  };

  const handleDeleteList = () => {
    console.log('Delete list clicked');
  };

  const handleUpdateList = () => {
    console.log('Update list clicked');
  };

  const filteredMedia =
    list?.mediaItems?.filter(
      (media) =>
        (filterType === 'all' ? true : media.media_type === filterType) &&
        (media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          media.overview?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  // Calculate pagination values
  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCardClick = (media) => {
    setSelectedMedia({
      tmdbId: media.tmdbId,
      listId: listId,
      type: media.media_type,
    });
  };

  const handleCloseDetail = () => {
    setSelectedMedia(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) return <div className="list-detail-container">Loading...</div>;
  if (error) return <div className="list-detail-container">{error}</div>;
  if (!list) return <div className="list-detail-container">List not found</div>;

  return (
    <div className="list-detail-container">
      <Listbar onDelete={handleDeleteList} onUpdate={handleUpdateList} />
      <div className="list-detail-content">
        <div className="list-header">
          <h1 className="list-detail-heading">{list.title}</h1>
          <p className="list-detail-description">{list.description}</p>
          <div className="search-and-counts">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search in this list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="media-counts">
              <div className="count-item">
                Number of Movies: {counts.movie || 0}
              </div>
              <div className="count-item">
                Number of TV Shows: {counts.tv || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="media-items-grid">
          {paginatedMedia.length > 0 ? (
            paginatedMedia.map((media) => (
              <Card
                key={media._id}
                media={media}
                onClick={() => handleCardClick(media)}
              />
            ))
          ) : (
            <p className="empty-state">
              {list.mediaItems?.length > 0
                ? `No ${
                    filterType === 'all' ? '' : filterType + ' '
                  }items match your search`
                : 'No media items in this list yet'}
            </p>
          )}
        </div>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        )}

        {selectedMedia && (
          <ListCardDetail
            listId={selectedMedia.listId}
            mediaId={selectedMedia.tmdbId}
            onClose={handleCloseDetail}
            onDeleteSuccess={fetchListMedia}
          />
        )}
      </div>
    </div>
  );
};

export default ListDetail;
