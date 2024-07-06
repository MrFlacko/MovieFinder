import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const [expanded, setExpanded] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.primaryTitle)}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`);
        const data = await response.json();
        setPosterUrl(data.Poster !== 'N/A' ? data.Poster : '');
      } catch (error) {
        console.error('Failed to fetch poster:', error);
        setPosterUrl('');
      }
    };

    fetchPoster();
  }, [movie.primaryTitle]);

  const fetchTrailer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trailer?title=${encodeURIComponent(movie.primaryTitle)}`);
      const data = await response.json();
      setTrailerUrl(data.trailerUrl);
    } catch (error) {
      console.error('Failed to fetch trailer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      fetchTrailer();
    } else {
      setTrailerUrl(null);
      setLoading(false);
    }
  };

  const handleMouseLeave = () => {
    setExpanded(false);
  };

  if (!posterUrl) return null; // Ensure poster is fetched

  return (
    <div className="movie-card-container" onMouseLeave={handleMouseLeave}>
      <div className="movie-card" onClick={handleExpand}>
        <h3>{movie.primaryTitle}</h3>
        <img src={posterUrl} alt={movie.primaryTitle} className="poster" />
        <div className="movie-info">
          <p>{movie.startYear}</p>
        </div>
        <button onClick={handleExpand} className="expand-button">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {expanded && (
        <div className={`expanded-card show`}>
          <div className="expanded-card-header">
            {movie.primaryTitle}
          </div>
          <div className="expanded-card-content">
            <div className="movie-info">
              <p>Year: {movie.startYear}</p>
              <p>Genres: {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}</p>
              <p>Rating: {movie.averageRating}</p>
              <p>Runtime: {movie.runtimeMinutes} minutes</p>
              <p>Description: {movie.description}</p>
            </div>
            <div className="trailer-container expanded-trailer-iframe">
              {loading ? (
                <p>Loading movie trailer...</p>
              ) : (
                trailerUrl ? (
                  <iframe
                    src={trailerUrl}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <p>Trailer not available</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
