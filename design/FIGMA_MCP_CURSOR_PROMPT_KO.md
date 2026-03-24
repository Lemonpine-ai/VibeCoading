# Figma MCP용 프롬프트 — Cubo US 홈 복제

이 내용을 **Cursor에서 Figma MCP(Talk to Figma)가 연결된 상태**로 채팅에 붙여 넣으면, 에이전트가 프레임·스타일을 만들도록 지시할 수 있습니다.  
프로젝트의 `design/cubo-us-home-reference.png`를 참고 이미지로 함께 첨부하면 더 유리합니다.

---

## 한 번에 붙여 넣을 지시문 (복사용)

```
Figma에서 새 파일을 만들고, 이름은 "Cubo US Home (Inspired)" 로 해줘.

아래는 https://us.getcubo.com/ 홈페이지의 서식과 느낌을 복제한 디자인 가이드야.

[캔버스]
- 데스크톱 프레임 1440px 너비, 배경 #FFFFFF, 세로는 스크롤 가능한 랜딩 길이(약 3200px 이상).

[색상 스타일 — 로컬 스타일로 생성]
- Text Primary: #4B4B4B
- Primary Teal: #24CEB9
- Primary Mint (CTA 배경): #5BE3D3
- Primary Teal Light (섹션 배경): #E9F4F3
- Secondary Coral: #FF8784
- Accent Blue: #4CC3E5
- Sky Blue: #7ED4ED
- Warning Amber: #FFB516
- Gray BG: #EBEBEF
- Night: #4E5A6B

[타이포]
- 제목(H1): 약 40px, SemiBold(600), 행간 48px, 색 Text Primary. 폰트는 Museo Sans Rounded가 없으면 Nunito SemiBold로 대체.
- 본문: 16px Regular, 색 Text Primary. 폰트는 Inter 또는 시스템 산세리프.
- CTA pill 버튼: 텍스트 20px SemiBold, 배경 Primary Mint, 텍스트 Text Primary, 모서리 완전 라운드(50px pill).

[섹션 구조 — 위에서 아래로]
1) 헤더: 높이 72px, 흰 배경, 하단 1px 보더 #EBEBEF. 좌측 로고 플레이스홀더, 중앙 네비 메뉴 텍스트, 우측 카트 아이콘·국가 선택.
2) 히어로: 중앙 정렬 H1 "The Smart Baby Monitor Prioritizing Safety | AI Alerts, Sleep Tracking & Peace of Mind", 서브카피 한 줄, "Sign Up" CTA는 mint pill 스타일.
3) 수상/인용 배지: 2열 또는 캐러셀 느낌의 카드, 연한 배경(#E9F4F3 또는 #FFFFFF)과 인용부호 스타일 타이포.
4) "Our parenting-focused features reduce parental anxiety by 80%" — Safety / Sleep / Health / Memories 4개 아이콘+제목 그리드, 각 카드에 아주 옅은 틸·블루·코랄 틴트 배경 교차.
5) "Why choose CuboAi?" 비교표: 3열(빈칸 | CuboAi | Traditional), 행은 Safety / Sleep / Health — 라운드 12px 테이블 카드.
6) 리뷰 섹션: "Making parenting easier" — 카드형 후기 3~4개, 별점 4.4/5 플레이스홀더.
7) 푸터 CTA: 배경 #EBEBEF, "Get $10 Off CuboAi Sets & Bundle!" + 이메일 필드 + Subscribe 버튼(mint 또는 teal).

[전체적인 느낌]
- 부드러운 라운드 코너, 넉넉한 패딩(섹션 80~120px), 파스텔 틸·민트·코랄 포인트.
- 과한 그림자 없음, Shopify 랜딩처럼 깔끔하고 육아 브랜드 톤.

프레임 안에 섹션별로 그룹을 나누고, 색상·텍스트 스타일을 로컬 스타일로 등록해줘.
```

---

## Playwright MCP로 확인한 사실

- 본문·제목 텍스트 색상 `rgb(75,75,75)` ≈ `#4B4B4B`
- H1: `40px` / `600` / `line-height 48px`
- CTA 버튼 유사 요소: 배경 `rgb(91, 227, 211)` = `#5BE3D3`, `border-radius: 50px`, 패딩 `12px 20px`
- 사이트 CSS 변수에 `--primary-color: #24ceb9`, `--secondary-color: #ff8784` 등 정의됨

---

## 3055 소켓 (Figma MCP)

Figma 플러그인·Cursor Talk to Figma를 쓰는 경우 **WebSocket** `bun x cursor-talk-to-figma-socket` (또는 `npm run mcp:socket`)이 켜져 있어야 동기화될 수 있습니다.
