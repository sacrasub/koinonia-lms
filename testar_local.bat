@echo off
title Koinonia LMS - Servidor Local
color 0B

echo ========================================================
echo        KOINONIA LMS - AMBIENTE DE TESTE LOCAL
echo ========================================================
echo.
echo Diretorio: %~dp0
echo Servidor:  http://localhost:3000
echo.
echo Abrindo http://localhost:3000 no navegador...
echo Para encerrar o servidor, feche esta janela ou aperte Ctrl + C.
echo ========================================================
echo.

cd /d "%~dp0"

REM Abre o navegador em segundo plano apos iniciar
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

call npm run dev
