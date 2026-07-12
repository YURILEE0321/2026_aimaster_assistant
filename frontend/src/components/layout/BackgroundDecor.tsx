export function BackgroundDecor() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-8%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,138,61,0.16), transparent 70%)',
          animation: 'drift 20s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,138,255,0.14), transparent 70%)',
          animation: 'drift 22s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(var(--ink-rgb), 0.12) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.5,
        }}
      />
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(24px, -16px); }
        }
      `}</style>
    </div>
  );
}
