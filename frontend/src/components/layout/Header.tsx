import type { ThemeMode } from '../../theme/useTheme';
import { fonts } from '../../theme/tokens';
import { useHover } from '../../utils/useHover';
import { AccountMenu } from './AccountMenu';

interface HeaderProps {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export function Header({ theme, toggleTheme }: HeaderProps) {
  return (
    <header
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: '1px solid rgba(var(--ink-rgb), 0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent-text)',
            color: '#0B0E13',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.heading,
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          W
        </span>
        <span style={{ fontFamily: fonts.heading, fontSize: 18, letterSpacing: 0.2 }}>Wikigen</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <AccountMenu />
      </div>
    </header>
  );
}

function ThemeToggle({ theme, toggleTheme }: HeaderProps) {
  const { isHovered, hoverProps } = useHover();
  return (
    <button
      onClick={toggleTheme}
      {...hoverProps}
      aria-label="테마 전환"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '1px solid rgba(var(--ink-rgb), 0.12)',
        background: isHovered ? 'rgba(var(--ink-rgb), 0.06)' : 'transparent',
        color: 'var(--text)',
        fontSize: 14,
      }}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
