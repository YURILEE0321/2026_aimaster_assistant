import type { DocumentSection } from '../../api/types';
import { fonts } from '../../theme/tokens';
import { MarkdownBody } from './MarkdownBody';

export function SectionRenderer({ section }: { section: DocumentSection }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3
        style={{
          fontSize: 14.5,
          fontWeight: 600,
          color: 'var(--accent-text)',
          margin: '0 0 10px',
        }}
      >
        {section.heading}
      </h3>

      {section.type === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.paragraphs.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: 1.65, opacity: 0.85 }}>
              {p}
            </p>
          ))}
        </div>
      )}

      {section.type === 'markdown' && <MarkdownBody content={section.content} />}

      {section.type === 'tags' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {section.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 12.5,
                padding: '5px 12px',
                borderRadius: 999,
                background: 'rgba(var(--ink-rgb), 0.06)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {section.type === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {section.columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderBottom: '1px solid rgba(var(--ink-rgb), 0.14)',
                      fontFamily: fonts.mono,
                      fontSize: 11.5,
                      textTransform: 'uppercase',
                      opacity: 0.6,
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr key={i}>
                  {section.columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid rgba(var(--ink-rgb), 0.06)',
                      }}
                    >
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
