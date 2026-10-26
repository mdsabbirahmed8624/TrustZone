@echo off
cd /d "%~dp0"
title TrustZone GitHub Auto-Sync Watcher
echo Starting TrustZone GitHub Auto-Sync Watcher...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\auto-sync.ps1"
