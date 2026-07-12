import { useAppState } from '../../state/AppState';
import { fonts } from '../../theme/tokens';

export function EmptyState() {
  const { openCreateSpaceModal } = useAppState();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
        gap: 16,
        animation: 'fadeUp 0.5s ease',
      }}
    >
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 12,
          letterSpacing: 2,
          color: 'var(--accent-text)',
        }}
      >
        KNOWLEDGE SPACE
      </span>
      <h1
        style={{
          fontFamily: fonts.heading,
          fontWeight: 500,
          fontSize: 52,
          margin: 0,
          maxWidth: 640,
        }}
      >
        아직 만들어진 space가 없습니다
      </h1>
      <p style={{ maxWidth: 480, opacity: 0.7, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        문서를 업로드하면 AI가 자동으로 위키를 만들어줘요. 새 Space를 만들고 첫 문서를 등록해보세요.
      </p>
      <button
        onClick={openCreateSpaceModal}
        style={{
          marginTop: 12,
          padding: '13px 28px',
          borderRadius: 999,
          border: 'none',
          background: '#FF8A3D',
          color: '#0B0E13',
          fontSize: 15,
          fontWeight: 600,
          animation: 'pulseRing 2.4s infinite',
        }}
      >
        ＋ 새 Space 만들기
      </button>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(255,138,61,0.45); }
          70% { box-shadow: 0 0 0 14px rgba(255,138,61,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,138,61,0); }
        }
      `}</style>
    </div>
  );
}
