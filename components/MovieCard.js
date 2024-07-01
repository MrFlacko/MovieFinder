import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.primaryTitle)}&apikey=${OMDB_API_KEY}`);
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
    <div className={`movie-card ${expanded ? 'expanded-card' : ''}`}>
      <img src={posterUrl} alt={movie.primaryTitle} className="w-full h-auto rounded-lg mb-4" />
      <div className="movie-info">
        <h3 className="text-lg font-bold mb-2">{movie.primaryTitle}</h3>
        <p className="text-sm text-gray-400 mb-1">{movie.originalTitle}</p>
        <p className="text-sm text-gray-400 mb-1">Release Year: {movie.startYear}</p>
      </div>
      {expanded && (
        <div className="expanded-card-content">
          <div className="movie-info">
            <p className="text-sm text-gray-400 mb-1">Genres: {movie.genres}</p>
            <p className="text-sm text-gray-400 mb-1">Rating: {movie.averageRating}</p>
            <p className="text-sm text-gray-400 mb-1">Runtime: {movie.runtimeMinutes} minutes</p>
            <p className="text-sm text-gray-400 mb-1">Description: {movie.description}</p>
          </div>
          <div className="trailer-container">
            {loading && <p className="text-sm text-gray-400 mb-1">Loading movie trailer...</p>}
            {trailerUrl ? (
              <iframe
                src={trailerUrl}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-lg trailer-iframe"
              ></iframe>
            ) : !loading && (
              <p className="text-sm text-gray-400 mb-1">Trailer not available</p>
            )}
          </div>
        </div>
      )}
      <button onClick={handleExpand} className="expand-button mt-2 flex items-center justify-center w-full text-blue-400 focus:outline-none">
        <FaChevronDown className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

export default MovieCard;
