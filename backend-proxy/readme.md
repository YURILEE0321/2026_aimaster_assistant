# Backend Proxy

Knowledge Space API (FastAPI + SQLAlchemy + PostgreSQL). 명세: [../docs/api-spec.md](../docs/api-spec.md)

## 실행 방법

1. 가상환경 활성화 (저장소 루트에 `.venv` 존재)

   ```bash
   source ../.venv/bin/activate
   ```

2. 의존성 설치

   ```bash
   pip install -r requirements.txt
   ```

3. `.env` 작성 (`backend-proxy/.env`)

   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
   ```

4. 서버 실행 (localhost:8000)

   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. 확인: http://localhost:8000/docs (Swagger UI)

서버 시작 시 테이블 자동 생성(`create_all`) 및 데모 사용자(`usr_hong`, `usr_lee`) 시딩이 수행됩니다.
