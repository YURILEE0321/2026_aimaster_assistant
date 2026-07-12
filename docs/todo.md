
# todo - 0712-001
- 진행상태: ing
- backend-proxy에서 analyze 호출 시 http://localhost:8002/builderapi/v1/ingest 를 호출하도록 한다.
- builder_API_BASE_URL 정보를 env에서 관리한다.


# [완료\ error - 0712-002
- 진행상태: 완료
- 업로드 된 파일 옆에 "분석시작" 버튼을 눌렀는데 아래와 같이 에러 및 반복 실행 발생
INFO:     127.0.0.1:51011 - "POST /api/v1/files/file_21b2f29238/analyze HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/uvicorn/protocols/http/httptools_impl.py", line 422, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/uvicorn/middleware/proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/middleware/errors.py", line 186, in __call__
    raise exc
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/middleware/errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/middleware/cors.py", line 96, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/middleware/cors.py", line 154, in simple_response
    await self.app(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/middleware/exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/middleware/asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 2683, in app
    await route.handle(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 1753, in handle
    await self.original_router.handle(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 2738, in handle
    await included_router._handle_selected(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 1773, in _handle_selected
    await original_route.handle(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 1264, in handle
    await app(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 150, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 136, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 690, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 346, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/starlette/concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/anyio/to_thread.py", line 63, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/anyio/_backends/_asyncio.py", line 2596, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/.venv/lib/python3.12/site-packages/anyio/_backends/_asyncio.py", line 1029, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/jbpark/workspace/2026-aimaster-wikigen/backend-proxy/app/routers/files.py", line 266, in analyze_file
    asyncio.create_task(_run_analysis(file.file_id))
  File "/opt/homebrew/Cellar/python@3.12/3.12.10_1/Frameworks/Python.framework/Versions/3.12/lib/python3.12/asyncio/tasks.py", line 417, in create_task
    loop = events.get_running_loop()
           ^^^^^^^^^^^^^^^^^^^^^^^^^
RuntimeError: no running event loop
INFO:     127.0.0.1:51018 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "POST /api/v1/files/file_21b2f29238/analyze HTTP/1.1" 400 Bad Request
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK
INFO:     127.0.0.1:51013 - "GET /api/v1/files/file_6f23ac6bfa HTTP/1.1" 200 OK


원인을 확인했습니다.

근본 원인
backend-proxy/app/routers/files.py:266의 asyncio.create_task(_run_analysis(file.file_id))가 실행 중인 이벤트 루프가 없는 스레드에서 호출되어 터진 에러입니다.

FastAPI는 엔드포인트 함수가 async def가 아니면 run_in_threadpool(워커 스레드)에서 실행합니다. 트레이스백을 보면 정확히 그 경로(fastapi/routing.py:346 run_in_threadpool → anyio 워커 스레드)를 타고 있는데, 워커 스레드에는 asyncio 이벤트 루프가 없기 때문에 그 안에서 asyncio.create_task()를 호출하면 RuntimeError: no running event loop가 발생합니다. 즉 에러 발생 시점에는 analyze_file이 동기(def) 함수였을 가능성이 높습니다.

현재 상태
지금 소스코드의 files.py:253, files.py:273는 이미 async def로 되어 있어, FastAPI가 스레드풀을 거치지 않고 이벤트 루프에서 직접 실행합니다 → 이 크래시 자체는 현재 코드상 재현되지 않을 것으로 보입니다. 확인해보니:

files.py 마지막 수정 시각: 18:17:37
현재 떠있는 uvicorn(--reload) 프로세스 시작 시각: 18:21
즉 지금 돌고 있는 서버는 이미 수정된(async) 코드를 로드한 상태입니다.

반복 실행처럼 보인 이유 (부수 효과, 아직 미해결)
크래시가 나기 전에 이미 file.status = "analyzing"이 db.commit()으로 확정된 뒤 asyncio.create_task()가 터졌기 때문에, 실제 분석 백그라운드 작업은 시작되지 못한 채 DB엔 status="analyzing"만 남았습니다. 이후:

프론트엔드는 상태를 계속 GET 폴링 (로그의 반복 GET .../file_6f23ac6bfa 200 OK)
재시도용 POST는 file.status != "idle" 체크에 걸려 400 Bad Request
retry_file(files.py:272)은 status == "analysis_failed"일 때만 재시도를 허용하므로, "analyzing"에 멈춘 파일(file_21b2f29238)은 현재 코드상 복구할 방법이 없이 영구히 멈춘 상태로 남아있을 수 있습니다. 이건 이번 크래시가 남긴 좀비 상태이고, 앞으로 같은 종류의 예외(예: builder ingest 호출 실패 등)가 나도 똑같이 재현되는 설계상 허점입니다.

원하시면 (1) DB에서 file_21b2f29238 상태를 직접 확인/리셋하거나, (2) analyze_file에 예외 처리 및 "analyzing" 상태에서도 재시도를 허용하는 방어 로직을 추가해드릴까요?

### 처리 내용
- files.py:266-267, files.py:287-288: _run_analysis를 asyncio.create_task(fire-and-forget)가 아니라 await로 직접 호출하도록 변경. 이제 분석이 끝날 때까지 요청이 블로킹되고, 끝나면 db.refresh(file)로 최종 상태(done/analysis_failed)를 정확히 응답에 반영합니다. _call_builder_ingest는 기존처럼 백그라운드 태스크로 병렬 실행되도록 남겨뒀습니다.
- 동작 검증: 실제 실행 중인 서버에 curl로 analyze/retry 호출 → 정상적으로 202와 최종 상태를 반환, 에러 재발 없음.




# logic 0712-005
- builder에 md 파일 내용을 DB에 저장하는 로직을 추가함.
이제 POST /analyze → 받은 doc_id로 GET /documents/{doc_id} 호출해 분석 결과(요약/엔티티/관계/본문)를 확인할 수 있습니다.

요약
api/schemas.py — DocumentOut(document: WikiFrontmatter, body: str) 응답 모델 추가.
api/app.py — GET /builderapi/v1/documents/{doc_id} 추가. draft를 먼저 찾고 없으면 approved를 찾아 md 원문(frontmatter+본문)을 그대로 반환, 둘 다 없으면 404.
tests/unit/test_api.py — draft 상태 조회, approve 후 상태 전환 확인, 존재하지 않는 doc_id 404 케이스 추가.
README.md — API 엔드포인트 목록에 새 엔드포인트 문서화.
DB 없이 파일을 직접 읽는 구조라, 이 프로젝트의 storage가 곧 source of truth이고 별도 인프라 의존성이 생기지 않습니다. 다른 백엔드는 이제 POST /analyze → 받은 doc_id로 GET /documents/{doc_id} 호출해 분석 결과(요약/엔티티/관계/본문)를 확인할 수 있습니다.


요약 (analyze 이후 다른 백엔드가 알아야 할 것)
단계	호출	md 위치	벡터
- analyze/ingest	/analyze	wiki/draft/{doc_id}.md	없음
- approve	/documents/{doc_id}/approve	wiki/approved/{doc_id}.md (draft는 삭제)	wiki_summary, wiki_chunk에 upsert
- reindex	/documents/{doc_id}/reindex	approved 그대로	기존 포인트 delete 후 재upsert

중요: 다른 백엔드가 /analyze 호출 후 검색 가능한 벡터까지 원한다면, 반드시 이어서 /documents/{doc_id}/approve도 호출해야 합니다. 지금 구조는 사람이 draft를 검수(review)한 뒤 수동으로 approve하는 걸 전제로 하므로, 외부 백엔드가 자동으로 approve까지 이어붙이길 원하면 그 흐름(예: analyze 성공 시 자동 approve, 혹은 검수 없이 바로 승인)을 별도로 설계해야 합니다. 필요하시면 이 부분도 도와드릴 수 있습니다.



# logic 0712-006
- 진행상태: 완료
analyze api 작업 완료하면,  /builderapi/v1/documents/{doc_id} GET api를 호출하여 mardown 정보를 wiki 테이블에 저장한다.

### 처리 내용
- 핵심 저장 로직(`_fetch_builder_document`/`_upsert_wikimd`/`_fetch_and_persist_wikimd_docs`, `WikiMd` 테이블)은 이미 구현되어 있었으나, `_call_builder_ingest`가 `asyncio.create_task`로 fire-and-forget 실행되어 analyze 완료와 순서가 보장되지 않았음.
- files.py: `analyze_file`/`retry_file`에서 `_run_analysis` 완료 후 `await _call_builder_ingest(file)`를 순차 실행하도록 변경 — `/analyze` 응답이 돌아오면 wiki 저장까지 끝난 상태가 보장됨.

- files.py: `_fetch_and_persist_wikimd_docs`의 `db.commit()`을 per-doc try/except로 감싸 한 문서 실패가 배치 전체를 롤백하지 않도록 보강.
- files.py/schemas.py: `GET /files/{file_id}/wiki` 엔드포인트와 `WikiSchema`/`WikiListResponse` 추가 — write-only였던 `WikiMd`를 조회 가능하게 함.

- 프론트엔드: `api/wiki.ts`, `WikiViewerModal` 컴포넌트 신규 추가, `FileCard`에 "위키 원문 보기" 버튼 연동 (분석완료 상태에서 노출). 마크다운 렌더러는 추가하지 않고 원문을 그대로 표시.
- 부수 발견/수정: `models.py`에 `File`↔`WikiMd` cascade 관계가 없어, wiki 데이터가 저장된 파일이 속한 Space를 삭제하면 FK 제약 위반으로 500 에러 발생하던 버그를 cascade 관계 추가로 수정.
- 동작 검증: 실제 builder 서비스(로컬 8002) 대상으로 curl 및 브라우저(Playwright)로 업로드→분석→위키 원문 조회 전체 플로우 확인.