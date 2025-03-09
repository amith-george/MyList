import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/components/CardDetail.css';
import placeholder from '../../assets/placeholder.png';
import UpdateList from './UpdateMedia'; // Import the UpdateList component
import DeleteList from './DeleteMedia'; // Import the DeleteList component

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ListCard = ({ listId, mediaId, onClose, onDeleteSuccess }) => { 
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mediaType, setMediaType] = useState('movie');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatRuntime = (minutes) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours > 0 ? `${hours}hr ` : ''}${remainingMinutes}min`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getRatingDescriptor = (rating) => {
        const descriptors = {
            10: '(Masterpiece)',
            9: '(Great)',
            8: '(Very Good)',
            7: '(Good)',
            6: '(Fine)',
            5: '(Average)',
            4: '(Bad)',
            3: '(Very Bad)',
            2: '(Horrible)',
            1: '(Appalling)'
        };
        return <span className="rating-descriptor">{descriptors[rating]}</span>;
    };

    const fetchDetails = async () => {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/media/${listId}/${mediaId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );

            if (!response.data) {
                throw new Error('Media details not found');
            }

            setMediaType(response.data.type || 'movie');
            setDetails(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching details:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load media details');
            setDetails(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [mediaId, listId]);

    if (loading) {
        return (
            <div className="card-detail-overlay">
                <div className="card-detail-loading"></div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="card-detail-overlay" onClick={onClose}>
                <div className="card-detail-container">
                    <div className="error-message">
                        {error}
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-detail-overlay" onClick={onClose}>
            <div className="card-detail-container">
                <div className="card-detail" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={onClose}>×</button>
                    
                    <div className="card-detail-content">
                        <div className="poster-section">
                            <img
                                src={details.poster_path 
                                    ? `https://image.tmdb.org/t/p/w300${details.poster_path}`
                                    : placeholder}
                                alt={details.title || details.name}
                                className="detail-poster"
                            />
                            <p className="rating-badge">
                                ⭐ {details.vote_average?.toFixed(1)}
                            </p>

                            <div className="action-buttons">
                                {details.trailer_key && (
                                    <div className="trailer-container">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${details.trailer_key}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="trailer-button"
                                        >
                                            ▶ Watch Trailer
                                        </a>
                                    </div>
                                )}
                                <button 
                                    className="update-button"
                                    onClick={() => setShowUpdateModal(true)}
                                >
                                    📝 Update Media
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    🗑️ Delete Media
                                </button>
                            </div>
                        </div>
                        
                        <div className="info-section">
                            <h2 className="title">{details.title || details.name}</h2>
                            
                            <div className="meta-info">
                                <div className="detail-item">
                                    <span className="detail-label">Release Date:</span>
                                    <span className="detail-value">
                                        {formatDate(mediaType === 'movie' 
                                            ? details.release_date 
                                            : details.first_air_date)}
                                    </span>
                                </div>
                                {mediaType === 'movie' && details.runtime > 0 && (
                                    <div className="detail-item">
                                        <span className="detail-label">Runtime:</span>
                                        <span className="detail-value">
                                            {formatRuntime(details.runtime)}
                                        </span>
                                    </div>
                                )}
                                {mediaType === 'tv' && details.episode_count > 0 && (
                                    <div className="detail-item">
                                        <span className="detail-label">Episodes:</span>
                                        <span className="detail-value">
                                            {details.episode_count}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="genres">
                                {details.genres?.map(genre => (
                                    <span key={genre.id} className="genre-tag">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            <div className="plot-section">
                                <h3 className="plot-heading">Plot</h3>
                                <p className="plot-text">{details.overview}</p>
                            </div>

                            {details.director && (
                                <div className="director-section">
                                    <h4 className="section-heading">Directed By: </h4>
                                    <p className="director-name">{details.director}</p>
                                </div>
                            )}

                            {details.cast?.length > 0 && (
                                <div className="cast-section">
                                    <h4 className="section-heading">Top Cast</h4>
                                    <div className="cast-list">
                                        {details.cast.map((member, index) => (
                                            <div key={index} className="cast-member">
                                                <div className="cast-name">{member.name}</div>
                                                <div className="cast-character">{member.character}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(details.rating || details.review) && (
                                <div className="review-section">
                                    {details.rating && (
                                        <div className="detail-item">
                                            <span className="detail-label">Your Rating: </span>
                                            <span className="detail-value">
                                                {details.rating}/10 {getRatingDescriptor(details.rating)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {details.review && (
                                        <div className="plot-section">
                                            <h3 className="section-heading">Your Review: </h3>
                                            <p className="plot-text">{details.review}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showUpdateModal && (
                <UpdateList
                    mediaId={details._id}
                    currentRating={details.rating}
                    currentReview={details.review}
                    onClose={(success) => {
                        setShowUpdateModal(false);
                        if (success) {
                            fetchDetails(); // Refresh data after update
                        }
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteList
                    listId={listId}
                    mediaId={details._id}
                    onClose={(success) => {
                        setShowDeleteModal(false);
                        if (success) {
                            onClose(); // Close the detail view after deletion
                            onDeleteSuccess(); // Trigger parent refresh
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ListCard;