@echo off
setlocal

set "ISCC1=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
set "ISCC2=C:\Program Files\Inno Setup 6\ISCC.exe"

if exist "%ISCC1%" (
    set "ISCC=%ISCC1%"
) else if exist "%ISCC2%" (
    set "ISCC=%ISCC2%"
) else (
    echo Inno Setup 6 is not installed.
    echo Download it from https://jrsoftware.org/isdl.php and try again.
    pause
    exit /b 1
)

"%ISCC%" "%~dp0installer.iss"

echo.
echo Build complete. Check the Output folder for the setup file.
pause
