// db/filters.js

// Define the filter criteria
export const filters = {
  minRuntime: 60, // Minimum runtime in minutes
  excludeRatings: ['X'], // Exclude adult films
  excludeTypes: ['short', 'tvEpisode', 'tvSeries', 'tvMiniSeries', 'tvSpecial', 'video'], // Exclude short films, TV episodes, TV series, mini-series, specials, and direct-to-video content
  excludeGenres: ['Reality-TV', 'Talk-Show', 'Game-Show', 'Adult', 'Animation'], // Exclude specific genres
  minVotes: 1000, // Minimum number of votes to filter out less popular movies
  // minRating: 6, // Minimum average rating to filter out poorly rated movies
  // excludeLanguages: ['xx'], // Exclude movies in certain languages (e.g., 'xx' for undefined or non-existent)
  maxYear: new Date().getFullYear(), // Maximum release year to exclude future or non-existent movies
  // excludeRegions: ['IN', 'CN'], // Exclude movies from specific regions (e.g., 'IN' for India, 'CN' for China)
  // excludeDirectors: ['Uwe Boll'], // Exclude movies by specific directors
  // excludeActors: ['Tommy Wiseau'], // Exclude movies featuring specific actors
  // excludeKeywords: ['student film', 'independent film'], // Exclude movies with specific keywords
};

// Function to build filter conditions based on the criteria
export const buildFilters = (filters) => {
  const conditions = [];

  // Minimum runtime filter
  if (filters.minRuntime) {
    conditions.push(`runtimeMinutes >= ${filters.minRuntime}`);
  }

  // Exclude adult films
  if (filters.excludeRatings && filters.excludeRatings.length > 0) {
    conditions.push('isAdult = 0');
  }

  // Exclude specific types (e.g., short films, TV episodes)
  if (filters.excludeTypes && filters.excludeTypes.length > 0) {
    const typeConditions = filters.excludeTypes.map(type => `titleType != '${type}'`).join(' AND ');
    conditions.push(typeConditions);
  }

  // Exclude specific genres
  if (filters.excludeGenres && filters.excludeGenres.length > 0) {
    const genreConditions = filters.excludeGenres.map(genre => `genres NOT LIKE '%${genre}%'`).join(' AND ');
    conditions.push(genreConditions);
  }

  // Minimum number of votes filter
  if (filters.minVotes) {
    conditions.push(`numVotes >= ${filters.minVotes}`);
  }

  // Minimum average rating filter
  if (filters.minRating) {
    conditions.push(`averageRating >= ${filters.minRating}`);
  }

  // Exclude specific languages
  if (filters.excludeLanguages && filters.excludeLanguages.length > 0) {
    const languageConditions = filters.excludeLanguages.map(lang => `language != '${lang}'`).join(' AND ');
    conditions.push(languageConditions);
  }

  // Maximum release year filter
  if (filters.maxYear) {
    conditions.push(`startYear <= ${filters.maxYear}`);
  }

  // Exclude specific regions
  if (filters.excludeRegions && filters.excludeRegions.length > 0) {
    const regionConditions = filters.excludeRegions.map(region => `region != '${region}'`).join(' AND ');
    conditions.push(regionConditions);
  }

  // Exclude specific directors
  if (filters.excludeDirectors && filters.excludeDirectors.length > 0) {
    const directorConditions = filters.excludeDirectors.map(director => `directors NOT LIKE '%${director}%'`).join(' AND ');
    conditions.push(directorConditions);
  }

  // Exclude specific actors
  if (filters.excludeActors && filters.excludeActors.length > 0) {
    const actorConditions = filters.excludeActors.map(actor => `actors NOT LIKE '%${actor}%'`).join(' AND ');
    conditions.push(actorConditions);
  }

  // Exclude specific keywords
  if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
    const keywordConditions = filters.excludeKeywords.map(keyword => `keywords NOT LIKE '%${keyword}%'`).join(' AND ');
    conditions.push(keywordConditions);
  }

  // Return combined filter conditions or '1=1' if no conditions
  return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
};
