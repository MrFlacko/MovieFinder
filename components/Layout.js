import { useState } from 'react';

export default function Layout({ children, onSortChange }) {
  const [sortOption, setSortOption] = useState('releaseDate');

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    onSortChange(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Movie Trailer Finder</h1>
            <p className="mt-2 text-lg">Discover and watch trailers for the latest movies</p>
          </div>
          <div>
            <label className="mr-2">Sort By:</label>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="bg-gray-700 text-white py-2 px-4 rounded"
            >
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="releaseDate">Release Date</option>
              <option value="rating">Rating</option>
              <option value="duration">Duration</option>
              <option value="random">Randomly</option>
            </select>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8">
        {children}
      </main>
      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Movie Trailer Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
