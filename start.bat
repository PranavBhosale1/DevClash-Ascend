@echo off
echo Starting development servers...

start cmd /k "cd %~dp0 && npm run next-dev"
start cmd /k "cd %~dp0 && npm run flask-dev"

echo Servers started!
echo Next.js: http://localhost:3000
echo Flask API: http://localhost:5000 