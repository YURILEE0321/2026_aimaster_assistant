export function FlagBanner({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;
  return (
    <div
      style={{
        marginBottom: 20,
        padding: '12px 16px',
        borderRadius: 10,
        background: 'rgba(178,90,62,0.12)',
        color: '#E08A6C',
      }}
    >
      <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600 }}>확인이 필요해요</p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
        {flags.map((flag, i) => (
          <li key={i}>⚠ {flag}</li>
        ))}
      </ul>
    </div>
  );
}
