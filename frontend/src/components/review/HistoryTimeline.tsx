import type { DocumentHistoryEntry } from '../../api/types';
import { formatDateTime } from '../../utils/format';
import { fonts } from '../../theme/tokens';

export function HistoryTimeline({ history }: { history: DocumentHistoryEntry[] }) {
  const items = [...history].reverse();
  return (
    <div>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--accent-text)', margin: '0 0 12px' }}>
        버전 이력
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-text)', flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>{entry.label}</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, opacity: 0.5 }}>{formatDateTime(entry.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
