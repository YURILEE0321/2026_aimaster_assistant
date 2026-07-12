import type { WikiDocument } from '../../api/types';
import { useHover } from '../../utils/useHover';

interface RelatedDocumentsProps {
  relatedDocs: WikiDocument[];
  onSelect: (documentId: string) => void;
}

export function RelatedDocuments({ relatedDocs, onSelect }: RelatedDocumentsProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--accent-text)', margin: '0 0 10px' }}>
        관련 문서
      </h3>
      {relatedDocs.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, opacity: 0.5 }}>관련 문서가 없어요.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {relatedDocs.map((doc) => (
            <RelatedChip key={doc.document_id} label={doc.title} onClick={() => onSelect(doc.document_id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedChip({ label, onClick }: { label: string; onClick: () => void }) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverProps}
      style={{
        fontSize: 12.5,
        padding: '7px 14px',
        borderRadius: 999,
        border: '1px solid rgba(var(--ink-rgb), 0.16)',
        background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
        color: 'var(--text)',
      }}
    >
      {label}
    </button>
  );
}
