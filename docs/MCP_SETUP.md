# MCP 설정 (Playwright · Figma)

이 프로젝트는 Cursor에서 **Playwright MCP**와 **Talk to Figma MCP**를 사용할 수 있도록 `.cursor/mcp.json`을 포함합니다.

## 적용 방법

1. **Cursor 재시작** 또는 **Settings → MCP → Refresh** 로 서버를 불러옵니다.
2. Node.js 18+ 와 `npx` 가 PATH에 있어야 합니다.
3. **Windows**: `%AppData%\npm` 폴더가 없으면 `npx`가 `ENOENT`로 실패할 수 있습니다. 프로젝트에서 `.\scripts\ensure-mcp-prerequisites.ps1` 를 한 번 실행하면 폴더 생성·의존성 설치를 한꺼번에 합니다.
4. `.cursor/mcp.json` 은 Cursor가 PATH를 못 잡는 경우에 대비해 **`C:\Program Files\nodejs\npx.cmd`** 를 사용합니다(이 PC에 Node가 기본 경로에 설치된 경우).

## Playwright MCP (`@playwright/mcp`)

- 브라우저 접근성 스냅샷 기반으로 페이지 탐색·클릭·입력 등을 에이전트가 수행합니다.
- 이 프로젝트는 **`playwright`** 패키지와 **`postinstall`** 스크립트로 **Chromium 바이너리가 `npm install` 직후 자동 설치**됩니다.
- MCP만 단독 쓸 때는 Cursor가 `npx -y @playwright/mcp@latest` 로 기동합니다. 브라우저가 없으면 `npm run browsers:install` 로 다시 받을 수 있습니다.

## Talk to Figma MCP (`cursor-talk-to-figma-mcp`)

- `.cursor/mcp.json` 에서는 **`bunx cursor-talk-to-figma-mcp@latest`** 로 연결합니다. (Bun: `C:\Users\Administrator\.bun\bin\bunx.exe`)
- 로컬 클론 후 `server.ts`를 직접 실행하는 방식은 `.cursor/README-MCP.md` 및 `mcp.local-repo.example.json` 참고.

- Figma 캔버스와 Cursor 간 브리지입니다.
- **WebSocket 서버** (기본 포트 `3055`)는 **직접 켜 두시면** 됩니다. 에이전트가 대신 실행하지 않습니다. 예:

  ```bash
  npx -y cursor-talk-to-figma-socket
  ```

  (배포물에 따라 `bunx cursor-talk-to-figma-socket` 일 수 있습니다.)

- Figma 커뮤니티 플러그인 **Cursor Talk to Figma** 설치 후, 대시보드에 적힌 **채널 이름**과 동일하게 맞춥니다.

## Figma MCP 대시보드 (로컬 UI)

개발 서버 실행 후 브라우저에서:

- `http://localhost:5173/figma-mcp-dashboard/`

채널은 URL 쿼리로 바꿀 수 있습니다: `?channel=내채널이름`

## 문제 해결

| 증상 | 조치 |
|------|------|
| `npx` 를 찾을 수 없음 | Node.js 설치 후 터미널 재시작 |
| `ENOENT: lstat ...\Roaming\npm` | `%AppData%\npm` 폴더 생성 또는 `.\scripts\ensure-mcp-prerequisites.ps1` 실행 |
| Figma 연결 안 됨 | 3055 포트 소켓 실행 여부, 플러그인 채널 일치 확인 |
| Playwright 느림 | `npx playwright install` (필요 시) |
