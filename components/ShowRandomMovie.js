// components/ShowRandomMovie.js

import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

const ShowRandomMovie = ({ show, onClose }) => {
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [randomMovie, setRandomMovie] = useState(null);

  const fetchRandomMovie = async () => {
    setLoadingMovie(true);
    try {
      const res = await fetch('/api/movies?random=true');
      const movie = await res.json();
      console.log('Random Movie:', movie);

      // Fetch trailer URL using trailer.js
      const trailerResponse = await fetch(`/api/trailer?title=${encodeURIComponent(movie.primaryTitle)}`);
      const trailerData = await trailerResponse.json();

      if (trailerResponse.ok) {
        setRandomMovie({ ...movie, trailerUrl: trailerData.trailerUrl });
      } else {
        setRandomMovie({ ...movie, trailerUrl: null }); // Handle no trailer scenario
      }
    } catch (error) {
      console.error('Error fetching movie or trailer:', error);
      setRandomMovie(null);
    } finally {
      setLoadingMovie(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchRandomMovie();
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">&times;</button>
        {loadingMovie ? (
          <div className="loading-movie">
            <p className="text-white">Loading movie...</p>
          </div>
        ) : (
          randomMovie && (
            <div className="movie-details">
              <h2 className="text-3xl font-bold text-white">{randomMovie.primaryTitle}</h2>
              <p className="text-white">{randomMovie.genres}</p>
              <p className="text-white">{randomMovie.startYear}</p>
              <div className="movie-card">
                <MovieCard movie={randomMovie} />
              </div>
              {randomMovie?.trailerUrl ? (
                <iframe
                  width="560"
                  height="315"
                  src={randomMovie.trailerUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Random Movie Trailer"
                  className="mt-4"
                ></iframe>
              ) : (
                <p className="mt-4 text-white">Trailer not available</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ShowRandomMovie;
