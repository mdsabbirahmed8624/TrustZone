@echo off
cd /d "%~dp0"
title TrustZone - Sync to GitHub
echo ==============================================
echo   TrustZone - Syncing Local Changes to GitHub
echo ==============================================
git status --short
echo.
git add -A
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "update: local changes %DATE% %TIME%"
    git push origin main
    echo.
    echo ==============================================
    echo   Sync to GitHub Completed Successfully!
    echo ==============================================
) else (
    echo No changes to commit. Working tree is clean.
)
echo.
pause
