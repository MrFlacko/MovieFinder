// /components/MovieCard.js
import React from 'react';

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 text-white p-4 rounded">
      <img src={movie.poster || '/placeholder.png'} alt={movie.primaryTitle} className="w-full h-auto rounded mb-4" />
      <h3 className="text-lg font-bold">{movie.primaryTitle}</h3>
      <p>{movie.originalTitle}</p>
      <p>Release Year: {movie.startYear}</p>
      <p>Genres: {movie.genres}</p>
      <p>Rating: {movie.averageRating}</p>
      <p>Runtime: {movie.runtimeMinutes} minutes</p>
      <p>Description: {movie.description}</p>
      <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400">
        Watch Trailer
      </a>
    </div>
  );
};

export default MovieCard;
