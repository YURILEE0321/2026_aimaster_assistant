import { useEffect } from 'react';
import { getFile } from '../api/files';
import { listDocuments } from '../api/documents';
import type { UploadedFile, WikiDocument } from '../api/types';

const POLL_INTERVAL_MS = 1200;

export function useAnalysisPolling(
  spaceId: string | null,
  files: UploadedFile[],
  onFilesUpdate: (files: UploadedFile[]) => void,
  onDocumentsUpdate: (documents: WikiDocument[]) => void,
): void {
  const analyzingIds = files
    .filter((file) => file.status === 'analyzing')
    .map((file) => file.file_id)
    .join(',');

  useEffect(() => {
    if (!spaceId || !analyzingIds) return;
    const ids = analyzingIds.split(',');

    const interval = window.setInterval(async () => {
      const results = await Promise.all(
        ids.map((id) =>
          getFile(id)
            .then((res) => res.file)
            .catch(() => null),
        ),
      );
      const updatedFiles = results.filter((file): file is UploadedFile => file !== null);
      if (updatedFiles.length > 0) {
        onFilesUpdate(updatedFiles);
      }

      const justFinished = updatedFiles.some((file) => file.status !== 'analyzing');
      if (justFinished) {
        const { items } = await listDocuments(spaceId);
        onDocumentsUpdate(items);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, analyzingIds]);
}
