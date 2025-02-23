import React from 'react';
import '../../styles/components/Card.css';
import placeholder from '../../assets/placeholder.png';

const Card = ({ media, onClick, profileMode = false }) => {
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const releaseDate = media.release_date || media.first_air_date;
  const title = media.title || media.name;
  // Assume media.list holds the list name if available
  const listName = media.list || '';

  return (
    <div 
      className="media-card" 
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="card-image-container">
        <img
          src={
            media.poster_path 
              ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
              : placeholder
          }
          alt={title}
          className="card-image"
          loading="lazy"
        />
      </div>
      <div className="card-content">
        {profileMode ? (
          <>
            <h3 className="card-title">{title}</h3>
            {listName && <p className="card-list">{listName}</p>}
          </>
        ) : (
          <>
            <h3 className="card-title">{title}</h3>
            {releaseDate && (
              <p className="card-date">
                {new Date(releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Card;
