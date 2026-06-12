@echo off
echo ============================================
echo  보험도감 Windows 실행파일(.exe) 빌드
echo ============================================
echo 1) 처음 실행 시 필요한 패키지를 설치합니다 (인터넷 필요, 수 분 소요)
echo 2) 빌드가 끝나면 dist\bo-version-win32-x64\ 폴더에 보험도감.exe 가 생성됩니다.
echo.
call npm install
call npm run dist:win
echo.
echo 완료! dist 폴더를 확인하세요.
pause
