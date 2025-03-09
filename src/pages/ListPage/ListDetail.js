import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Listbar from '../../components/ui/Listbar';
import Card from '../../components/form/Card';
import ListCardDetail from '../../components/form/ListCardDetail';
import Pagination from '../../components/ui/Pagination';
import EditList from '../../components/form/EditList';
import PageLoader from '../../components/ui/PageLoader';
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
  const [counts, setCounts] = useState({ movie: 0, tv: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortOption, setSortOption] = useState('added-desc');
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

    // Reset pagination when filter, search, or sort changes
    setCurrentPage(1);

    fetchListMedia();
    fetchMediaCounts();
    // eslint-disable-next-line
  }, [userId, listId, navigate, token, location.pathname, Id, searchQuery, sortOption]);

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

  // When the edit button is clicked, show the edit modal.
  const handleUpdateList = () => {
    setShowEditModal(true);
  };

  // Filter media items based on search query and type filter
  const filteredMedia =
    list?.mediaItems?.filter(
      (media) =>
        (filterType === 'all' ? true : media.media_type === filterType) &&
        (media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          media.overview?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  // Sort filtered media based on sortOption
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (sortOption) {
      case 'added-desc':
        // Oldest first (createdAt ascending)
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'added-asc':
        // Newly added first (createdAt descending)
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rating-desc':
        // Highest rating first
        return (b.rating || 0) - (a.rating || 0);
      case 'rating-asc':
        // Lowest rating first
        return (a.rating || 0) - (b.rating || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedMedia.length / itemsPerPage);
  const paginatedMedia = sortedMedia.slice(
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

  if (loading) {
    return (
      <div className="loader-page">
        <PageLoader />
      </div>
    );
  }

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
            <div className="search-sort-container">
              <input
                type="text"
                placeholder="Search in this list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="added-desc">Added (Descending)</option>
                <option value="added-asc">Added (Ascending)</option>
                <option value="rating-desc">Rating (Descending)</option>
                <option value="rating-asc">Rating (Ascending)</option>
              </select>
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

        {/* Edit List Modal */}
        {showEditModal && (
          <EditList
            listId={listId}
            currentTitle={list.title}
            currentDescription={list.description}
            onClose={(updated) => {
              setShowEditModal(false);
              if (updated) fetchListMedia();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ListDetail;
