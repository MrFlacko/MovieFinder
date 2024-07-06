import React from 'react';

export default function Header() {
  return (
    <header className="bg-gray-800 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Movie Trailer Finder</h1>
          <p className="mt-2 text-lg">Discover and watch trailers for the latest movies</p>
        </div>
      </div>
    </header>
  );
}
