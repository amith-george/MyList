import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddList from './AddMedia';
import '../../styles/components/CardDetail.css';
import placeholder from '../../assets/placeholder.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CardDetail = ({ mediaType, mediaId, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddList, setShowAddList] = useState(false);

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

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/tmdb/${mediaType}/${mediaId}`
                );
                setDetails(response.data);
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [mediaType, mediaId]);

    if (loading) return <div className="card-detail-loading"></div>;

    return (
        <div className="card-detail-overlay" onClick={onClose}>
            <div className="card-detail-container">
                <div className="card-detail" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={onClose}>×</button>
                    
                    <div className="card-detail-content">
                        <div className="poster-section">
                            <img
                                src={
                                    details.poster_path 
                                    ? `https://image.tmdb.org/t/p/w300${details.poster_path}`
                                    : placeholder
                                }
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
                                    className="add-to-list-button"
                                    onClick={() => setShowAddList(true)}
                                >
                                    📥 Add to List
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
                        </div>
                    </div>
                </div>
            </div>

            {showAddList && (
                <AddList
                    media={details}
                    onClose={() => setShowAddList(false)}
                    onAddToList={(listId) => {
                        // Implement add to list functionality later
                    }}
                />
            )}
        </div>
    );
};

export default CardDetail;