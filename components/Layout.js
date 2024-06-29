// components/Layout.js
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 py-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Movie Trailer Finder</h1>
          <p className="mt-2 text-lg">Discover and watch trailers for the latest movies</p>
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
