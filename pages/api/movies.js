import axios from 'axios';

export default async function handler(req, res) {
  const { page = 1, limit = 16 } = req.query;
  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  try {
    const fetchMovies = async (searchTerm, page) => {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          s: searchTerm,
          type: 'movie',
          apikey: OMDB_API_KEY,
          page: page
        }
      });
      return response.data.Search || [];
    };

    const fetchMovieDetails = async (movieID) => {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          i: movieID,
          apikey: OMDB_API_KEY
        }
      });
      return response.data;
    };

    const results = await Promise.all([
      fetchMovies('Top', page),
      fetchMovies('Top', Number(page) + 1),
      fetchMovies('Top', Number(page) + 2)
    ]);

    const movies = await Promise.all(results.flat().map(async movie => {
      const details = await fetchMovieDetails(movie.imdbID);
      return {
        title: movie.Title,
        poster: movie.Poster,
        trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder trailer
        description: details.Plot,
        releaseDate: details.Released,
        rating: details.imdbRating
      };
    }));

    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
}
