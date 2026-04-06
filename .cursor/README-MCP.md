# MCP 설정 메모

## Playwright MCP + Talk to Figma — **동시 사용(공존)**

`.cursor/mcp.json` 의 `mcpServers` 안에 **서로 다른 키**로 두 서버를 넣어 두었습니다. Cursor는 각각 별도 프로세스로 띄우므로 **서로 덮어쓰지 않고 함께** 쓸 수 있습니다.

| 키 | 역할 |
|----|------|
| `playwright` | 브라우저 자동화 (`@playwright/mcp`) — **Node `npx`** |
| `TalkToFigma` | Figma 디자인 연동 — **Bun `bunx`** |

한쪽만 쓰려면 Cursor 설정에서 해당 MCP만 끄면 됩니다. **한 파일에서 둘 다 유지하는 것이 기본 설정**입니다.

## 현재 실행 경로 (`.cursor/mcp.json`)

- **playwright**: `C:\Program Files\nodejs\npx.cmd` + `-y`, `@playwright/mcp@latest`
- **TalkToFigma**: `C:\Users\Administrator\.bun\bin\bunx.exe` + `cursor-talk-to-figma-mcp@latest`

## 로컬 소스로 TalkToFigma만 바꿀 때

저장소를 클론해 `server.ts`를 직접 돌리려면 **`TalkToFigma` 블록만** 교체하고, **`playwright` 블록은 그대로** 두세요.  
`mcp.local-repo.example.json`은 TalkToFigma 예시만 담고 있으므로, 실제 `mcp.json`에는 아래처럼 **두 서버가 같이** 있어야 합니다.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "C:\\Program Files\\nodejs\\npx.cmd",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "TalkToFigma": {
      "command": "C:\\Users\\Administrator\\.bun\\bin\\bun.exe",
      "args": ["D:\\dev\\cursor-talk-to-figma-mcp\\src\\talk_to_figma_mcp\\server.ts"]
    }
  }
}
```

## Bun 경로가 다른 PC

`C:\Users\Administrator\.bun\bin\bunx.exe` / `bun.exe` 를 해당 PC의 Bun 설치 경로로 수정하세요.
