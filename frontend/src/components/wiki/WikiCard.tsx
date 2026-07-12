import type { WikiDocument } from '../../api/types';
import { useHover } from '../../utils/useHover';
import { fonts } from '../../theme/tokens';

interface WikiCardProps {
  doc: WikiDocument;
  fileName: string;
  onClick: () => void;
}

export function WikiCard({ doc, fileName, onClick }: WikiCardProps) {
  const { isHovered, hoverProps } = useHover();
  const summary = doc.sections.find((s) => s.type === 'text');
  const description = summary && summary.type === 'text' ? summary.paragraphs.join(' ') : '';
  const tagsSection = doc.sections.find((s) => s.type === 'tags');
  const tags = tagsSection && tagsSection.type === 'tags' ? tagsSection.tags : [];

  return (
    <button
      onClick={onClick}
      {...hoverProps}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        border: '1px solid rgba(var(--ink-rgb), 0.1)',
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 10,
        background: isHovered ? 'rgba(var(--ink-rgb), 0.04)' : 'rgba(var(--ink-rgb), 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span>📘</span>
        <span style={{ fontSize: 15.5, fontWeight: 600 }}>{doc.title}</span>
        <span style={{ fontSize: 11, fontFamily: fonts.mono, opacity: 0.5 }}>v{doc.version}</span>
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 11.5, opacity: 0.5, marginBottom: 8 }}>{fileName}</div>
      {description && (
        <p
          style={{
            margin: '0 0 10px',
            fontSize: 13,
            opacity: 0.75,
          }}
        >
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11.5,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(var(--ink-rgb), 0.06)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
