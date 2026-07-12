import { useAppState } from '../../state/AppState';
import { fonts, radii, shadows, surface } from '../../theme/tokens';
import { useHover } from '../../utils/useHover';

export function AccountMenu() {
  const { currentUser, users, isAccountMenuOpen, setAccountMenuOpen, switchUser } = useAppState();
  const { isHovered, hoverProps } = useHover();

  if (!currentUser) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
        {...hoverProps}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
          border: '1px solid rgba(var(--ink-rgb), 0.12)',
          borderRadius: radii.pill,
          padding: '6px 12px 6px 6px',
          color: 'var(--text)',
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--accent-text)',
            color: '#0B0E13',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {currentUser.name.charAt(0)}
        </span>
        <span style={{ fontSize: 13.5 }}>{currentUser.name}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>

      {isAccountMenuOpen && (
        <>
          <div
            onClick={() => setAccountMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 50,
              minWidth: 220,
              background: surface.background,
              color: surface.text,
              borderRadius: radii.md,
              boxShadow: shadows.userMenu,
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            {users.map((user) => (
              <UserRow
                key={user.user_id}
                name={user.name}
                userId={user.user_id}
                isActive={user.user_id === currentUser.user_id}
                onSelect={() => switchUser(user.user_id)}
              />
            ))}
          </div>
        </>
      )}
      <style>{`
        @keyframes scaleIn { from { opacity:0; transform: scale(0.96); } to { opacity:1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function UserRow({
  name,
  userId,
  isActive,
  onSelect,
}: {
  name: string;
  userId: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={onSelect}
      {...hoverProps}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        background: isActive ? 'rgba(255,138,61,0.12)' : isHovered ? 'rgba(24,27,20,0.05)' : 'transparent',
        border: 'none',
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, opacity: 0.6 }}>{userId}</div>
    </button>
  );
}
