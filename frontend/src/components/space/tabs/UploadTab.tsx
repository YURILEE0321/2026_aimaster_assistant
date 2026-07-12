import { useState } from 'react';
import { useAppState } from '../../../state/AppState';
import { ApiError } from '../../../api/client';
import { Dropzone } from '../upload/Dropzone';
import { FileCard } from '../upload/FileCard';

export function UploadTab() {
  const { activeSpaceData, uploadFiles, startAnalyze, retryAnalyze, deleteFile, openReview } = useAppState();
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(files: File[]) {
    try {
      setError(null);
      await uploadFiles(files);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '업로드 중 오류가 발생했어요.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, opacity: 0.6 }}>{activeSpaceData.files.length}개 파일 등록됨</span>
      </div>

      <Dropzone onFilesSelected={handleFilesSelected} />

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(178,90,62,0.12)',
            color: '#E08A6C',
            fontSize: 13,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {activeSpaceData.files.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5, fontSize: 13.5, marginTop: 32 }}>
          아직 등록된 파일이 없어요.
        </p>
      ) : (
        <div>
          {activeSpaceData.files.map((file) => (
            <FileCard
              key={file.file_id}
              file={file}
              documents={activeSpaceData.documents.filter((doc) => doc.file_id === file.file_id)}
              onAnalyze={() => startAnalyze(file.file_id)}
              onRetry={() => retryAnalyze(file.file_id)}
              onDelete={() => deleteFile(file.file_id)}
              onOpenReview={(documentId) => openReview(documentId, 'upload')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
