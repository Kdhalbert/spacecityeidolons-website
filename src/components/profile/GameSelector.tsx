import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gameService } from '../../services/games.service';
import './GameSelector.css';

interface GameSelectorProps {
  selectedGames: string[];
  onGamesChange: (games: string[]) => void;
  maxGames?: number;
}

interface Game {
  id: string;
  name: string;
  category?: string | null;
}

/**
 * GameSelector component - multi-select game chooser with autocomplete
 * T168: Game selection component with search and tag display
 */
export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGames,
  onGamesChange,
  maxGames = 20,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Cache of game names for display, independent of current suggestions
  const [gameNames, setGameNames] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Keep the cache updated with any games we see in the suggestions list
  useEffect(() => {
    if (!suggestions || suggestions.length === 0) {
      return;
    }

    if (suggestions.length > 0) {
      const gameNames: Record<string, string> = {};
      suggestions.forEach((game) => {
/* eslint-disable react-hooks/set-state-in-effect */
        gameNames[game.id] = game.name;
      });
      setGameNames((prev) => ({
        ...prev,
        ...gameNames,
      }));
    }
  }, [suggestions]);

  // Ensure we have names for all selected games, even when they were pre-selected
  useEffect(() => {
    const missingIds = selectedGames.filter((id) => !gameNames[id]);
    if (missingIds.length === 0) {
      return;
    }

    let canceled = false;

    const fetchMissing = async () => {
      try {
        const games: Game[] = await gameService.getGamesByIds(missingIds);
        if (canceled || !games) {
          return;
        }

        setGameNames((prev) => {
          const updated = { ...prev };
          games.forEach((game) => {
            if (game && game.id && game.name) {
              updated[game.id] = game.name;
            }
          });
          return updated;
        });
      } catch {
        // Ignore errors; missing games will continue to display their IDs
      }
    };

    fetchMissing();

    return () => {
      canceled = true;
    };
  }, [selectedGames, gameNames]);

  // Scroll highlighted suggestion into view
  useEffect(() => {
    if (highlightedIndex < 0 || !suggestionsRef.current) {
      return;
    }
    const highlighted = suggestionsRef.current.children[highlightedIndex] as HTMLElement | undefined;
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await gameService.searchGames(query, 10);
          // Filter out already selected games
          const filtered = results.filter((g) => !selectedGames.includes(g.id));
          setSuggestions(filtered.slice(0, 10));
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        }
      }, 300);
    },
    [selectedGames]
  );

  // Handle adding a game
  const addGame = (gameId: string) => {
    if (!selectedGames.includes(gameId) && selectedGames.length < maxGames) {
      onGamesChange([...selectedGames, gameId]);
      setSearchQuery('');
      setSuggestions([]);
      inputRef.current?.focus();
    }
  };

  // Handle removing a game
  const removeGame = (gameId: string) => {
    onGamesChange(selectedGames.filter((id) => id !== gameId));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          addGame(suggestions[highlightedIndex].id);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSuggestions([]);
        break;
      default:
        break;
    }
  };

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="game-selector" ref={containerRef}>
      <div className="game-selector-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={
            selectedGames.length < maxGames
              ? 'Search and select games...'
              : `Maximum ${maxGames} games selected`
          }
          className="game-selector-input"
          disabled={selectedGames.length >= maxGames}
          aria-label="Search games"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
        />
        <span className="game-selector-count" aria-live="polite">
          {selectedGames.length}/{maxGames}
        </span>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="game-selector-suggestions" ref={suggestionsRef} role="listbox">
          {suggestions.map((game, index) => (
            <div
              key={game.id}
              className={`game-selector-suggestion ${
                index === highlightedIndex ? 'highlighted' : ''
              }`}
              onClick={() => addGame(game.id)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="game-suggestion-name">{game.name}</div>
              {game.category && (
                <div className="game-suggestion-category">{game.category}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedGames.length > 0 && (
        <div className="game-selector-tags">
          {selectedGames.map((gameId) => (
            <div key={gameId} className="game-tag">
              <span className="game-tag-name">{gameNames[gameId] || gameId}</span>
              <button
                onClick={() => removeGame(gameId)}
                className="game-tag-remove"
                aria-label={`Remove ${gameNames[gameId] || gameId}`}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedGames.length >= maxGames && (
        <div className="game-selector-limit-message">
          Maximum {maxGames} games selected
        </div>
      )}
    </div>
  );
};
