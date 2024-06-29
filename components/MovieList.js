import { useState, useEffect } from 'react';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, itemsPerPage]);

  const fetchMovies = async () => {
    setLoading(true);
    const res = await fetch(`/api/movies?page=${currentPage}&limit=${itemsPerPage}`);
    const data = await res.json();
    setMovies(prevMovies => [...prevMovies, ...data]);
    setLoading(false);
  };

  const showExpandedCard = (movie, movieCard) => {
    let existingExpandedCard = document.querySelector('.expanded-card');
    if (existingExpandedCard) {
      existingExpandedCard.remove();
    }
    const expandedCard = document.createElement('div');
    expandedCard.classList.add('expanded-card');
    expandedCard.innerHTML = `<div class="expanded-card-content"><div class="movie-info"><h2>${movie.title}</h2><div class="movie-details"><p><strong>Release Date:</strong> ${movie.releaseDate}</p><p><strong>Rating:</strong> ${movie.rating}</p><p><strong>Description:</strong> ${movie.description}</p></div><div class="extra-details"><p><strong>Director:</strong> ${movie.director}</p><p><strong>Cast:</strong> ${movie.cast}</p><p><strong>Genre:</strong> ${movie.genre}</p><p><strong>Runtime:</strong> ${movie.runtime}</p></div></div><div class="trailer-container"><iframe src="${movie.trailerUrl}" frameborder="0" allowfullscreen></iframe></div></div>`;
    movieCard.parentNode.insertBefore(expandedCard, movieCard.nextSibling);
    expandedCard.classList.add('show');
    expandedCard.addEventListener('mouseenter', () => {
      clearTimeout(movieCard.hideTimeout);
      expandedCard.classList.add('show');
    });
    expandedCard.addEventListener('mouseleave', () => {
      hideExpandedCard(movieCard);
    });
    positionExpandedCard(expandedCard, movieCard);
  };

  const hideExpandedCard = (movieCard) => {
    movieCard.hideTimeout = setTimeout(() => {
      const expandedCard = document.querySelector('.expanded-card');
      if (expandedCard && !expandedCard.matches(':hover')) {
        expandedCard.classList.remove('show');
        expandedCard.remove();
      }
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {movies.map(movie => (
        <div key={movie.title} className="movie-card bg-gray-800 text-white rounded-lg p-4">
          <img src={movie.poster} alt={`${movie.title} Poster`} className="w-full h-auto rounded"/>
          <h2 className="mt-2 text-lg font-bold">{movie.title}</h2>
        </div>
      ))}
      {loading && <div className="loading mt-4">Loading more movies...</div>}
      <div className="load-more-container mt-4 text-center">
        <button onClick={() => setCurrentPage(currentPage + 1)} className="bg-gray-700 text-white py-2 px-4 rounded">
          Load More
        </button>
        <select onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage} className="ml-4 py-2 px-4 rounded bg-gray-800 text-white">
          <option value="16">Show 16</option>
          <option value="25">Show 25</option>
          <option value="50">Show 50</option>
          <option value="100">Show 100</option>
          <option value="200">Show 200</option>
        </select>
      </div>
    </div>
  );
}