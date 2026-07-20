# Assistant

Wiki 질의응답 서비스 (FastAPI + LangGraph). `wiki-assistant-py`의 구현으로 교체됨 — 9노드 파이프라인
(Input Guardrail → Question Analyzer(Entity Extraction 포함) → Query Optimizer → AI Wiki Retriever →
Document Reranker → Context Builder → Confidence Checker(RAGAS 기반) → Answer Generator), 신뢰도 미달 시
최대 3회 자동 재시도(Query Rewriting → Query Expansion → Multi Query Retrieval)를 수행한다.

API 계약(`POST /assistant/v1/chat`, `{space_id, question, history} -> {answer, sources}`)은 기존과
동일해서 backend-proxy/frontend는 코드 변경 없이 그대로 쓴다.

## 실행 방법

1. 가상환경 활성화 (저장소 루트에 `.venv` 존재)

   ```bash
   source ../.venv/bin/activate
   ```

2. 의존성 설치

   ```bash
   pip install -r requirements.txt
   ```

3. `.env` 값 채우기 (`assistant/.env.example` 참고)

   - `PROXY_DATABASE_URL`은 `backend-proxy/.env`의 `DATABASE_URL`과 같은 값을 쓴다(같은 Postgres,
     `documents`/`wikimd` 테이블을 읽기 전용으로 조회).
   - `QDRANT_URL`/`QDRANT_API_KEY`는 Builder가 `wiki_summary`/`wiki_chunk`를 적재해둔 클러스터를 가리켜야 한다.
   - `LLM_PROVIDER`(`gemini` 또는 `azure`)에 맞는 키를 채운다.

4. 서버 실행 (localhost:8001)

   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

5. 확인: http://localhost:8001/docs (Swagger UI)

## 구조

- `app/` — FastAPI 계층(`main.py`, `api/`, `schemas/`, `services/`, `core/`). `/api/v1/chat`(자체
  Qdrant 컬렉션 `ai_wiki_chunks` 기반)과 `/assistant/v1/chat`(space 기반, backend-proxy 데이터 기반)
  두 라우트를 함께 노출한다.
- `src/` — LangGraph 파이프라인 본체(`graph.py`, `nodes/`, `clients/`, `state.py`, `config.py`).
  `app/services/*.py`가 `src.graph.build_graph()`를 호출해 그래프를 실행한다.

## 데이터 조회 (space 기반 격리)

- 매 요청마다 `space_id`로 `documents` 테이블에서 승인된(`status='approved'`) 문서의 `wiki_doc_id`
  목록을 조회해 Qdrant 검색 필터(allow-list)로 쓴다(`src/clients/proxy_db.py::get_allowed_documents`,
  기존 assistant `_allowed_documents`와 동일한 SQLAlchemy ORM 쿼리).
- Qdrant `wiki_summary`/`wiki_chunk` 검색(`src/clients/proxy_qdrant.py`, 기존
  `app/clients/vectordb.py`와 동일한 필터/반환 형태)으로 관련 `doc_id`를 찾고, 본문은
  `wikimd` 테이블에서 조회한다(`get_wikimd_bodies`, 기존 `build_context`와 동일 대상).
- Assistant는 Qdrant/Postgres 모두 읽기 전용으로만 접근한다. 색인(임베딩 생성, Qdrant upsert,
  `wikimd` 저장)은 Builder/backend-proxy가 담당한다.
- 승인된 문서가 없는 space는 그래프를 실행하지 않고 고정 문구로 즉시 응답한다
  (`app/services/proxy_chat_service.py`).

## Input Guardrail

파이프라인 최초 진입점(START 직후, Question Analyzer보다 앞)에서 5가지를 순서대로 검사하고, 하나라도
걸리면 이후 노드(LLM 호출 포함)를 전혀 거치지 않고 고정 안내 메시지로 즉시 종료한다(`src/nodes/guardrail.py`,
`src/lib/guardrail.py`).

- Prompt Injection	시스템 프롬프트 노출·무시 지시 방지	
- Domain Check	플랫폼과 무관한 질문 차단	
- Permission Check	권한이 필요한 정보 요청 차단	
- Input Validation	과도하게 긴 입력, 비정상 포맷 차단	수십 MB의 텍스트, 깨진 문자열
- PII Detection 개인정보 포함 여부 확인


- 정규식 기반(무료, LLM 호출 없음): 입력 검증(길이 초과/제어 문자/인코딩 손상), 프롬프트 인젝션 패턴,
  PII(주민등록번호/이메일/휴대폰번호/신용카드번호) 탐지
- LLM 판단 1회(의미 판단 필요): Domain Check + Permission Check를 함께 처리
  - proxy 경로(`space_id` 있음)는 space마다 도메인이 전혀 다르므로, 그 space에 실제 승인된 문서
    제목 목록을 근거로 판단(`build_guardrail_proxy_prompt`)
- 재시도 루프(Query Rewriter → Question Analyzer)에는 다시 통과시키지 않는다(재작성된 질문은 사용자
  원문이 아니라 시스템이 만든 신뢰된 텍스트이기 때문).

## 로깅

`src/lib/logger.py`(`LOG_LEVEL` 환경변수로 레벨 조정, 기본 `INFO`)를 통해 모든 노드가 시작/종료 및 주요
중간 결과(검색 히트 수, 재랭킹 점수, confidence 지표, 재작성된 질의 등)를 구조화된 로그로 남긴다.

## proxy 경로 전용 튜닝

- **Confidence 가중치**: proxy 경로는 문서 전체를 통째로 임베딩(`wiki_summary`/`wiki_chunk`)하기 때문에
  큰 문서의 특정 단락만 물어보면 similarity_score가 구조적으로 낮게 나온다. 이에 own은 기존대로
  similarity 0.4 / RAGAS 0.6을 유지하고, proxy는 RAGAS 쪽을 더 신뢰하도록 similarity 0.2 / RAGAS 0.8로
  조정했다(`src/nodes/confidence_checker.py`).


## 참고

- `/api/v1/chat`(우리 자체 `ai_wiki_chunks` 컬렉션 기반, `space_id` 없이 호출)과
  `/assistant/v1/chat`(space 기반)은 같은 LangGraph 파이프라인을 공유하며
  `src/nodes/wiki_retriever.py`가 `space_id` 유무로 두 데이터 소스를 분기한다.
- Neon처럼 풀링 커넥션이 접속 문자열의 `search_path` 옵션을 지원하지 않는 환경에서는
  `PROXY_DB_SEARCH_PATH`(예: `wikidb,public`)로 커넥션 직후 `SET search_path`를 실행한다
  (`src/clients/proxy_models.py`).


## assistant 플로우
### 플로우

```
START
  │
  ▼
Input Guardrail        (Prompt Injection / Domain Check / Permission Check / Input Validation / PII Detection)
  │
  ├── 차단 시 ──────────────────────────► END (사유별 고정 안내 메시지, 이후 노드 전혀 안 거침)
  │
  ▼
Conversation History (최근 5턴)   ← history[-(5*2):], 1턴 = 사용자+어시스턴트 한 쌍
  │
  ▼
Question Analyzer      (Intent Classification + Entity Extraction + Keyword Extraction)
  │
  ▼
Query Optimizer         (검색 질의 생성, 결정론적/LLM 호출 없음)
  │
  ▼
AI Wiki Retriever       (Qdrant 벡터 검색, approval_status=approved 필터)
  │
  ▼
Document Reranker       (벡터 유사도 65% + 개체명 일치 15% + 키워드 일치 10% + 최신성 10%)
  │
  ▼
Context Builder         (컨텍스트 문자열 조립, LLM 호출 없음 — Confidence Checker가 RAGAS 평가에 필요)
  │
  ▼
Confidence Checker      ← Similarity Score + RAGAS(Context Precision/Recall) 가중 평균 (답변 생성 전에 확인)
  │
  ├── confidence ≥ 0.7 ─────────────► Answer Generator → END (최종 답변, Faithfulness/Answer Relevancy 참고 평가)
  │
  └── confidence < 0.7
        │
        retry_count += 1
        │
        ├── retry_count ≤ 3 ──► Query Rewriter ──► Question Analyzer (루프)
        │
        └── retry_count > 3 ──► END ("담당자 문의" 고정 안내, 답변 생성 없음)
```