Architecture

1. 개요

본 시스템은 사용자가 Frontend를 통해 서비스를 이용하고, Frontend의 요청을 Proxy Backend가 받아 필요한 내부 서비스로 전달하는 구조로 구성한다.

현재 주요 서비스 구성은 다음과 같다.

User
  │
  ▼
Frontend
localhost:3000
  │
  ▼
Proxy Backend
localhost:8000
  │
  ▼
Builder Backend
localhost:8002

2. 구성 요소

2.1 Frontend

* 주소: http://localhost:3000
* 역할:
    * 사용자 로그인 및 화면 제공
    * Knowledge Space 관리
    * 문서 업로드 및 조회
    * Wiki 생성 요청
    * Builder 처리 결과 조회
* 모든 Backend API 요청은 직접 Builder를 호출하지 않고 Proxy Backend를 통해 호출한다.

2.2 Proxy Backend

* 주소: http://localhost:8000
* 역할:
    * Frontend의 단일 Backend 진입점
    * 사용자 인증 및 사용자 정보 처리
    * Knowledge Space 등 서비스 자체 데이터 관리
    * Builder API 호출 및 응답 전달
    * Frontend와 내부 Backend 서비스 간 인터페이스 통합

Proxy Backend는 Builder의 API 구조를 Frontend에 직접 노출하지 않는다.

예시:

Frontend
POST /api/knowledge-spaces/1/documents/10/analyze
        │
        ▼
Proxy Backend
        │
        ▼
Builder
POST /builderapi/v1/ingest

2.3 Builder Backend

* 주소: http://localhost:8002
* 역할:
    * 업로드 문서 분석
    * 문서 유형 분류
    * 주요 지식 정보 추출
    * Wiki 초안 생성
    * Embedding 생성
    * Vector DB 저장 및 갱신

Builder는 AI Wiki 생성과 관련된 기능에 집중하며, Frontend에서 직접 호출하지 않는다.

3. 요청 흐름

3.1 사용자 로그인

1. 사용자가 Frontend에 접속한다.
2. Frontend에서 로그인을 수행한다.
3. Frontend는 인증 정보를 포함하여 Proxy Backend를 호출한다.
4. Proxy Backend는 인증된 사용자 정보를 기준으로 요청을 처리한다.
User
  │
  │ Login
  ▼
Frontend :3000
  │
  │ Authenticated API Request
  ▼
Proxy Backend :8000

3.2 Wiki 생성 요청

1. 사용자가 Frontend에서 문서를 등록한다.
2. Frontend가 Proxy Backend로 문서 분석을 요청한다.
3. Proxy Backend는 Knowledge Space 및 문서 정보를 확인한다.
4. Proxy Backend가 Builder API를 호출한다.
5. Builder가 AI 문서 분석 및 Wiki 생성을 수행한다.
6. Builder의 처리 결과를 Proxy Backend로 반환한다.
7. Proxy Backend가 Frontend에 최종 응답을 반환한다.
User
  │
  ▼
Frontend :3000
  │
  │ Wiki 생성 요청
  ▼
Proxy Backend :8000
  │
  │ Builder API 호출
  ▼
Builder :8002
  │
  │ AI 분석 / Wiki 생성
  ▼
Proxy Backend :8000
  │
  ▼
Frontend :3000

4. 설계 원칙

단일 Backend 진입점

Frontend는 Proxy Backend만 호출한다.

Frontend → Proxy Backend

다음과 같은 직접 호출은 사용하지 않는다.

Frontend → Builder

이를 통해 Frontend가 내부 서비스 구조에 의존하지 않도록 한다.

역할 분리

Frontend
- UI
- 사용자 인터랙션
Proxy Backend
- 인증
- 서비스 API
- Knowledge Space 관리
- Builder 연계
Builder
- AI 문서 분석
- Wiki 생성
- Embedding
- Vector DB 연계

내부 서비스 캡슐화

Builder의 API 주소와 내부 구현은 Proxy Backend 내부에서 관리한다.

예를 들어 환경변수로 관리한다.

BUILDER_API_URL=http://localhost:8002

Proxy Backend에서는 다음과 같이 Builder를 호출한다.

${BUILDER_API_URL}/builderapi/v1/ingest

5. 전체 아키텍처

┌─────────────────┐
│      User       │
└────────┬────────┘
         │
         │ Login / UI
         ▼
┌─────────────────────────┐
│        Frontend         │
│     localhost:3000      │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│     Proxy Backend       │
│     localhost:8000      │
│                        │
│ - Authentication       │
│ - Knowledge Space      │
│ - Document Management  │
│ - Builder API Proxy    │
└────────────┬────────────┘
             │
             │ Internal API
             ▼
┌─────────────────────────┐
│     Builder Backend     │
│     localhost:8002      │
│                        │
│ - Document Analysis    │
│ - AI Wiki Generation   │
│ - Embedding            │
│ - Vector DB Integration│
└─────────────────────────┘

6. 포트 구성

Component	Port	URL
Frontend	3000	http://localhost:3000
Proxy Backend	8000	http://localhost:8000
Builder Backend	8002	http://localhost:8002

7. 핵심 호출 규칙

User
→ Frontend
→ Proxy Backend
→ Builder

Frontend는 Proxy Backend만 호출하며, Builder는 내부 서비스로 취급한다.

이 구조를 통해 향후 Builder 교체, API 변경, 인증 및 권한 처리 추가 시 Frontend 변경을 최소화한다.