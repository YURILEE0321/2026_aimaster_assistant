# Assistant

Wiki 질의응답 서비스 (FastAPI + LangGraph). 명세: [../docs/prd-assistant.md](../docs/prd-assistant.md)

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

   - `DATABASE_URL`은 `backend-proxy/.env`와 같은 값을 공유한다(같은 Postgres, `WikiMd`/`Document` 테이블을 읽기 전용으로 조회).
   - `QDRANT_URL`/`QDRANT_API_KEY`, `OPENAI_API_KEY`/`OPENAI_BASE_URL`은 아직 비어 있다. 채우기 전에는 `/assistant/v1/answer`가 `QDRANT_UNAVAILABLE`/`LLM_API_ERROR`를 반환한다.

4. 서버 실행 (localhost:8001)

   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

5. 확인: http://localhost:8001/docs (Swagger UI)

## 참고

- Assistant는 Qdrant/Postgres 모두 읽기 전용으로만 접근한다. 색인(임베딩 생성, Qdrant upsert, `WikiMd` 저장)은 Builder/backend-proxy가 담당한다.
- Space 격리는 Qdrant payload의 `space_id`가 아니라, 매 요청마다 Postgres에서 `space_id`로 승인된 문서의 `wiki_doc_id` 목록을 조회해 Qdrant 검색 필터(allow-list)로 사용하는 방식으로 구현했다 — 실제 Qdrant payload에는 `space_id` 필드가 없다(`docs/prd-assistant.md` 13장 Open Questions 확인 결과).
- `MIN_SCORE`(기본 0.2)는 "관련 문서를 못 찾음"으로 판단하는 임계값이다. 실제 Qdrant 데이터의 점수 분포를 보고 조정이 필요하다.
- `backend-proxy/app/routers/chat.py`를 이 서비스 호출로 연동하는 작업(PRD 9장)은 아직 하지 않았다.
