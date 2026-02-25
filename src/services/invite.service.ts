import { apiPost } from '../lib/api';
import type { Platform, InviteRequest } from '../types';

export interface CreateInviteRequestData {
  email: string;
  name: string;
  platform: Platform;
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
