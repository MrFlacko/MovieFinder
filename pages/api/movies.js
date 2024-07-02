import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'db', 'databases', 'imdb.db');
console.log('Resolved database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at path:', dbPath);
  throw new Error('Database file does not exist');
}

const db = new Database(dbPath, { verbose: console.log });

const prepareStatements = () => {
  const queries = {
    rating: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                        FROM title_basics 
                        JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                        WHERE title_basics.titleType = 'movie' 
                        ORDER BY title_ratings.averageRating DESC 
                        LIMIT ? OFFSET ?`),
    releaseDate: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                             FROM title_basics 
                             JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                             WHERE title_basics.titleType = 'movie' 
                             ORDER BY title_basics.startYear DESC 
                             LIMIT ? OFFSET ?`),
    title: db.prepare(`SELECT title_basics.tconst, primaryTitle, originalTitle, startYear, runtimeMinutes, genres, averageRating 
                       FROM title_basics 
                       JOIN title_ratings ON title_basics.tconst = title_ratings.tconst 
                       WHERE title_basics.titleType = 'movie' 
                       ORDER BY title_basics.primaryTitle ASC 
                       LIMIT ? OFFSET ?`)
  };
  return queries;
};

const statements = prepareStatements();

export default async function handler(req, res) {
  const { page = 1, limit = 32, sort = 'rating' } = req.query;
  const offset = (page - 1) * limit;

  let query;
  if (sort === 'rating') {
    query = statements.rating;
  } else if (sort === 'releaseDate') {
    query = statements.releaseDate;
  } else if (sort === 'title') {
    query = statements.title;
  } else {
    query = statements.rating;
  }

  try {
    const movies = query.all(limit, offset);
    res.status(200).json(movies);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
