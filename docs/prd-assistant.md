# PRD — Assistant (Wiki 질의응답 서비스)

## 1. 배경 및 목적
현재 시스템은 Frontend(3000) → Proxy Backend(8000) → Builder Backend(8002)로 이어지는 구조로, Builder가 문서 분석과 Wiki 생성, Embedding, Vector DB(Qdrant) 저장까지 담당한다. 문서가 승인(approve)되면 Builder가 `wiki_summary`, `wiki_chunk` 컬렉션에 벡터를 upsert한다([비동기개선.md](../docs/비동기개선.md), [todo.md](../docs/todo.md) `logic 0712-005/006` 참고).

반면 자연어 질의응답(Q&A) 기능은 아직 실제 구현이 없다. 현재 `backend-proxy`의 `POST /spaces/{space_id}/chat/messages`는 승인 문서가 있어도 `"답변 생성 기능은 아직 연동되지 않았어요."`라는 고정 문자열만 반환한다([chat.py](../backend-proxy/app/routers/chat.py)).

본 PRD는 이 빈틈을 채우는 신규 서비스 **Assistant**를 정의한다. Assistant는 LangGraph로 질의응답 파이프라인을 구성하고, FastAPI로 `localhost:8001`에서 서비스한다. 사용자가 특정 Space를 선택해 질문하면, Qdrant의 `wiki_chunk`/`wiki_summary` 컬렉션에서 관련 내용을 검색해 근거 기반 답변을 생성한다.

## 2. 시스템 내 위치 (아키텍처)
기존 [01_architecture.md](../docs/01_architecture.md) 구조에 Assistant를 4번째 컴포넌트로 추가한다. Builder가 "쓰기(색인)"를 담당한다면, Assistant는 "읽기(검색·답변)"를 담당하는 대칭 관계다.

```
User
  │
  ▼
Frontend            localhost:3000
  │
  ▼
Proxy Backend       localhost:8000
  │
  ├─ 문서 분석/Wiki 생성 요청 ──▶ Builder Backend    localhost:8002 ─▶ Qdrant(wiki_chunk, wiki_summary) 색인(upsert)
  │
  └─ 질문하기 요청       ──▶ Assistant Backend  localhost:8001 ─▶ Qdrant(wiki_chunk, wiki_summary) 검색(read-only)
```

- Frontend는 기존과 동일하게 Proxy Backend만 호출한다. Assistant를 직접 호출하지 않는다.
- Proxy Backend가 Assistant의 API 주소를 캡슐화한다(예: 환경변수 `ASSISTANT_API_BASE_URL=http://localhost:8001`, `BUILDER_API_BASE_URL` 관례를 따름).
- Assistant는 Qdrant에 대해 읽기 전용으로 동작하며, 색인(쓰기)은 기존과 동일하게 Builder가 승인 시점에 수행한다. Assistant는 색인 로직을 갖지 않는다.

## 3. 목표
- [02_user-scenarios.md](../docs/02_user-scenarios.md) 시나리오 5(자연어 질문하기)와 [03_api-spec.md](../docs/03_api-spec.md) 6장(질문하기 API)이 요구하는 동작을 실제로 구현한다.
- 사용자가 선택한 Space 범위 내에서만 검색/답변하도록 격리한다(시나리오 6: Space 간 데이터 독립성).
- 승인된 문서 내용(`wiki_summary`, `wiki_chunk`)에 근거한 답변과 출처 문서 목록을 함께 반환한다.
- LangGraph로 검색→컨텍스트 구성→답변 생성 파이프라인을 노드 단위로 구성해, 향후 단계 추가/교체가 쉬운 구조를 유지한다.

## 4. 비목표 (Out of scope)
- Wiki 색인(Embedding 생성, Qdrant upsert)은 Builder의 책임이며 Assistant는 관여하지 않는다.
- 문서 분석, 승인/반려 등 검토 파이프라인은 대상이 아니다([03_api-spec.md](../docs/03_api-spec.md) 4~5장 영역).
- 대화 이력 저장(`ChatMessage` 영속화)은 기존처럼 Proxy Backend(PostgreSQL)가 담당한다. Assistant는 상태를 저장하지 않는 stateless 서비스로 둔다(멀티턴 컨텍스트가 필요하면 요청 시 이력을 함께 전달받는다).
- 인증/세션 처리는 Proxy Backend가 이미 수행하므로 Assistant는 별도 인증을 두지 않는다(내부 서비스로 간주, Builder와 동일한 신뢰 경계).
- 스트리밍(SSE) 응답은 1차 범위에서 제외한다([03_api-spec.md](../docs/03_api-spec.md)에서도 "고려" 수준으로만 언급).

## 5. 핵심 흐름 (시나리오 매핑)
[02_user-scenarios.md](../docs/02_user-scenarios.md) 시나리오 5 기준:

1. 사용자가 "질문하기" 탭에서 질문을 입력해 전송한다.
2. Proxy Backend가 `POST /spaces/{space_id}/chat/messages`에서 사용자 메시지를 저장한다.
3. Space 내 `status=approved` 문서가 0건이면 Assistant를 호출하지 않고 고정 안내 응답(`NO_APPROVED_DOCUMENTS_TEXT`)을 즉시 반환한다(기존 [chat.py](../backend-proxy/app/routers/chat.py) 로직 유지).
4. 승인 문서가 1건 이상이면 Proxy Backend가 Assistant에 답변 생성을 요청한다.
5. Assistant는 LangGraph 파이프라인을 실행해 `space_id` 범위 내 `wiki_summary`/`wiki_chunk`를 검색하고 답변과 출처 문서 ID를 생성해 반환한다.
6. Proxy Backend는 응답을 `assistant` role의 `ChatMessage`로 저장하고 Frontend에 반환한다. Frontend는 출처를 "📘 문서제목" 칩으로 표시한다.

## 6. LangGraph 프로세스 설계
단순성 우선 원칙([tech-stack-backendproxy.md](../docs/tech-stack-backendproxy.md)와 동일한 PoC 정책 적용)에 따라, 불필요한 분기 없이 아래 선형 그래프로 시작한다.

```
START
  │
  ▼
retrieve_summary   wiki_summary 컬렉션에서 space_id 필터 + 질문 임베딩으로 top-K 문서 요약 검색
  │
  ▼
retrieve_chunk      retrieve_summary로 찾은 document_id 범위(또는 독립 검색)로 wiki_chunk에서 관련 청크 검색
  │
  ▼
has_context? ──No──▶ no_context_answer   "관련된 승인 문서를 찾지 못했다" 안내 답변 생성, source 없음
  │Yes
  ▼
build_context       청크/요약 텍스트를 문서 단위로 그룹핑해 LLM 프롬프트 컨텍스트 조립
  │
  ▼
generate_answer     LLM 호출, 컨텍스트에 없는 내용은 추측하지 말라는 지시 포함
  │
  ▼
extract_sources     답변 근거로 실제 인용된 document_id 목록 정리
  │
  ▼
END
```

### State (초안)
| 필드 | 타입 | 설명 |
|---|---|---|
| `space_id` | str | 검색 범위 제한 |
| `question` | str | 사용자 질문 원문 |
| `history` | list[dict] | (선택) 직전 대화 이력, 멀티턴 시 사용 |
| `summary_hits` | list[dict] | wiki_summary 검색 결과 (document_id, title, score, text) |
| `chunk_hits` | list[dict] | wiki_chunk 검색 결과 (document_id, chunk_text, score) |
| `context` | str | LLM에 전달할 조립된 컨텍스트 |
| `answer` | str | 최종 답변 텍스트 |
| `source_document_ids` | list[str] | 답변 근거 문서 ID |

## 7. API 명세

### `POST /assistant/v1/answer`
Proxy Backend가 승인 문서가 있을 때 호출한다.

요청:
```json
{
  "space_id": "spc_ab12cd34ef",
  "question": "orders 테이블의 결제 금액 컬럼은 어떤 타입이야?",
  "history": [
    { "role": "user", "text": "..." },
    { "role": "assistant", "text": "..." }
  ]
}
```

응답: `200`
```json
{
  "answer": "orders 테이블의 total_price는 REAL 타입입니다.",
  "sources": [
    { "document_id": "doc_102", "title": "orders 테이블", "score": 0.83 }
  ]
}
```

- `sources`가 빈 배열이면 근거를 찾지 못했다는 의미이며, Proxy Backend는 `answer` 텍스트를 그대로 노출하되 출처 칩은 표시하지 않는다.
- Assistant는 상태를 저장하지 않으므로 멀티턴이 필요하면 Proxy Backend가 매 요청마다 최근 이력을 `history`로 실어 보낸다(1차 범위에서는 생략 가능 — [03_api-spec.md](../docs/03_api-spec.md) 6장도 단발 질의 기준).

### `GET /health`
Proxy Backend 및 배포 환경에서 헬스체크용으로 사용.

### 에러 응답
[03_api-spec.md](../docs/03_api-spec.md) 0장과 동일한 포맷을 따른다.
```json
{ "error": { "code": "STRING_CODE", "message": "사용자 노출용 메시지" } }
```

| code | 상황 |
|---|---|
| `INVALID_REQUEST` | `space_id`/`question` 누락 |
| `QDRANT_UNAVAILABLE` | Qdrant 연결/쿼리 실패 |
| `LLM_API_ERROR` | LLM 호출 실패 |

## 8. 데이터 소스 (Qdrant)
[vectordb.md](../docs/vectordb.md)는 컬렉션 이름만 정의하고 있어(`wiki_chunk`, `wiki_summary`), payload 스키마는 Builder 쪽 구현을 기준으로 아래와 같이 **가정**한다. 실제 구현 전 Builder 팀과 확인이 필요하다(13장 Open Questions 참고).

| 컬렉션 | 용도 | payload(가정) |
|---|---|---|
| `wiki_summary` | 문서 단위 요약 임베딩. 질문과 관련된 문서를 1차로 좁히는 용도 | `document_id`, `space_id`, `title`, `summary`, `version` |
| `wiki_chunk` | 문서 본문을 chunk 단위로 나눈 임베딩. 답변 근거가 되는 세부 텍스트 검색 용도 | `document_id`, `space_id`, `chunk_index`, `chunk_text`, `section_heading` |

- 모든 검색 쿼리는 Qdrant filter로 `space_id`를 반드시 포함해 Space 간 데이터가 섞이지 않도록 한다(시나리오 6 요구사항).
- 승인 취소/재검토([03_api-spec.md](../docs/03_api-spec.md) `reopen`) 시 Qdrant에서도 해당 문서 벡터가 제거/갱신된다는 전제가 필요하다 — 이 부분도 Builder 쪽 확인 필요(13장).

## 9. Proxy Backend 연동 변경 사항
- `backend-proxy/app/routers/chat.py`의 `assistant_text = "답변 생성 기능은 아직 연동되지 않았어요."` 분기를 Assistant `POST /assistant/v1/answer` 호출로 교체한다.
- `.env`에 `ASSISTANT_API_BASE_URL=http://127.0.0.1:8001` 추가(`builder_API_BASE_URL` 관례를 따름).
- 호출은 사용자가 답변을 기다리는 동기 상호작용이므로(로딩 문구 "위키를 참고해서 답변을 정리하고 있어요…" 표시 후 즉시 응답), Builder ingest처럼 job/callback 비동기 구조([비동기개선.md](../docs/비동기개선.md))로 만들 필요는 없다. 다만 Builder 사례에서 겪은 `httpx.ReadTimeout` 문제를 반복하지 않도록 명시적 timeout을 둔다.

```python
timeout = httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)
```

- Assistant 연결 실패/타임아웃 시 `ASSISTANT_UNAVAILABLE` 에러로 처리하고, Frontend에는 "잠시 후 다시 시도해주세요" 수준의 안내를 노출한다(전체 요청을 500으로 실패시키지 않고 안내 메시지의 `assistant_message`로 저장하는 방식을 우선 검토).

## 10. 기술 스택 / 프로젝트 구조
[tech-stack-backendproxy.md](../docs/tech-stack-backendproxy.md)의 PoC 원칙(단순성 우선, 불필요한 프레임워크 지양, 복잡한 계층 구조 지양)을 그대로 따른다.

| 구분 | 기술 |
|---|---|
| Language | Python |
| Orchestration | LangGraph |
| API Framework | FastAPI |
| ASGI Server | Uvicorn |
| Vector DB Client | qdrant-client |

```
assistant/
├── app/
│   ├── main.py          # FastAPI 앱 실행, /health
│   ├── config.py         # 환경변수 (QDRANT_URL, LLM 관련 키, 컬렉션명 등)
│   ├── schemas.py         # 요청/응답 모델
│   ├── routers/
│   │   └── answer.py      # POST /assistant/v1/answer
│   └── graph/
│       ├── state.py       # LangGraph State 정의
│       ├── nodes.py       # retrieve_summary/retrieve_chunk/build_context/generate_answer/extract_sources
│       └── graph.py       # StateGraph 조립
└── requirements.txt
```

실행: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`

## 11. 성공 기준
- 승인된 문서가 있는 Space에서 관련 질문 시, Qdrant 검색 결과에 근거한 답변과 정확한 출처 문서 칩이 표시된다([test-cases.md](../docs/test-cases.md) TC-5-1).
- 승인된 문서가 없는 Space는 Assistant 호출 없이 고정 안내 응답을 받는다(TC-5-A1, 기존 로직 유지 확인).
- 서로 다른 두 Space에서 같은 질문을 해도 답변 근거가 각 Space의 승인 문서로만 한정된다(시나리오 6 독립성과 정합).
- Assistant 장애 시에도 Proxy Backend/Frontend가 크래시 없이 사용자에게 안내를 표시한다.

## 12. 로그 규칙
[비동기개선.md](../docs/비동기개선.md) 11장과 동일하게, 요청 추적을 위해 모든 로그에 `space_id`와 요청 단위 식별자를 포함한다.
```
[assistant] answer requested space_id=spc_ab12cd34ef
[assistant] summary_hits=3 chunk_hits=8 space_id=spc_ab12cd34ef
[assistant] answer generated space_id=spc_ab12cd34ef sources=2
```

## 13. Open Questions (구현 착수 전 확인 필요)
- `wiki_summary`/`wiki_chunk` payload의 실제 필드명/타입 — Builder(wiki-builder) 프로젝트의 upsert 코드 기준으로 확정 필요(현재 리포지토리에는 Builder 소스가 없어 [vectordb.md](../docs/vectordb.md)만으로는 확인 불가).
- 임베딩 모델 및 LLM Provider 미지정 — 리포지토리 어디에도 명시되어 있지 않음. Builder가 사용 중인 것과 동일한 임베딩 모델을 Assistant도 사용해야 벡터 공간이 일치한다.
- Qdrant 접속 정보(호스트/포트/API Key, 로컬 인스턴스 여부)가 문서화되어 있지 않음.
- 문서 반려/재검토(`reopen`)로 승인이 취소된 경우 Qdrant 벡터가 함께 정리되는지 여부 — 안 되어 있다면 Assistant가 만료된 문서를 근거로 답변할 위험이 있음.
- 멀티턴 대화 지원 범위(1차는 단발 질의로 가정, `history` 필드는 확장 여지로만 남김).
