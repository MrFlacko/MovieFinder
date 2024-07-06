import React from 'react';

export default function Sorting({
  sortOption,
  setSortOption,
  yearFilter,
  setYearFilter,
  category,
  setCategory,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
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
  );
}
