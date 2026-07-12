Tech Stack

Backend

구분	기술	용도
Language	Python	Backend 개발
API Framework	FastAPI	REST API 개발
ASGI Server	Uvicorn	FastAPI 애플리케이션 실행
ORM / DB Access	SQLAlchemy	Database 연결 및 데이터 처리
Database	PostgreSQL	서비스 데이터 저장

Development Policy

* PoC 구현 속도와 단순성을 우선한다.
* 불필요한 프레임워크와 라이브러리는 추가하지 않는다.
* API는 FastAPI 기반으로 구현한다.
* 애플리케이션 실행은 Uvicorn을 사용한다.
* Database 연결 및 처리는 SQLAlchemy를 사용한다.
* Database는 PostgreSQL을 사용한다.
* 복잡한 계층 구조나 분산 아키텍처는 적용하지 않는다.

Basic Structure

app/
├── main.py
├── models.py
├── schemas.py
├── database.py
└── routers/

* main.py: FastAPI 애플리케이션 실행
* database.py: Database 연결 설정
* models.py: Database 모델
* schemas.py: Request / Response 모델
* routers/: API Endpoint