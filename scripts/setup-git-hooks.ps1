# Husky 훅을 설치합니다. 클론 직후 한 번 실행하면 커밋 후 자동 push(post-commit)가 동작합니다.
# (package.json 의 prepare 스크립트가 husky 를 실행합니다.)
$ErrorActionPreference = "Stop"
$repositoryRootPath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repositoryRootPath
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm 을 찾을 수 없습니다. Node.js LTS 를 설치한 뒤 다시 실행하세요."
    exit 1
}
npm run prepare
Write-Host "Husky 훅 설치 완료. 이제 커밋 후 자동으로 git push origin master 됩니다."
