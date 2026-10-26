# TrustZone Automatic Git Sync Watcher
# Automatically commits and pushes changes when files are saved
param(
    [int]$DebounceSeconds = 10
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = (Resolve-Path "$scriptPath\..").Path

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " TrustZone Real-time GitHub Auto-Sync Watcher Started" -ForegroundColor Green
Write-Host " Watching: $repoRoot" -ForegroundColor Yellow
Write-Host " Remote: https://github.com/mdsabbirahmed8624/TrustZone" -ForegroundColor Yellow
Write-Host " Debounce interval: $DebounceSeconds seconds" -ForegroundColor Gray
Write-Host " Press Ctrl+C in this window to stop auto-syncing." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location $repoRoot

function Sync-GitRepo {
    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "`n[$timestamp] Changes detected! Syncing to GitHub..." -ForegroundColor Yellow
        git add -A
        git commit -m "auto-sync: update local files ($timestamp)"
        git push origin main
        Write-Host "[$timestamp] Successfully synced to GitHub!" -ForegroundColor Green
    }
}

# Initial check
Sync-GitRepo

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor `
                       [System.IO.NotifyFilters]::LastWrite -bor `
                       [System.IO.NotifyFilters]::DirectoryName

$ignoredPatterns = @('\.git\', '\node_modules\', '\.next\', '\dist\', '\build\', '\.agents\', 'auto-sync')

$global:lastChange = [DateTime]::MinValue
$global:pendingSync = $false

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $skip = $false
    foreach ($ignored in $using:ignoredPatterns) {
        if ($path.IndexOf($ignored, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            $skip = $true
            break
        }
    }
    if (-not $skip) {
        $global:lastChange = [DateTime]::Now
        $global:pendingSync = $true
    }
}

$handlers = @(
    (Register-ObjectEvent $watcher 'Changed' -Action $action),
    (Register-ObjectEvent $watcher 'Created' -Action $action),
    (Register-ObjectEvent $watcher 'Deleted' -Action $action),
    (Register-ObjectEvent $watcher 'Renamed' -Action $action)
)

try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($global:pendingSync -and (([DateTime]::Now - $global:lastChange).TotalSeconds -ge $DebounceSeconds)) {
            $global:pendingSync = $false
            Sync-GitRepo
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    foreach ($h in $handlers) {
        Unregister-Event -SourceIdentifier $h.Name -ErrorAction SilentlyContinue
    }
    Write-Host "`nAuto-sync watcher stopped." -ForegroundColor Red
}
