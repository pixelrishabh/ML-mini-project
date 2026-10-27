@echo off
echo ===================================================================
echo  Starting Student Performance ML Project (Backend + Frontend)
echo ===================================================================
npx concurrently -k -n "BACKEND,FRONTEND" -c "blue,green" "npm --prefix backend start" "npm --prefix frontend run dev"
pause
