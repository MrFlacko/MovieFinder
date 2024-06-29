import db from '../../../db/database';

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

    db.all(query, [], async (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Failed to fetch movies', error: err.message });
        } else {
            const movies = await Promise.all(rows.map(async (movie) => {
                const details = await fetchMovieDetails(movie.tconst);
                return {
                    ...movie,
                    description: details.Plot,
                    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder trailer
                };
            }));
            res.status(200).json(movies);
        }
    });
}

const fetchMovieDetails = async (tconst) => {
    const response = await fetch(`http://www.omdbapi.com/?i=${tconst}&apikey=${process.env.OMDB_API_KEY}`);
    const data = await response.json();
    return data;
};
