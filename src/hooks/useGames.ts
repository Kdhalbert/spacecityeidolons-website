import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../services/games.service';
import { gameRequestService } from '../services/game-request.service';
import type { GamePageRequestInput } from '../types';

const GAMES_QUERY_KEY = 'games';
const GAME_REQUESTS_QUERY_KEY = 'gameRequests';

export function useGames(category?: string) {
  return useQuery({
    queryKey: [GAMES_QUERY_KEY, 'list', category],
    queryFn: () => gameService.getGames(category),
    staleTime: 1000 * 60 * 10,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: [GAMES_QUERY_KEY, 'detail', id],
    queryFn: () => gameService.getGameById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGameCategories() {
  return useQuery({
    queryKey: [GAMES_QUERY_KEY, 'categories'],
    queryFn: () => gameService.getCategories(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useMyGameRequests() {
  return useQuery({
    queryKey: [GAME_REQUESTS_QUERY_KEY, 'mine'],
    queryFn: () => gameRequestService.getMyGameRequests(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGameRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GamePageRequestInput) =>
      gameRequestService.createGameRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAME_REQUESTS_QUERY_KEY, 'mine'] });
    },
  });
}
