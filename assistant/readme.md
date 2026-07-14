# Assistant

Wiki 질의응답 서비스 (FastAPI + LangGraph). `wiki-assistant-py`의 구현으로 교체됨 — 8노드 파이프라인
(Question Analyzer(Entity Extraction 포함) → Query Optimizer → AI Wiki Retriever → Document Reranker
→ Context Builder → Confidence Checker(RAGAS 기반) → Answer Generator), 신뢰도 미달 시 최대 3회
자동 재시도(Query Rewriting → Query Expansion → Multi Query Retrieval)를 수행한다.

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

## 참고

- `/api/v1/chat`(우리 자체 `ai_wiki_chunks` 컬렉션 기반, `space_id` 없이 호출)과
  `/assistant/v1/chat`(space 기반)은 같은 LangGraph 파이프라인을 공유하며
  `src/nodes/wiki_retriever.py`가 `space_id` 유무로 두 데이터 소스를 분기한다.
- Neon처럼 풀링 커넥션이 접속 문자열의 `search_path` 옵션을 지원하지 않는 환경에서는
  `PROXY_DB_SEARCH_PATH`(예: `wikidb,public`)로 커넥션 직후 `SET search_path`를 실행한다
  (`src/clients/proxy_models.py`).
