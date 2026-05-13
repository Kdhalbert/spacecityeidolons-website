import { apiPost } from '../lib/api';
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
  const response = await apiPost<InviteRequest>(
    '/invites',
    data as unknown as Record<string, unknown>
  );
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to create invite request');
  }
  
  if (!response.data) {
    throw new Error('No data returned from API');
  }
  
  return response.data;
}

/**
 * Submit a member request for an authenticated guest user.
 */
export async function createMemberRequest(
  data: CreateMemberRequestData
): Promise<InviteRequest> {
  const response = await apiPost<InviteRequest>(
    '/invites/member-request',
    data as unknown as Record<string, unknown>
  );

  if (response.error) {
    throw new Error(response.error.message || 'Failed to submit member request');
  }

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  return response.data;
}
