import { apiClient } from './client';
import type { User } from './types';

export function listUsers(): Promise<{ items: User[] }> {
  return apiClient.get('/auth/users');
}

export function switchUser(userId: string): Promise<{ token: string; user: User }> {
  return apiClient.post('/auth/switch', { user_id: userId });
}

export function getMe(): Promise<{ user: User }> {
  return apiClient.get('/auth/me');
}
