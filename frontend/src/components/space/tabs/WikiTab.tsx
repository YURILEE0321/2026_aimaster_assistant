import { useAppState } from '../../../state/AppState';
import { WikiCard } from '../../wiki/WikiCard';

export function WikiTab() {
  const { activeSpaceData, openReview, setActiveTab } = useAppState();
  const approvedDocs = activeSpaceData.documents.filter((doc) => doc.status === 'approved');

  if (approvedDocs.length === 0) {
    return (
      <div
        style={{
          border: '1px dashed rgba(var(--ink-rgb), 0.2)',
          borderRadius: 14,
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 16px', fontSize: 13.5, opacity: 0.65 }}>
          아직 승인된 문서가 없어요. 문서를 등록하고 검토를 완료해보세요.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: '1px solid rgba(var(--ink-rgb), 0.18)',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: 13,
          }}
        >
          문서 등록으로 이동
        </button>
      </div>
    );
  }

  return (
    <div>
      {approvedDocs.map((doc) => {
        const file = activeSpaceData.files.find((f) => f.file_id === doc.file_id);
        return (
          <WikiCard
            key={doc.document_id}
            doc={doc}
            fileName={file?.name ?? ''}
            onClick={() => openReview(doc.document_id, 'wiki')}
          />
        );
      })}
    </div>
  );
}
