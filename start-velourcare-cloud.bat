@echo off
title VelourCare Ortho Cloud Server
cd /d "%~dp0"
echo ========================================================
echo   Starting VelourCare Ortho Cloud Platform
echo   Opening: http://localhost:8000
echo ========================================================
start "" http://localhost:8000
node server.js
pause
