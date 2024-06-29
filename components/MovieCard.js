import { useState, useEffect } from 'react';

export default function MovieCard({ movie }) {
  const [showDetails, setShowDetails] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');

  useEffect(() => {
    if (showDetails && !trailerUrl) {
      fetchTrailer(movie.title);
    }
  }, [showDetails]);

  const fetchTrailer = async (title) => {
    const res = await fetch(`/api/trailer?title=${encodeURIComponent(title)}`);
    const data = await res.json();
    setTrailerUrl(data.trailerUrl);
  };

  return (
    <div
      className="relative movie-card bg-gray-800 text-white rounded-lg p-4 transition-transform duration-300 transform hover:scale-105"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <img
        src={movie.poster}
        alt={`${movie.title} Poster`}
        className="w-full h-auto rounded transition-transform duration-300 transform hover:scale-110"
      />
      <h2 className="mt-2 text-lg font-bold">{movie.title}</h2>
      {showDetails && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex flex-col justify-center items-center text-center p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
          <p className="text-sm mb-2"><strong>Release Date:</strong> {movie.releaseDate}</p>
          <p className="text-sm mb-2"><strong>Rating:</strong> {movie.rating}</p>
          <p className="text-sm mb-2"><strong>Description:</strong> {movie.description}</p>
          <div className="mt-4">
            {trailerUrl ? (
              <iframe
                src={trailerUrl}
                frameBorder="0"
                allowFullScreen
                className="w-full h-40 rounded-lg"
              ></iframe>
            ) : (
              <p>Loading trailer...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
