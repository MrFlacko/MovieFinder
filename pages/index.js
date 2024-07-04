import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [randomMovie, setRandomMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(32);
  const [sortOption, setSortOption] = useState('rating');
  const [yearFilter, setYearFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const fetchMovies = async (page = 1, limit = 32, sort = 'rating', year = 'all', category = 'all') => {
    setLoading(true);
    const res = await fetch(`/api/movies?page=${page - 1}&limit=${limit}&sort=${sort}&year=${year}&category=${category}`);
    const data = await res.json();
    setMovies(prevMovies => [...prevMovies, ...data]);
    setLoading(false);
  };

  const fetchRandomMovie = async () => {
    const res = await fetch('/api/movies?random=true');
    const movie = await res.json();
    console.log('Random Movie:', movie);
    setRandomMovie(movie);
    console.log(randomMovie)
  };

  useEffect(() => {
    fetchMovies(currentPage, itemsPerPage, sortOption, yearFilter, category);
  }, [currentPage, itemsPerPage, sortOption, yearFilter, category]);

  const loadMoreMovies = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <button onClick={fetchRandomMovie} className="btn-random-movie">
          Show Random Movie
        </button>
        <div className="flex items-center">
          <label className="mr-2 text-white">Sort By:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 hover:bg-gray-600"
          >
            <option value="rating">Rating</option>
            <option value="releaseDate">Release Date</option>
            <option value="title">Title</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-white">Year:</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 hover:bg-gray-600"
          >
            <option value="all">All</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-white">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
      {randomMovie && (
        <div className="random-movie mt-8">
          <MovieCard movie={randomMovie} />
          {randomMovie.trailerId ? (
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${randomMovie.trailerId}`}
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
      )}
    </Layout>
  );
}
