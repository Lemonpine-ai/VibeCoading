# Barkio vs Petcube Care — 페이지 구조 리포트

**추출 도구:** 프로젝트 `scripts/extract-site-structure-report.mjs` (Playwright, 데스크톱 뷰포트 1280×900)  
**대상:** [Barkio EN](https://barkio.com/en), [Petcube Care](https://petcube.com/care/)

---

## 1. Barkio (`https://barkio.com/en`)

### 메타·포지셔닝
| 항목 | 내용 |
|------|------|
| **페이지 타이틀** | Barkio: Dog Monitor for iOS, Android, macOS, and Windows |
| **메타 설명** | 두 기기를 하나의 강아지 모니터링 앱으로, 라이브 영상·짖음·원격 상호작용 강조 |

### 정보 구성 (헤딩 기준)
1. **히어로** — `h1`: “Keep an eye on your dog friend remotely” (반려견 원격 모니터링 한 줄 가치)
2. **플랫폼** — `h4`: “Available platforms” (모바일/데스크톱·다운로드 OS)
3. **선택 이유** — `h2`: “Reasons to choose Barkio” + `h4` 카드 4개  
   - 분리 불안, 성장 지켜보기, 행동 이해, **별도 하드웨어 카메라/목줄 불필요**
4. **핵심 기능 그리드** — `h2`: “Top Barkio Features” + `h4` 다수  
   - 라이브 영상, 가족 초대, 듣기·말하기, **무제한 거리**, 활동 로그, 보안(SSL), 모션, 알림, 이벤트 리플레이, “And many more!”
5. **리드 수집** — `h2`: “Sign up to Barkio paws-letter”
6. **콘텐츠** — `h2`: “Barkio blog”
7. **사회적 증거** — 후기 3개 (`h2`로 인용 제목: Perfect for puppies / Helped my fostered dog / Proof for my neighbor)
8. **하단 CTA** — `h4`: “Try Barkio now…”
9. **법적** — `h4`: “Copyright & trademark notices”

### 특징
- **강아지 전용 앱·소프트웨어 중심** 스토리 (기기 두 대로 모니터).
- `<section>` 태그로 잡히는 블록은 적어, DOM상으로는 **헤딩 트리가 정보 설계의 축**에 가깝다.

---

## 2. Petcube Care (`https://petcube.com/care/`)

### 메타·포지셔닝
| 항목 | 내용 |
|------|------|
| **페이지 타이틀** | Petcube Care - On-the-go Pet Monitoring System And Home Security |
| **메타 설명** | 24/7 기록, 타임라인 재생, 야간 시야 등 **하드웨어+클라우드 서비스** 성격 |

### 정보 구성 (헤딩 기준)
1. **히어로** — `h1`: “Know More, Worry Less with Petcube Care” + 구독(Subscribe) CTA
2. **핵심 가치** — `h2`: “Catch the most important moments”  
   - `h3`: 집 안 상황 파악(소리·모션 알림), 놓친 구간 **리플레이(클라우드, 최대 90일)**  
   - 필터 태그 개념: Pet Activity / Sound / Person
3. **차별 기능** — `h2`: “Your daily pet’s highlights in a 30s recap”  
   - `h3`: 하루 하이라이트 한 영상, SNS 공유
4. **사회적 증거** — `h2`: “See what pet parents have to say…” + `h4` 스토리 카드(실종/응급/유리 파편 등)
5. **부가 기능** — `h2`: “Even more features for your convenience”  
   - Smart filters, Geofence, Care schedule, Video downloads, Web interface, **Online Vet** 등
6. **수익 모델** — `h2`: “Choose your subscription plan”  
   - `h3`: Basic / Optimal / Premium, **월 가격·영상 보관 일수·다운로드·웨런티·카메라 수·Online Vet** 등 비교표

### 네비게이션(상단 샘플)
- Devices(제품별 가격), Services(Petcube Care, Care Bundle), 앱 QR, Support, Store, Sign In 등 **이커머스·서비스 번들** 강함.

### 특징
- **구독 서비스(Care) + Petcube 카메라/하드웨어**가 한 번에 묶인 랜딩.
- DOM에 `<section>` 영역이 **7개**로 잡힐 정도로 **섹션 단위 마크업**이 명확한 편.

---

## 3. 한눈에 비교

| 항목 | Barkio | Petcube Care |
|------|--------|----------------|
| **주인공** | 앱만으로 두 기기를 캠으로 | Petcube 카메라 + Care 구독 |
| **히어로 메시지** | 원격으로 강아지 지켜보기 | 덜 걱정, 더 알기 (Care) |
| **기능 나열** | “Top Features” 아이콘+짧은 제목 다수 | 알림·리플레이·30초 하이라이트·필터 |
| **신뢰** | 블로그 + 짧은 후기 3개 | 사고/응급 스토리 카드 + 가격표 |
| **전환** | 뉴스레터 + 앱 스토어 다운로드 | **구독 플랜** + 트라이얼 문구 |

---

## 4. 참고 링크

- [Barkio — Dog Monitor (EN)](https://barkio.com/en)
- [Petcube Care](https://petcube.com/care/)
