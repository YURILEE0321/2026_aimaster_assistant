docs/

├── prd.md                  # 서비스 목적 / 기능 요구사항

├── user-scenarios.md       # 사용자 시나리오

├── design-spec.md          # 화면별 디자인 명세

├── api-spec.md             # Backend API 명세

└── frontend-conventions.md # Frontend 개발 규칙

## Markdown 렌더링

구분	기술	용도
Markdown 렌더러	react-markdown (^10)	markdown 문자열을 React 엘리먼트로 변환해 렌더링
GFM 플러그인	remark-gfm (^4)	테이블 / 취소선 / 자동링크 등 GitHub-flavored markdown 문법 지원

* 검토 화면(`ReviewScreen`)의 "LLM Wiki" 섹션(`wikimd.body` 원문)을 렌더링하는 데 사용한다. 구현: `frontend/src/components/review/MarkdownBody.tsx`.
* `dangerouslySetInnerHTML`을 쓰지 않고 markdown → React 엘리먼트로 변환하는 라이브러리를 선택했다 (XSS 위험을 구조적으로 낮춤).
* 기본 설정에서는 raw HTML(및 HTML 주석)을 렌더링하지 않는다 — builder가 남기는 `<!-- REVIEW: ... -->` 류 grounding-check 주석이 별도 처리 없이 화면에 노출되지 않는 부수 효과가 있다.
* 스타일은 별도 CSS 프레임워크 없이 `MarkdownBody.tsx` 내 `components` prop으로 앱 기존 톤(`theme/tokens.ts`의 `fonts`/`radii`, CSS 변수 `--text`/`--ink-rgb`/`--accent-text`)에 맞춰 인라인으로 매핑한다 — `frontend-conventions.md`의 "인라인 스타일 우선" 원칙 유지.