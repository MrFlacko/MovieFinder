import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import { useState, useEffect } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortOption, setSortOption] = useState('rating');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchMovies(1, itemsPerPage, sortOption, yearFilter);
  }, [itemsPerPage, sortOption, yearFilter]);

  const fetchMovies = async (page, limit, sort, year) => {
    setLoading(true);
    const res = await fetch(`/api/movies?page=${page}&limit=${limit}&sort=${sort}&year=${year}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setMovies(page === 1 ? data : [...movies, ...data]);
    } else {
      console.error('Error: Fetched data is not an array:', data);
    }
    setLoading(false);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);
    setMovies([]);
    fetchMovies(1, itemsPerPage, option, yearFilter);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setYearFilter(year);
    setCurrentPage(1);
    setMovies([]);
    fetchMovies(1, itemsPerPage, sortOption, year);
  };

  const loadMoreMovies = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMovies(nextPage, itemsPerPage, sortOption, yearFilter);
  };

  return (
    <Layout onSortChange={handleSortChange}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="mr-2">Sort By:</label>
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-gray-700 text-white py-2 px-4 rounded"
          >
            <option value="rating">Rating</option>
            <option value="releaseDate">Release Date</option>
            <option value="title">Title</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Filter by Year:</label>
          <input
            type="number"
            value={yearFilter}
            onChange={handleYearChange}
            placeholder="e.g., 2020"
            className="bg-gray-700 text-white py-2 px-4 rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.tconst} movie={movie} />
        ))}
      </div>
      {loading && <div className="text-center mt-8">Loading more movies...</div>}
      <div className="text-center mt-8">
        <button
          onClick={loadMoreMovies}
          className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
        >
          Load More
        </button>
        <select
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          value={itemsPerPage}
          className="ml-4 py-2 px-4 rounded bg-gray-800 text-white"
        >
          <option value="20">Show 20</option>
          <option value="25">Show 25</option>
          <option value="50">Show 50</option>
          <option value="100">Show 100</option>
        </select>
      </div>
    </Layout>
  );
}
