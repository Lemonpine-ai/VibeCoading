# CAT — 고양이 모니터링 리포트 (Supabase `public`)

Supabase **CAT** 프로젝트와 연동하는 정적 리포트 페이지입니다. 브라우저에서 `index.html`을 열면 됩니다.

## 포함 파일

| 파일 | 설명 |
|------|------|
| `index.html` | `cat_reports` 뷰 조회, 로그인, `behavior_events` 실시간 새로고침 |

## `public` 스키마 점검 요약 (CAT DB)

아래는 Postgres 권한·객체 기준 점검입니다. **Table Editor / Data API**에서 `public`이 안 보이면 Supabase 대시보드 **Project Settings → Data API → Exposed schemas**에 `public`이 포함돼 있는지도 함께 확인하세요.

### 스키마 `USAGE`

- `public`에 대해 **`anon`**, **`authenticated`** 역할에 **스키마 USAGE**가 부여되어 있습니다.
- **`dashboard_user`**(Studio)에는 **USAGE + CREATE**가 부여되어 있어 Table Editor에서 스키마를 사용할 수 있습니다.

### 뷰 `public.cat_reports`

- **뷰**(`relkind`: view), **RLS는 뷰 자체에는 적용되지 않음**(`relrowsecurity`: false). 행 단위 보안은 **security invoker**로 호출 시 기본 테이블·조인 조건이 적용됩니다.
- **`anon`**, **`authenticated`** 에게 **`SELECT` 권한**이 있어, 클라이언트(anon 키)로 조회 요청이 가능합니다.
- 뷰 정의는 `app_users.auth_user_id = auth.uid()`로 연결되므로, **로그인한 사용자**에게만 해당 `cats` 행이 보입니다.

### 기타 `public` 테이블 RLS (참고)

일부 테이블은 RLS가 켜져 있습니다(예: `app_users`, `cats`, `behavior_events`, `pain_analyses`). 리포트 화면은 주로 **`cat_reports` 뷰**만 조회합니다.

## 데이터가 비어 있을 때

1. Supabase **Auth**로 로그인했는지 확인합니다.
2. `public.app_users`에 행이 있고, `auth_user_id`가 **현재 로그인한 사용자 UUID**와 같은지 확인합니다.
3. `public.cats`의 `user_id`가 그 `app_users.id`를 가리키는지 확인합니다.
4. `behavior_events` 등 원본 데이터가 있으면 뷰 집계에 반영됩니다.

## 관련 경로 (저장소 루트)

- `../cat-report.html` → 이 폴더의 `index.html`로 리다이렉트합니다.
