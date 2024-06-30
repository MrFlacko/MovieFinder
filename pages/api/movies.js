// /api/movies.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open a database connection
async function openDb() {
  return open({
    filename: './db/databases/imdb.db',
    driver: sqlite3.Database
  });
}

export default async function handler(req, res) {
  const { page = 1, limit = 20, sort = 'rating', year } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
               FROM title_basics 
               JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
               WHERE title_basics.titleType = 'movie' `;
  
  if (year) {
    query += `AND title_basics.startYear = ${year} `;
  }

  if (sort === 'rating') {
    query += `ORDER BY title_ratings.averageRating DESC `;
  } else if (sort === 'releaseDate') {
    query += `ORDER BY title_basics.startYear DESC `;
  } else if (sort === 'title') {
    query += `ORDER BY title_basics.primaryTitle ASC `;
  }

  query += `LIMIT ${limit} OFFSET ${offset}`;

  const db = await openDb();
  const movies = await db.all(query);

  // Fetch additional movie details
  const detailedMovies = await Promise.all(movies.map(async (movie) => {
    const details = await fetchMovieDetails(movie.tconst);
    return {
      ...movie,
      description: details.Plot,
      trailerUrl: await fetchTrailerUrl(movie.primaryTitle)
    };
  }));

  res.status(200).json(detailedMovies);
}

const fetchMovieDetails = async (tconst) => {
  const response = await fetch(`http://www.omdbapi.com/?i=${tconst}&apikey=${process.env.OMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

const fetchTrailerUrl = async (title) => {
  const response = await fetch(`/api/trailer?title=${title}`);
  const data = await response.json();
  return data.trailerUrl;
};
