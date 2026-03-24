# Git 훅 디렉터리를 저장소 루트의 .githooks로 지정합니다.
# 클론 직후 한 번 실행하면 커밋 후 자동 푸시(post-commit)가 활성화됩니다.
$ErrorActionPreference = "Stop"
$repositoryRootPath = Split-Path -Parent $PSScriptRoot
$gitExecutablePath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitExecutablePath)) {
    $gitExecutablePath = "git"
}
& $gitExecutablePath -C $repositoryRootPath config core.hooksPath .githooks
Write-Host "core.hooksPath=.githooks 로 설정했습니다. 이제 커밋 후 자동으로 push 됩니다."
