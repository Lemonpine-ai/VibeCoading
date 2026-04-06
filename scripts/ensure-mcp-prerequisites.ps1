# MCP(Playwright·TalkToFigma) 사전 조건 점검 및 Windows에서 자주 깨지는 항목 보정
# 사용: PowerShell에서 프로젝트 루트 기준으로 실행
#   .\scripts\ensure-mcp-prerequisites.ps1

$ErrorActionPreference = "Stop"

function WriteStepMessage {
  param([string]$messageText)
  Write-Host "[MCP 준비] $messageText"
}

# 1) npx가 global bin 경로로 %AppData%\Roaming\npm 을 쓰는데, 폴더가 없으면 ENOENT로 실패함
$applicationDataRootPath = $env:APPDATA
if ([string]::IsNullOrWhiteSpace($applicationDataRootPath)) {
  $applicationDataRootPath = [Environment]::GetFolderPath("ApplicationData")
}
if ([string]::IsNullOrWhiteSpace($applicationDataRootPath) -and -not [string]::IsNullOrWhiteSpace($env:USERPROFILE)) {
  $applicationDataRootPath = Join-Path $env:USERPROFILE "AppData\Roaming"
}
if ([string]::IsNullOrWhiteSpace($applicationDataRootPath)) {
  throw "ApplicationData(Roaming) 경로를 알 수 없습니다. USERPROFILE/APPDATA를 확인하세요."
}
$npmRoamingDirectoryPath = Join-Path $applicationDataRootPath "npm"
if (-not (Test-Path $npmRoamingDirectoryPath)) {
  New-Item -ItemType Directory -Force -Path $npmRoamingDirectoryPath | Out-Null
  WriteStepMessage "생성함: $npmRoamingDirectoryPath"
} else {
  WriteStepMessage "확인됨: $npmRoamingDirectoryPath"
}

# 2) Node / npm / npx / Git 존재 여부
$requiredCommands = @("node", "npm", "npx", "git")
foreach ($commandName in $requiredCommands) {
  $commandInfo = Get-Command $commandName -ErrorAction SilentlyContinue
  if (-not $commandInfo) {
    throw "필수 명령을 찾을 수 없습니다: $commandName (Node.js 또는 Git 설치 후 PATH를 확인하세요.)"
  }
  & $commandName --version
}

# 3) 프로젝트 의존성 (이 파일은 scripts/ 아래에 둠)
$projectRootPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectRootPath
WriteStepMessage "npm install 실행 중: $projectRootPath"
npm install

WriteStepMessage "완료. Cursor에서 MCP를 새로고침하세요."
Write-Host "  - Playwright MCP: npx @playwright/mcp (Chromium은 `npm install` 후 postinstall로 설치됨)"
Write-Host "  - Talk to Figma: 3055 소켓은 필요 시 `npm run mcp:socket` 로 별도 실행"
