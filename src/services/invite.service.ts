import api from '../lib/api';
import type { Platform, InviteRequest } from '../types';

export interface CreateInviteRequestData {
  email: string;
  name: string;
  platform: Platform;
  message?: string;
}

export interface CreateMemberRequestData {
  email?: string;
  name?: string;
  message?: string;
}

/**
 * Submit a new invite request
 */
export async function createInviteRequest(
  data: CreateInviteRequestData
): Promise<InviteRequest> {
  const response = await api.post<InviteRequest>('/invites', data);
  return response.data;
}

/**
 * Submit a member request for an authenticated guest user.
 */
export async function createMemberRequest(
  data: CreateMemberRequestData
): Promise<InviteRequest> {
  const response = await api.post<{ data: InviteRequest }>('/invites/member-request', data);
  return response.data.data;
}
