import React, { useState } from 'react';
import type { EventFilters } from '../../services/events.service';
import { EventVisibility } from '../../types';
import '../calendar/EventFiltering.css';

interface EventFilteringProps {
  onFilterChange: (filters: EventFilters) => void;
  games?: string[];
  isLoading?: boolean;
}

interface FilterState {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  game?: string;
  visibility?: EventVisibility;
}

export const EventFiltering: React.FC<EventFilteringProps> = ({
  onFilterChange,
  games = [],
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilter };
    setFilters(updated);

    // Convert undefined values to undefined to avoid sending them to API
    const cleanedFilters: EventFilters = {};
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        cleanedFilters[key as keyof EventFilters] = value as any;
      }
    });

    onFilterChange(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== undefined && val !== '' && val !== null
  );

  return (
    <div className={`event-filtering ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="filter-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle event filters"
      >
        <span className="filter-icon">🔍</span>
        <span>Filters</span>
        {hasActiveFilters && <span className="filter-badge">{Object.keys(filters).length}</span>}
        <span className={`filter-arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="filter-panel">
          <div className="filter-group">
            <label htmlFor="search-input" className="filter-label">
              Search Events
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by title or description..."
              className="filter-input"
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="start-date-input" className="filter-label">
                Start Date
              </label>
              <input
                id="start-date-input"
                type="date"
                className="filter-input"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="end-date-input" className="filter-label">
                End Date
              </label>
              <input
                id="end-date-input"
                type="date"
                className="filter-input"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="game-select" className="filter-label">
                Game
              </label>
              <select
                id="game-select"
                className="filter-select"
                value={filters.game || ''}
                onChange={(e) => handleFilterChange({ game: e.target.value })}
                disabled={isLoading}
              >
                <option value="">All Games</option>
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="visibility-select" className="filter-label">
                Visibility
              </label>
              <select
                id="visibility-select"
                className="filter-select"
                value={filters.visibility || ''}
                onChange={(e) => handleFilterChange({ visibility: e.target.value as EventVisibility })}
                disabled={isLoading}
              >
                <option value="">All</option>
                <option value={EventVisibility.PUBLIC}>Public</option>
                <option value={EventVisibility.MEMBERS_ONLY}>Members Only</option>
                <option value={EventVisibility.PRIVATE}>Private</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="filter-btn reset"
              onClick={handleReset}
              disabled={isLoading || !hasActiveFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
            <button
              className="filter-btn apply"
              onClick={() => setIsExpanded(false)}
              disabled={isLoading}
              aria-label="Apply filters"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFiltering;
