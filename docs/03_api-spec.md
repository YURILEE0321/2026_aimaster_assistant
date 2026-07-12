# API 명세 — Knowledge Space 생성

프로토타입은 클라이언트 상태(in-memory)로 동작한다. 이 문서는 과제 구현을 위해 필요한 백엔드 API를 프로토타입의 데이터/흐름을 기준으로 설계한 명세다.

## 0. 공통사항
- Base URL: `/api/v1`
- 인증: `Authorization: Bearer {token}`. 데모 범위에서는 실제 로그인/비밀번호 없이, 고정된 사용자 목록 중 하나로 전환(스위치)하는 것으로 로그인을 대신한다. 상세는 2장 참고.
- 응답 포맷: JSON. 에러 포맷:
```json
{ "error": { "code": "STRING_CODE", "message": "사용자 노출용 메시지" } }
```
- 날짜/시간: ISO 8601 UTC (`2026-07-12T05:30:00Z`), 표시는 클라이언트에서 `ko-KR` 로케일로 변환.
- 페이지네이션: `?page=1&size=20` → `{ items, page, size, total }`

## 1. 리소스 모델

### User (데모 고정 사용자)
```json
{
  "user_id": "usr_hong",
  "name": "홍길동"
}
```
데모 시드 사용자: `usr_hong`(홍길동), `usr_lee`(이유리). 신규 가입/사용자 생성 API는 없음(고정 목록).

### Space
```json
{
  "space_id": "spc_ab12cd34ef",
  "name": "백엔드 아키텍처 문서",
  "description": "백엔드 팀 기술 문서 모음",
  "owner_id": "usr_hong",
  "file_count": 2,
  "document_count": 3,
  "approved_count": 1,
  "created_at": "2026-07-12T05:00:00Z"
}
```
`file_count`/`document_count`/`approved_count`는 저장 필드가 아니라 응답 생성 시 `files`/`documents` 테이블을 `space_id` 기준으로 집계(`COUNT` + `GROUP BY`)한 계산값이다. 업로드/삭제/승인/반려 등 이벤트마다 카운터를 직접 증감시키지 않는다(동기화 누락으로 실제 값과 어긋날 위험 방지).

### File (업로드 원본)
```json
{
  "file_id": "file_001",
  "space_id": "spc_ab12cd34ef",
  "name": "schema.sqlite",
  "size_bytes": 204800,
  "status": "analyzing", // idle | analyzing | done | analysis_failed | upload_failed
  "step_index": 3,
  "step_message": "핵심 내용과 키워드를 뽑아내는 중이에요",
  "created_at": "2026-07-12T05:01:00Z"
}
```

### Document (분석/위키 문서)
```json
{
  "document_id": "doc_101",
  "file_id": "file_001",
  "space_id": "spc_ab12cd34ef",
  "title": "users 테이블",
  "status": "approved", // pending | approved | rejected
  "version": 1,
  "reject_reason": null,
  "flags": ["출처 페이지 번호가 누락됐어요"],
  "sections": [
    { "type": "text", "heading": "요약", "paragraphs": ["..."] },
    { "type": "tags", "heading": "핵심 키워드", "tags": ["사용자", "인증"] },
    { "type": "table", "heading": "컬럼 구조", "columns": ["컬럼명","타입","설명"], "rows": [{"a":"id","b":"INTEGER","c":"기본 키"}] }
  ],
  "related_document_ids": ["doc_102", "doc_103"],
  "history": [
    { "label": "문서 생성됨 (분석 완료)", "time": "2026-07-12T05:02:00Z" },
    { "label": "v1로 승인됨", "time": "2026-07-12T05:10:00Z" }
  ]
}
```

### ChatMessage
```json
{
  "message_id": "msg_1",
  "space_id": "spc_ab12cd34ef",
  "role": "assistant", // user | assistant
  "text": "orders 테이블의 total_price는 REAL 타입입니다.",
  "source_document_ids": ["doc_102"],
  "created_at": "2026-07-12T05:20:00Z"
}
```

## 2. 인증 API (데모 사용자 스위치)
실제 로그인 화면/비밀번호 없이, 우측 상단 계정 메뉴에서 고정 사용자 목록 중 하나를 선택해 세션을 전환한다. 토큰은 데모 범위에서 `user_id`를 그대로 담은 불투명 문자열이며(예: `demo.usr_hong`), 서버는 이를 검증 없이 `user_id`로 디코딩해 사용한다.

### `GET /auth/users` — 전환 가능한 사용자 목록
응답: `200 { items: [User, ...] }`

### `POST /auth/switch` — 사용자 전환(로그인)
요청: `{ "user_id": "usr_lee" }`
- `user_id`가 시드 목록에 없으면 404 `AUTH_USER_NOT_FOUND`.
응답: `200 { token, user }`
- 프론트는 응답받은 `token`을 이후 모든 요청의 `Authorization: Bearer {token}`에 실어 보낸다.

### `GET /auth/me` — 현재 세션 사용자 조회
- 앱 최초 진입 시 저장된 토큰으로 세션 복원(자동 로그인)에 사용. 토큰이 없거나 무효하면 401 `UNAUTHORIZED` → 프론트는 기본 사용자(`usr_hong`)로 `POST /auth/switch`를 호출해 세션을 시작한다.
응답: `200 { user }`

## 3. Space API

### `POST /spaces` — Space 생성
요청: `{ "name": "백엔드 아키텍처 문서", "description": "선택 항목" }`
- `name` 필수, 1자 이상. 미입력 시 400.
응답: `201 { space }` (space_id 서버 발급)

### `GET /spaces` — Space 목록
응답: `200 { items: [Space, ...] }` (사이드바 렌더용, `file_count`/`approved_count` 포함)

### `GET /spaces/{space_id}` — Space 상세

### `DELETE /spaces/{space_id}` — Space 삭제 (전체 초기화용, 데모 편의 기능이면 `DELETE /spaces` 전체 삭제도 고려)

## 4. 파일 업로드 & 분석 API

### `POST /spaces/{space_id}/files` — 파일 업로드
요청: `multipart/form-data`, 필드 `files[]` (다중 첨부)
- 서버는 확장자 검증(pdf/docx/doc/txt/md/db/sqlite/sqlite3) 후 미지원 포맷은 `status: upload_failed`로 즉시 반환.
응답: `201 { items: [File, ...] }`

### `POST /files/{file_id}/analyze` — 분석 시작
- 비동기 작업 큐에 등록. 즉시 `202 { file_id, status: "analyzing" }` 반환.
- 진행 상태는 폴링(`GET /files/{file_id}`) 또는 SSE/WebSocket(`/files/{file_id}/stream`)으로 전달 — 단계 메시지(`step_index`, `step_message`) 갱신.
- 완료 시 `status: done` + 연관 `Document` N개 생성(SQLite는 테이블당 1문서).
- 실패 시 `status: analysis_failed`.

### `POST /files/{file_id}/retry` — 재분석 (analyze와 동일 동작, 실패 상태에서만 허용)

### `DELETE /files/{file_id}` — 파일/진행중 분석 취소 및 삭제

### `GET /spaces/{space_id}/files` — Space 내 파일 목록 (문서 포함 or 별도 조회)

## 5. 문서(검토/위키) API

### `GET /documents/{document_id}` — 문서 상세 (검토 화면 데이터)

### `GET /spaces/{space_id}/documents?status=approved` — 위키/검토 대기 목록 조회
- `status` 쿼리로 pending/approved/rejected 필터.

### `POST /documents/{document_id}/approve` — 승인
- 서버에서 `version += 1`, `status: approved`, `history`에 항목 추가.
응답: `200 { document }`

### `POST /documents/{document_id}/reject` — 반려
요청: `{ "reason": "컬럼 설명이 부정확함" }` (미입력 시 서버가 "사유 미입력"으로 저장)
응답: `200 { document }`

### `POST /documents/{document_id}/reopen` — 반려 문서를 재검토 대기로 전환
응답: `200 { document }` (`status: pending`)

## 6. 질문하기 (Q&A) API

### `POST /spaces/{space_id}/chat/messages`
요청: `{ "text": "orders 테이블의 결제 금액 컬럼은 어떤 타입이야?" }`
동작:
1. 유저 메시지 저장.
2. Space 내 `status=approved` 문서 전체를 컨텍스트로 구성.
3. 승인 문서가 0건이면 고정 안내 응답으로 즉시 반환(LLM 호출 생략).
4. 승인 문서가 있으면 LLM 호출 → 답변 생성, 근거 문서 ID 목록 첨부.
응답: `200 { user_message, assistant_message }`
- 스트리밍이 필요하면 `POST .../messages/stream` (SSE)로 토큰 단위 전달 고려.

### `GET /spaces/{space_id}/chat/messages` — 대화 이력 조회

## 7. 에러 코드 (예시)
| code | 상황 |
|---|---|
| `AUTH_USER_NOT_FOUND` | 존재하지 않는 `user_id`로 전환 시도 |
| `UNAUTHORIZED` | 토큰 누락/무효 |
| `SPACE_NAME_REQUIRED` | Space 이름 미입력 |
| `UNSUPPORTED_FILE_TYPE` | 지원하지 않는 확장자 |
| `FILE_NOT_ANALYZABLE` | idle이 아닌 파일에 analyze 요청 |
| `DOCUMENT_NOT_PENDING` | pending이 아닌 문서에 approve/reject 요청 |
| `NO_APPROVED_DOCUMENTS` | 승인 문서 없이 chat 요청 (안내 응답으로 처리, 에러 아님) |

## 8. 비동기 분석 처리 참고
- 분석 단계 메시지(`ANALYSIS_STEPS`)는 프로토타입에서 7단계 고정 문구를 순차 노출한다. 백엔드는 실제 파이프라인 단계(파싱→추출→요약→키워드→연관문서탐색→검증→마무리)에 맞춰 동일 개수/문구 또는 유사한 단계를 `step_index`로 매핑해 전달한다.
- 실패율(프로토타입은 데모용 15% 랜덤 실패)은 실제 구현에서는 실제 파싱/LLM 오류로 대체된다.
