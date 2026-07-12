import { apiClient } from './client';
import type { UploadedFile } from './types';

export function uploadFiles(spaceId: string, files: File[]): Promise<{ items: UploadedFile[] }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files[]', file);
  }
  return apiClient.postForm(`/spaces/${spaceId}/files`, formData);
}

export function listFiles(spaceId: string): Promise<{ items: UploadedFile[] }> {
  return apiClient.get(`/spaces/${spaceId}/files`);
}

export function getFile(fileId: string): Promise<{ file: UploadedFile }> {
  return apiClient.get(`/files/${fileId}`);
}

export function analyzeFile(fileId: string): Promise<{ file_id: string; status: string }> {
  return apiClient.post(`/files/${fileId}/analyze`);
}

export function retryFile(fileId: string): Promise<{ file_id: string; status: string }> {
  return apiClient.post(`/files/${fileId}/retry`);
}

export function deleteFile(fileId: string): Promise<void> {
  return apiClient.delete(`/files/${fileId}`);
}
