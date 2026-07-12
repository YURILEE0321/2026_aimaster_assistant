import { apiClient } from './client';
import type { ChatMessage } from './types';

export function listMessages(spaceId: string): Promise<{ items: ChatMessage[] }> {
  return apiClient.get(`/spaces/${spaceId}/chat/messages`);
}

export function sendMessage(
  spaceId: string,
  text: string,
): Promise<{ user_message: ChatMessage; assistant_message: ChatMessage }> {
  return apiClient.post(`/spaces/${spaceId}/chat/messages`, { text });
}
