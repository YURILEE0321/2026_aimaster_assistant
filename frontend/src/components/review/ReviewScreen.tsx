import type { WikiDocument } from '../../api/types';
import { useAppState } from '../../state/AppState';
import { fonts } from '../../theme/tokens';
import { documentStatusStyle } from '../../utils/statusStyle';
import { useHover } from '../../utils/useHover';
import { FlagBanner } from './FlagBanner';
import { SectionRenderer } from './SectionRenderer';
import { RelatedDocuments } from './RelatedDocuments';
import { HistoryTimeline } from './HistoryTimeline';
import { ReviewActionBar } from './ReviewActionBar';

export function ReviewScreen() {
  const {
    activeReviewDocument,
    activeSpaceData,
    closeReview,
    openReview,
    approveDocument,
    rejectDocument,
    reopenDocument,
  } = useAppState();

  if (!activeReviewDocument) return null;

  const doc = activeReviewDocument;
  const file = activeSpaceData.files.find((f) => f.file_id === doc.file_id);
  const badge = documentStatusStyle(doc.status);
  const relatedDocs = doc.related_document_ids
    .map((id) => activeSpaceData.documents.find((d) => d.document_id === id))
    .filter((d): d is WikiDocument => d !== undefined);

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        padding: '28px 36px',
        overflowY: 'auto',
      }}
    >
      <BackLink label={file?.name ?? ''} onClick={closeReview} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 6px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: fonts.heading, fontWeight: 500, fontSize: 32, margin: 0 }}>{doc.title}</h1>
        <span style={{ fontFamily: fonts.mono, fontSize: 12, opacity: 0.5 }}>v{doc.version}</span>
        <span
          style={{
            fontSize: 11.5,
            padding: '4px 11px',
            borderRadius: 999,
            background: badge.background,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>

      <div style={{ marginTop: 24 }}>
        <FlagBanner flags={doc.flags} />

        {doc.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}

        <RelatedDocuments relatedDocs={relatedDocs} onSelect={(id) => openReview(id)} />

        {doc.status === 'rejected' && (
          <div
            style={{
              marginBottom: 24,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(178,90,62,0.12)',
              color: '#E08A6C',
              fontSize: 13,
            }}
          >
            반려 사유: {doc.reject_reason}
          </div>
        )}

        <HistoryTimeline history={doc.history} />
      </div>

      <ReviewActionBar
        status={doc.status}
        onApprove={() => approveDocument(doc.document_id)}
        onReject={(reason) => rejectDocument(doc.document_id, reason)}
        onReopen={() => reopenDocument(doc.document_id)}
        onClose={closeReview}
      />
    </main>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverProps}
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        fontSize: 13,
        opacity: isHovered ? 0.9 : 0.6,
        fontFamily: fonts.mono,
      }}
    >
      <span>← 목록으로</span>
      {label && <span>/ {label}</span>}
    </button>
  );
}
