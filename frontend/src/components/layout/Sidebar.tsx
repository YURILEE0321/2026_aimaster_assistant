import type { ReactNode } from 'react';
import { useAppState } from '../../state/AppState';
import { fonts } from '../../theme/tokens';
import { useHover } from '../../utils/useHover';

export function Sidebar() {
  const { spaces, activeSpaceId, selectSpace, sidebarCollapsed, toggleSidebar, openCreateSpaceModal } =
    useAppState();

  if (sidebarCollapsed) {
    return (
      <aside
        style={{
          width: 64,
          flexShrink: 0,
          borderRight: '1px solid rgba(var(--ink-rgb), 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '16px 0',
        }}
      >
        <IconButton label="펼치기" onClick={toggleSidebar}>
          ▶
        </IconButton>
        <IconButton label="새 Space" onClick={openCreateSpaceModal}>
          ＋
        </IconButton>
        <div style={{ width: '70%', height: 1, background: 'rgba(var(--ink-rgb), 0.08)' }} />
        {spaces.map((space) => (
          <SpaceInitialButton
            key={space.space_id}
            label={space.name}
            isActive={space.space_id === activeSpaceId}
            onClick={() => selectSpace(space.space_id)}
          />
        ))}
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 264,
        flexShrink: 0,
        borderRight: '1px solid rgba(var(--ink-rgb), 0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        gap: 4,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px 12px',
        }}
      >
        <span style={{ fontFamily: fonts.mono, fontSize: 11.5, opacity: 0.6, letterSpacing: 0.4 }}>
          SPACES · {spaces.length}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton label="새 Space" onClick={openCreateSpaceModal} small>
            ＋
          </IconButton>
          <IconButton label="접기" onClick={toggleSidebar} small>
            ◀
          </IconButton>
        </div>
      </div>

      {spaces.map((space) => (
        <SpaceRow
          key={space.space_id}
          name={space.name}
          documentCount={space.document_count}
          isActive={space.space_id === activeSpaceId}
          onClick={() => selectSpace(space.space_id)}
        />
      ))}
    </aside>
  );
}

function SpaceRow({
  name,
  documentCount,
  isActive,
  onClick,
}: {
  name: string;
  documentCount: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverProps}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        padding: '9px 12px',
        borderRadius: 10,
        border: 'none',
        borderLeft: isActive ? '3px solid var(--accent-text)' : '3px solid transparent',
        background: isActive
          ? 'rgba(255,138,61,0.08)'
          : isHovered
            ? 'rgba(var(--ink-rgb), 0.05)'
            : 'transparent',
        color: 'var(--text)',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
      <span style={{ fontFamily: fonts.mono, fontSize: 11, opacity: 0.55 }}>문서 {documentCount}개</span>
    </button>
  );
}

function SpaceInitialButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverProps}
      title={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        border: isActive ? '2px solid var(--accent-text)' : '1px solid rgba(var(--ink-rgb), 0.14)',
        background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
        color: 'var(--text)',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {label.charAt(0)}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  small,
  children,
}: {
  label: string;
  onClick: () => void;
  small?: boolean;
  children: ReactNode;
}) {
  const { isHovered, hoverProps } = useHover();
  const size = small ? 24 : 32;
  return (
    <button
      onClick={onClick}
      {...hoverProps}
      aria-label={label}
      title={label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid rgba(var(--ink-rgb), 0.14)',
        background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
        color: 'var(--text)',
        fontSize: small ? 12 : 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
