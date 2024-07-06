import React from 'react';
import Sorting from './Sorting';
import MovieCard from './MovieCard';
import ShowRandomMovie from './ShowRandomMovie';

export default function Layout({
  movies,
  loading,
  sortOption,
  setSortOption,
  yearFilter,
  setYearFilter,
  category,
  setCategory,
  showModal,
  setShowModal,
  loadMoreMovies,
  handleItemsPerPageChange,
  itemsPerPage,
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto py-8">
        <Sorting
          sortOption={sortOption}
          setSortOption={setSortOption}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          category={category}
          setCategory={setCategory}
          setShowModal={setShowModal}
        />
        <div className="w-full px-0 mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {movies.map(movie => (<MovieCard key={movie.tconst} movie={movie} />))}
        </div>
        {loading && <div className="text-center mt-8 text-white">Loading more movies...</div>}
        <div className="text-center mt-8">
          <button
            onClick={loadMoreMovies} className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
            Load More
          </button>
          <select
            onChange={handleItemsPerPageChange} value={itemsPerPage} className="ml-4 py-2 px-4 rounded-lg bg-gray-800 text-white shadow-md transition duration-300 hover:bg-gray-600">
            <option value="32">Show 32</option>
            <option value="50">Show 50</option>
            <option value="100">Show 100</option>
          </select>
        </div>
        <ShowRandomMovie show={showModal} onClose={() => setShowModal(false)} />
      </main>
    </div>
  );
}
