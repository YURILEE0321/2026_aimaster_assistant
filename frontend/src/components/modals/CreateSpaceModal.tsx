import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAppState } from '../../state/AppState';
import { fonts, radii, shadows, surface } from '../../theme/tokens';
import { useHover } from '../../utils/useHover';

export function CreateSpaceModal() {
  const { createSpaceStep, createdSpace, closeCreateSpaceModal, submitCreateSpace, goToUploadAfterCreate } =
    useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitCreateSpace(name, description);
    setSubmitting(false);
    if (!result.ok) setError(result.message);
  }

  return (
    <div
      onClick={closeCreateSpaceModal}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'dimIn 0.25s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: '92vw',
          background: surface.background,
          color: surface.text,
          borderRadius: radii.lg,
          padding: 28,
          boxShadow: shadows.modal,
          animation: 'scaleIn 0.25s ease',
        }}
      >
        {createSpaceStep === 'form' ? (
          <>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, opacity: 0.55 }}>
              새 KNOWLEDGE SPACE
            </span>
            <h2 style={{ fontFamily: fonts.heading, fontWeight: 500, fontSize: 25, margin: '6px 0 20px' }}>
              Space 만들기
            </h2>

            <label style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.75 }}>이름</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="예: 백엔드 아키텍처 문서"
              style={{
                display: 'block',
                width: '100%',
                marginTop: 6,
                marginBottom: error ? 6 : 16,
                padding: '10px 12px',
                borderRadius: radii.sm,
                border: error ? '1px solid #B25A3E' : '1px solid rgba(24,27,20,0.16)',
                background: '#fff',
                fontSize: 14,
              }}
            />
            {error && (
              <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#B25A3E' }}>{error}</p>
            )}

            <label style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.75 }}>설명 (선택)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="한 줄 설명"
              style={{
                display: 'block',
                width: '100%',
                marginTop: 6,
                marginBottom: 22,
                padding: '10px 12px',
                borderRadius: radii.sm,
                border: '1px solid rgba(24,27,20,0.16)',
                background: '#fff',
                fontSize: 14,
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <ModalButton variant="ghost" onClick={closeCreateSpaceModal}>
                취소
              </ModalButton>
              <ModalButton variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '생성 중...' : 'Space 생성'}
              </ModalButton>
            </div>
          </>
        ) : (
          createdSpace && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#181B14',
                  color: '#F6F3EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  margin: '0 auto 16px',
                }}
              >
                ✓
              </div>
              <h2 style={{ fontFamily: fonts.heading, fontWeight: 500, fontSize: 22, margin: '0 0 14px' }}>
                {createdSpace.name} 생성 완료
              </h2>
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  padding: '5px 12px',
                  borderRadius: radii.pill,
                  background: 'rgba(24,27,20,0.08)',
                  marginBottom: 22,
                }}
              >
                {createdSpace.space_id}
              </span>
              <ModalButton variant="primary" onClick={goToUploadAfterCreate} fullWidth>
                문서 등록하러 가기 →
              </ModalButton>
            </div>
          )
        )}
      </div>
      <style>{`
        @keyframes dimIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function ModalButton({
  children,
  onClick,
  variant,
  disabled,
  fullWidth,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: 'primary' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const { isHovered, hoverProps } = useHover();
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...hoverProps}
      style={{
        flex: fullWidth ? undefined : 1,
        width: fullWidth ? '100%' : undefined,
        padding: '11px 16px',
        borderRadius: radii.sm,
        border: isPrimary ? 'none' : '1px solid rgba(24,27,20,0.16)',
        background: isPrimary ? (isHovered ? '#ff9a56' : '#FF8A3D') : isHovered ? 'rgba(24,27,20,0.05)' : 'transparent',
        color: isPrimary ? '#0B0E13' : '#181B14',
        fontSize: 14,
        fontWeight: 600,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
