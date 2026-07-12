import { apiClient } from './client';
import type { Space } from './types';

export function createSpace(name: string, description: string): Promise<{ space: Space }> {
  return apiClient.post('/spaces', { name, description: description || undefined });
}

export function listSpaces(): Promise<{ items: Space[] }> {
  return apiClient.get('/spaces');
}

export function getSpace(spaceId: string): Promise<{ space: Space }> {
  return apiClient.get(`/spaces/${spaceId}`);
}

export function deleteSpace(spaceId: string): Promise<void> {
  return apiClient.delete(`/spaces/${spaceId}`);
}

export function deleteAllSpaces(): Promise<void> {
  return apiClient.delete('/spaces');
}
