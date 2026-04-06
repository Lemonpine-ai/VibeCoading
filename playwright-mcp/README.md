# Playwright MCP (프로젝트 메모)

Cursor에서 사용하는 **Playwright MCP**는 `.cursor/mcp.json`으로 등록합니다.  
이 폴더는 이전 실행 시 생성된 **콘솔 로그** 등이 들어올 수 있으며, 루트 `.gitignore`의 `*.log` 규칙으로 커밋에서 제외됩니다.

- MCP 공식 패키지: `@playwright/mcp`
- 수동 기동(테스트): `npm run mcp:playwright`

자세한 절차는 `docs/MCP_SETUP.md`를 참고하세요.
