// pages/index.js
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import { useState, useEffect } from 'react';

export default function Home() {
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

  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.title} movie={movie} />
        ))}
      </div>
      {loading && <div className="text-center mt-8">Loading more movies...</div>}
      <div className="text-center mt-8">
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
        >
          Load More
        </button>
        <select
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          value={itemsPerPage}
          className="ml-4 py-2 px-4 rounded bg-gray-800 text-white"
        >
          <option value="16">Show 16</option>
          <option value="25">Show 25</option>
          <option value="50">Show 50</option>
          <option value="100">Show 100</option>
          <option value="200">Show 200</option>
        </select>
      </div>
    </Layout>
  );
}
