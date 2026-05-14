import api from '../lib/api';
import type {
  AdminUserListItem,
  AdminGamePageRequest,
  AdminPaginatedResponse,
  Game,
  InviteRequest,
  Role,
  UserStatus,
  InviteStatus,
  GameRequestStatus,
} from '../types';

export const adminService = {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async listUsers(params: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: UserStatus;
    search?: string;
  } = {}): Promise<AdminPaginatedResponse<AdminUserListItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const response = await api.get<AdminPaginatedResponse<AdminUserListItem>>(
      `/admin/users${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  async getUserById(id: string): Promise<AdminUserListItem> {
    const response = await api.get<AdminUserListItem>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: string, role: Role): Promise<AdminUserListItem> {
    const response = await api.patch<AdminUserListItem>(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<AdminUserListItem> {
    const response = await api.patch<AdminUserListItem>(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // ============================================================================
  // INVITE REQUEST MANAGEMENT
  // ============================================================================

  async listInvites(params: {
    page?: number;
    limit?: number;
    status?: InviteStatus;
  } = {}): Promise<AdminPaginatedResponse<InviteRequest>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);

    const qs = query.toString();
    // Invites endpoint now returns meta (matching admin user endpoints)
    const response = await api.get<AdminPaginatedResponse<InviteRequest>>(
      `/invites${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  async updateInvite(
    id: string,
    data: { status?: InviteStatus; adminNote?: string }
  ): Promise<InviteRequest> {
    const response = await api.patch<InviteRequest>(`/invites/${id}`, data);
    return response.data;
  },

  // ============================================================================
  // GAME PAGE REQUEST MANAGEMENT
  // ============================================================================

  async listGameRequests(params: {
    page?: number;
    limit?: number;
    status?: GameRequestStatus;
    search?: string;
  } = {}): Promise<AdminPaginatedResponse<AdminGamePageRequest>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const response = await api.get<AdminPaginatedResponse<AdminGamePageRequest>>(
      `/admin/game-requests${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  async reviewGameRequest(
    id: string,
    data: { status: GameRequestStatus.APPROVED | GameRequestStatus.REJECTED; adminNote?: string }
  ): Promise<AdminGamePageRequest> {
    const response = await api.patch<AdminGamePageRequest>(`/admin/game-requests/${id}`, data);
    return response.data;
  },

  // ============================================================================
  // GAME PAGE MANAGEMENT
  // ============================================================================

  async createGame(data: {
    name: string;
    description?: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    tags?: string[];
  }): Promise<Game> {
    const response = await api.post<Game>('/admin/games', data);
    return response.data;
  },

  async updateGame(
    id: string,
    data: {
      name?: string;
      description?: string;
      content?: string;
      imageUrl?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<Game> {
    const response = await api.patch<Game>(`/admin/games/${id}`, data);
    return response.data;
  },

  async deleteGame(id: string): Promise<void> {
    await api.delete(`/admin/games/${id}`);
  },
};
