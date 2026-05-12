import api from '../lib/api';
import type { GamePageRequest, GamePageRequestInput } from '../types';

export type { GamePageRequest, GamePageRequestInput };

export interface GamePageRequestListResponse {
  data: GamePageRequest[];
  count: number;
}

export const gameRequestService = {
  /**
   * Submit a new game page request (authenticated)
   */
  async createGameRequest(input: GamePageRequestInput): Promise<GamePageRequest> {
    const response = await api.post('/api/game-requests', input);
    return response.data.data as GamePageRequest;
  },

  /**
   * Get the current user's game page requests (authenticated)
   */
  async getMyGameRequests(): Promise<GamePageRequest[]> {
    const response = await api.get('/api/game-requests');
    return (response.data as GamePageRequestListResponse).data;
  },
};
