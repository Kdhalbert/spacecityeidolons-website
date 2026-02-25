import api from '../lib/api';

interface Game {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface GameForSelection {
  id: string;
  name: string;
  category?: string | null;
}

interface GamesResponse {
  data: Game[];
  count: number;
  total: number;
  limit: number;
  offset: number;
}

export const gameService = {
  /**
   * Get list of games with optional filtering
   */
  async getGames(
    category?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GamesResponse> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await api.get(`/api/games?${params.toString()}`);
    return response.data;
  },

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Game | null> {
    try {
      const response = await api.get(`/api/games/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Get multiple games by their IDs
   */
  async getGamesByIds(ids: string[]): Promise<Game[]> {
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await api.get(`/api/games/${id}`);
            return response.data as Game;
          } catch {
            return null;
          }
        })
      );
      return results.filter((g): g is Game => g !== null);
    } catch {
      return [];
    }
  },

  /**
   * Search games by query
   */
  async searchGames(query: string, limit: number = 20): Promise<Game[]> {
    try {
      const response = await api.get(`/api/games/search/${query}?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching games:', error);
      return [];
    }
  },

  /**
   * Get games by category
   */
  async getGamesByCategory(category: string, limit: number = 50): Promise<Game[]> {
    try {
      const response = await api.get(`/api/games?category=${category}&limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching games by category:', error);
      return [];
    }
  },

  /**
   * Get all game categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get('/api/games/categories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get all game tags
   */
  async getTags(): Promise<string[]> {
    try {
      const response = await api.get('/api/games/tags');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  /**
   * Get games for selection (minimal data)
   * T168: Used by GameSelector component
   */
  async getGamesForSelection(limit: number = 100): Promise<GameForSelection[]> {
    try {
      const response = await api.get(`/api/games/selection?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching games for selection:', error);
      return [];
    }
  },
};
