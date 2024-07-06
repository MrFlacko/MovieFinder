import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { filters, buildFilters } from './filters'; // Correct the import path

const dbPath = path.resolve(process.cwd(), 'db', 'databases', 'imdb.db');
console.log('Resolved database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at path:', dbPath);
  throw new Error('Database file does not exist');
}

const db = new Database(dbPath, { verbose: console.log });

const filterConditions = buildFilters(filters);

const prepareStatements = () => {
  const queries = {
    rating: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                        FROM title_basics 
                        JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                        WHERE title_basics.titleType = 'movie' 
                        AND ${filterConditions} 
                        ORDER BY title_ratings.averageRating DESC 
                        LIMIT ? OFFSET ?`),
    releaseDate: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                             FROM title_basics 
                             JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                             WHERE title_basics.titleType = 'movie' 
                             AND ${filterConditions} 
                             ORDER BY title_basics.startYear DESC 
                             LIMIT ? OFFSET ?`),
    title: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                       FROM title_basics 
                       JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                       WHERE title_basics.titleType = 'movie' 
                       AND ${filterConditions} 
                       ORDER BY title_basics.primaryTitle ASC 
                       LIMIT ? OFFSET ?`)
  };
  return queries;
};

const statements = prepareStatements();

export default async function handler(req, res) {
  const { page = 0, limit = 32, sort = 'rating', random } = req.query;
  const offset = page * limit;

  if (random) {
    const movies = db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                               FROM title_basics 
                               JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                               WHERE title_basics.titleType = 'movie' 
                               AND ${filterConditions}`).all();
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    console.log('Random Movie:', randomMovie);
    res.status(200).json(randomMovie);
    return;
  }

  let query;
  switch (sort) {
    case 'releaseDate':
      query = statements.releaseDate;
      break;
    case 'title':
      query = statements.title;
      break;
    default:
      query = statements.rating;
  }

  const movies = query.all(limit, offset);
  res.status(200).json(movies);
}
