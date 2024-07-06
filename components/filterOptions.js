import React, { useState } from 'react';

const FilterOptions = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    minRuntime: 60,
    excludeAdult: true,
    excludeTypes: ['short', 'tvEpisode', 'tvSeries', 'tvMiniSeries', 'tvSpecial', 'video'],
    excludeGenres: ['Reality-TV', 'Talk-Show', 'Game-Show', 'Adult', 'Animation', 'Documentary'],
    minVotes: 1000,
    minRating: 6,
    excludeLanguages: ['xx'],
    maxYear: new Date().getFullYear(),
    excludeRegions: ['IN', 'CN'],
    excludeDirectors: ['nm0001104'],
    excludeActors: ['nm1384121'],
    excludeKeywords: ['student film', 'independent film'],
  });

  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters({
        ...filters,
        [name]: checked,
      });
    } else if (type === 'number') {
      setFilters({
        ...filters,
        [name]: Number(value),
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const handleArrayChange = (e, name) => {
    const { value } = e.target;
    setFilters({
      ...filters,
      [name]: value.split(',').map(item => item.trim()),
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="filter-options-container">
      <div className="filter-options-header" onClick={toggleOpen}>
        <h2>Filter Options</h2>
        <button>{isOpen ? '-' : '>'}</button>
      </div>
      <div className={`filter-options-content ${isOpen ? 'show' : ''}`}>
        <div className="filter-category">
          <h3>General Filters</h3>
          <div className="filter-group">
            <label>Minimum Runtime (minutes)</label>
            <input
              type="number"
              name="minRuntime"
              value={filters.minRuntime}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <label>Exclude Adult Films</label>
            <input
              type="checkbox"
              name="excludeAdult"
              checked={filters.excludeAdult}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <label>Maximum Release Year</label>
            <input
              type="number"
              name="maxYear"
              value={filters.maxYear}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="filter-category">
          <h3>Content Type</h3>
          <div className="filter-group">
            <label>Exclude Types (comma-separated)</label>
            <input
              type="text"
              name="excludeTypes"
              value={filters.excludeTypes.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeTypes')}
            />
          </div>
        </div>

        <div className="filter-category">
          <h3>Genres & Languages</h3>
          <div className="filter-group">
            <label>Exclude Genres (comma-separated)</label>
            <input
              type="text"
              name="excludeGenres"
              value={filters.excludeGenres.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeGenres')}
            />
          </div>
          <div className="filter-group">
            <label>Exclude Languages (comma-separated)</label>
            <input
              type="text"
              name="excludeLanguages"
              value={filters.excludeLanguages.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeLanguages')}
            />
          </div>
        </div>

        <div className="filter-category">
          <h3>Ratings & Votes</h3>
          <div className="filter-group">
            <label>Minimum Number of Votes</label>
            <input
              type="number"
              name="minVotes"
              value={filters.minVotes}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <label>Minimum Average Rating</label>
            <input
              type="number"
              name="minRating"
              value={filters.minRating}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="filter-category">
          <h3>Exclude Specifics</h3>
          <div className="filter-group">
            <label>Exclude Regions (comma-separated)</label>
            <input
              type="text"
              name="excludeRegions"
              value={filters.excludeRegions.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeRegions')}
            />
          </div>
          <div className="filter-group">
            <label>Exclude Directors (comma-separated nconst)</label>
            <input
              type="text"
              name="excludeDirectors"
              value={filters.excludeDirectors.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeDirectors')}
            />
          </div>
          <div className="filter-group">
            <label>Exclude Actors (comma-separated nconst)</label>
            <input
              type="text"
              name="excludeActors"
              value={filters.excludeActors.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeActors')}
            />
          </div>
          <div className="filter-group">
            <label>Exclude Keywords (comma-separated)</label>
            <input
              type="text"
              name="excludeKeywords"
              value={filters.excludeKeywords.join(', ')}
              onChange={(e) => handleArrayChange(e, 'excludeKeywords')}
            />
          </div>
        </div>

        <div className="filter-category">
          <h3>Placeholder</h3>
          <div className="filter-group">
            {/* <!-- Add any additional inputs or placeholders here --> */}
          </div>
        </div>

        <button onClick={handleApplyFilters}>Apply Filters</button>
      </div>
    </div>
  );
};

export default FilterOptions;
