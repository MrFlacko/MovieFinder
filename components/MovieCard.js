import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
  const [trailerUrl, setTrailerUrl] = useState(null);

  const fetchTrailer = async () => {
    try {
      const response = await fetch(`/api/trailer?title=${encodeURIComponent(movie.primaryTitle)}`);
      const data = await response.json();
      setTrailerUrl(data.trailerUrl);
    } catch (error) {
      console.error('Failed to fetch trailer:', error);
    }
  };

  const handleMouseEnter = () => {
    setTimeout(fetchTrailer, 2000); // Fetch trailer after 2 seconds of hover
  };

  return (
    <div 
      className="bg-gray-800 text-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
      onMouseEnter={handleMouseEnter}
    >
      <img src={movie.poster || '/placeholder.png'} alt={movie.primaryTitle} className="w-full h-auto rounded-lg mb-4" />
      <h3 className="text-lg font-bold mb-2">{movie.primaryTitle}</h3>
      <p className="text-sm text-gray-400 mb-1">{movie.originalTitle}</p>
      <p className="text-sm text-gray-400 mb-1">Release Year: {movie.startYear}</p>
      <p className="text-sm text-gray-400 mb-1">Genres: {movie.genres}</p>
      <p className="text-sm text-gray-400 mb-1">Rating: {movie.averageRating}</p>
      <p className="text-sm text-gray-400 mb-1">Runtime: {movie.runtimeMinutes} minutes</p>
      <p className="text-sm text-gray-400 mb-1">Description: {movie.description}</p>
      {trailerUrl && (
        <div className="trailer mt-4">
          <iframe
            width="100%"
            height="315"
            src={trailerUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      )}
      {!trailerUrl && (
        <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline mt-2 inline-block">
          Watch Trailer
        </a>
      )}
    </div>
  );
};

export default MovieCard;
