import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import { useState, useEffect } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(32); 
  const [sortOption, setSortOption] = useState('rating');
  const [yearFilter, setYearFilter] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchMovies(1, itemsPerPage, sortOption, yearFilter, category);
  }, [itemsPerPage, sortOption, yearFilter, category]);

  const fetchMovies = async (page, limit, sort, year, category) => {
    console.log('Fetching movies:', { page, limit, sort, year, category }); 
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?page=${page}&limit=${limit}&sort=${sort}&year=${year}&category=${category}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMovies(prevMovies => (page === 1 ? data : [...prevMovies, ...data]));
      } else {
        console.error('Error: Fetched data is not an array:', data);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);
    setMovies([]);
    fetchMovies(1, itemsPerPage, option, yearFilter, category);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setYearFilter(year);
    setCurrentPage(1);
    setMovies([]);
    fetchMovies(1, itemsPerPage, sortOption, year, category);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setCategory(category);
    setCurrentPage(1);
    setMovies([]);
    fetchMovies(1, itemsPerPage, sortOption, yearFilter, category);
  };

  const loadMoreMovies = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMovies(nextPage, itemsPerPage, sortOption, yearFilter, category); 
  };

  return (
    <Layout>
      <div className="controls mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <label className="mr-2 text-white">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 hover:bg-gray-600"
          >
            <option value="title">Title</option>
            <option value="release_date">Release Date</option>
            <option value="rating">Rating</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-white">Category:</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 hover:bg-gray-600"
          >
            <option value="all">All</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="horror">Horror</option>
            <option value="romance">Romance</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="thriller">Thriller</option>
          </select>
        </div>
      </div>
      <div className="w-full px-0 mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4">
        {movies.map(movie => (
          <MovieCard key={movie.tconst} movie={movie} />
        ))}
      </div>
      {loading && <div className="text-center mt-8 text-white">Loading more movies...</div>}
      <div className="text-center mt-8">
        <button
          onClick={loadMoreMovies}
          className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Load More
        </button>
        <select
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
            setMovies([]);
            fetchMovies(1, Number(e.target.value), sortOption, yearFilter, category);
          }}
          value={itemsPerPage}
          className="ml-4 py-2 px-4 rounded-lg bg-gray-800 text-white shadow-md transition duration-300 hover:bg-gray-600"
        >
          <option value="32">Show 32</option>
          <option value="50">Show 50</option>
          <option value="100">Show 100</option>
        </select>
      </div>
    </Layout>
  );
}
