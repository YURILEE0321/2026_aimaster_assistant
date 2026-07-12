import { useEffect } from 'react';
import { useAppState } from '../../../state/AppState';
import { ChatPanel } from '../../chat/ChatPanel';

export function ChatTab({ approvedCount }: { approvedCount: number }) {
  const { activeSpaceId, activeSpaceData, loadChatMessages, sendChatMessage, isChatSending } = useAppState();

  useEffect(() => {
    if (activeSpaceId) loadChatMessages(activeSpaceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpaceId]);

  const hasApproved = approvedCount > 0;

  function titleForDocument(documentId: string): string {
    return activeSpaceData.documents.find((d) => d.document_id === documentId)?.title ?? documentId;
  }

  return (
    <div>
      {!hasApproved && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(178,90,62,0.12)',
            color: '#E08A6C',
            fontSize: 13,
          }}
        >
          ⚠ 아직 승인된 문서가 없어서 질문할 수 없어요. 문서를 검토하고 승인해주세요.
        </div>
      )}
      <ChatPanel
        messages={activeSpaceData.chatMessages}
        titleForDocument={titleForDocument}
        isSending={isChatSending}
        onSend={sendChatMessage}
        disabled={!hasApproved}
      />
    </div>
  );
}
