# Git & GitHub 자동 커밋·푸시 프롬프트 (검증 완료)

## 환경 정보 (이 PC 기준)

| 항목 | 값 |
|------|-----|
| OS | Windows 10 (PowerShell) |
| Git 경로 | `C:\Git\cmd\git.exe` (PATH에도 등록됨) |
| GitHub CLI 경로 | `C:\gh-cli\bin\gh.exe` |
| Git 사용자 이름 | `Lemonpine-ai` |
| Git 이메일 | `bloodycroix@gmail.com` |
| GitHub 레포지토리 | `https://github.com/Lemonpine-ai/VibeCoading.git` |
| 브랜치 | `master` |

---

## Agent에게 전달할 프롬프트 (복사해서 사용)

```
작업이 완료되면 아래 절차대로 Git 커밋 및 GitHub push까지 반드시 자동으로 진행해줘.
(커밋만 하고 push를 건너뛰지 말 것. 3단계 push까지 완료해야 함)

[환경 정보]
- OS: Windows 10 / PowerShell
- Git 경로: C:\Git\cmd\git.exe (git 명령 인식 안 되면 이 경로로 직접 실행)
- Git 사용자: Lemonpine-ai / bloodycroix@gmail.com
- 원격 저장소: https://github.com/Lemonpine-ai/VibeCoading.git
- 브랜치: master
- 작업 폴더: C:\Users\Administrator\Desktop\new\vibecoding3-main

[커밋·푸시 절차] (1~3단계 모두 실행 필수)
$gitExe = "C:\Git\cmd\git.exe"
$workspacePath = "C:\Users\Administrator\Desktop\new\vibecoding3-main"

1단계 - 변경된 파일 스테이징:
  cd $workspacePath
  & $gitExe add .

2단계 - 커밋 (메시지는 작업 내용을 반영해서 작성):
  & $gitExe commit -m "작업 내용을 설명하는 커밋 메시지"

3단계 - GitHub push (반드시 실행):
  & $gitExe push origin master

[주의사항]
- git 명령어가 인식 안 될 경우: 위처럼 & "C:\Git\cmd\git.exe" 로 직접 호출
- push를 빠뜨리지 말 것: 커밋 후 반드시 push origin master 실행
- "Author identity unknown" 오류 시:
  & $gitExe config --global user.name "Lemonpine-ai"
  & $gitExe config --global user.email "bloodycroix@gmail.com"

[검증 완료된 전체 명령어 예시]
$gitExe = "C:\Git\cmd\git.exe"
cd "C:\Users\Administrator\Desktop\new\vibecoding3-main"
& $gitExe add .
& $gitExe commit -m "feat: 작업 내용"
& $gitExe push origin master
```

---

## 문제 상황별 해결 명령어

### Git이 인식 안 될 때
```powershell
& "C:\Git\cmd\git.exe" --version
```

### Git 사용자 정보가 없을 때
```powershell
& "C:\Git\cmd\git.exe" config --global user.name "Lemonpine-ai"
& "C:\Git\cmd\git.exe" config --global user.email "bloodycroix@gmail.com"
```

### Remote 등록이 안 되어 있을 때
```powershell
# HTTPS (권장): Git Credential Manager 또는 `gh auth login` 후 푸시
& "C:\Git\cmd\git.exe" remote add origin https://github.com/Lemonpine-ai/VibeCoading.git
```

### Push 실패 시 (인증·네트워크)
```powershell
# 원격 URL은 토큰 없이 유지하고, 인증은 gh CLI 또는 자격 증명 관리자로 처리
& "C:\Git\cmd\git.exe" remote set-url origin https://github.com/Lemonpine-ai/VibeCoading.git
& "C:\Git\cmd\git.exe" push origin master
```
