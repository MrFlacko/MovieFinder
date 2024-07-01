import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.primaryTitle)}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`);
        const data = await response.json();
        setPosterUrl(data.Poster !== 'N/A' ? data.Poster : '/placeholder.png');
      } catch (error) {
        console.error('Failed to fetch poster:', error);
        setPosterUrl('/placeholder.png');
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

  return (
    <div className={`movie-card ${expanded ? 'expanded' : ''}`}>
      <img src={posterUrl} alt={movie.primaryTitle} className="poster" />
      <div className="movie-info">
        <h3>{movie.primaryTitle}</h3>
        <p>{movie.startYear}</p>
      </div>
      {expanded && (
        <div className="expanded-content">
          <div className="extra-info">
            <p>Genres: {movie.genres}</p>
            <p>Rating: {movie.averageRating}</p>
            <p>Runtime: {movie.runtimeMinutes} minutes</p>
            <p>Description: {movie.description}</p>
          </div>
          <div className="trailer-container">
            {loading ? (
              <p>Loading movie trailer...</p>
            ) : (
              trailerUrl ? (
                <iframe
                  src={trailerUrl}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="trailer-iframe"
                ></iframe>
              ) : (
                <p>Trailer not available</p>
              )
            )}
          </div>
        </div>
      )}
      <button onClick={handleExpand} className="expand-button">
        {expanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>
    </div>
  );
};

export default MovieCard;
