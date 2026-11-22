@echo off
cd /d "%~dp0"
echo Installing project dependencies...
npm install
if errorlevel 1 goto error
echo Starting Pritam OS portfolio...
npm run dev
exit /b 0
:error
echo Dependency installation failed. Check your Node.js and internet connection.
pause
