import type { WikiDocument } from '../../../api/types';
import { documentStatusStyle } from '../../../utils/statusStyle';
import { useHover } from '../../../utils/useHover';

const ACTION_LABEL: Record<WikiDocument['status'], string> = {
  pending: '검토하기',
  approved: '다시 보기',
  rejected: '다시 검토',
};

export function DocumentRow({ doc, onOpenReview }: { doc: WikiDocument; onOpenReview: () => void }) {
  const badge = documentStatusStyle(doc.status);
  const { isHovered, hoverProps } = useHover();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 14px',
        borderLeft: '2px solid rgba(var(--ink-rgb), 0.14)',
        marginLeft: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {doc.title}
        </span>
        {doc.flags.length > 0 && (
          <span style={{ fontSize: 12, color: '#E08A6C', flexShrink: 0 }}>⚠ {doc.flags.length}</span>
        )}
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            padding: '3px 9px',
            borderRadius: 999,
            background: badge.background,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>
      <button
        onClick={onOpenReview}
        {...hoverProps}
        style={{
          flexShrink: 0,
          fontSize: 12.5,
          fontWeight: 500,
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(var(--ink-rgb), 0.16)',
          background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
          color: 'var(--text)',
        }}
      >
        {ACTION_LABEL[doc.status]}
      </button>
    </div>
  );
}
