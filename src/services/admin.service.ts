import api from '../lib/api';
import type {
  AdminUserListItem,
  AdminPaginatedResponse,
  InviteRequest,
  Role,
  UserStatus,
  InviteStatus,
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
};
