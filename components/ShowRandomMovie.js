import React, { useState, useEffect, useRef } from 'react';

const ShowRandomMovie = ({ show, onClose }) => {
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [randomMovie, setRandomMovie] = useState(null);
  const [posterUrl, setPosterUrl] = useState('');
  const hasFetchedMovie = useRef(false);

  const fetchRandomMovie = async () => {
    setLoadingMovie(true);
    try {
      const res = await fetch('/api/movies?random=true');
      const movie = await res.json();
      console.log('Random Movie:', movie);

      const trailerResponse = await fetch(`/api/trailer?title=${encodeURIComponent(movie.primaryTitle)}`);
      const trailerData = await trailerResponse.json();

      if (trailerResponse.ok) {
        setRandomMovie({ ...movie, trailerUrl: trailerData.trailerUrl });
      } else {
        setRandomMovie({ ...movie, trailerUrl: null });
      }

      const posterResponse = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.primaryTitle)}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`);
      const posterData = await posterResponse.json();
      setPosterUrl(posterData.Poster !== 'N/A' ? posterData.Poster : '');
    } catch (error) {
      console.error('Error fetching movie or trailer:', error);
      setRandomMovie(null);
      setPosterUrl('');
    } finally {
      setLoadingMovie(false);
    }
  };

  useEffect(() => {
    if (show && !hasFetchedMovie.current) {
      fetchRandomMovie();
      hasFetchedMovie.current = true;
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      hasFetchedMovie.current = false; 
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
            <div className="movie-details-container">
              <div className="movie-image">
                <img src={posterUrl} alt={randomMovie.primaryTitle} className="poster" />
              </div>
              <div className="movie-details">
                <h2 className="movie-title">{randomMovie.primaryTitle}</h2>
                <p className="movie-genres">{randomMovie.genres}</p>
                <p className="movie-year">{randomMovie.startYear}</p>
                <p className="movie-overview">{randomMovie.overview}</p>
              </div>
              <div className="trailer-iframe-container">
                {randomMovie?.trailerUrl ? (
                  <iframe
                    src={randomMovie.trailerUrl}
                    className="trailer-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Random Movie Trailer"
                  ></iframe>
                ) : (
                  <p className="no-trailer">Trailer not available</p>
                )}
              </div>
              <button onClick={fetchRandomMovie} className="btn-random-movie-regen">
                Regenerate
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ShowRandomMovie;
