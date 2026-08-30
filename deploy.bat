@echo off
title Deploy Koinonia LMS - Vercel Producao
color 0A

set VERCEL_DISABLE_UPGRADE_CHECK=1

echo ========================================================
echo        DEPLOY AUTOMATICO DO KOINONIA LMS PARA VERCEL
echo ========================================================
echo.
echo Diretorio: %~dp0
echo Projeto:   koinonialms (Vercel)
echo Producao:  https://koinonialms.vercel.app
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Verificacao de Tipos TypeScript
echo [1/3] Validando integridade de tipos TypeScript (npx tsc --noEmit)...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ========================================================
    echo [ERRO] Falha na verificacao de tipos TypeScript!
    echo Corrija os erros apontados acima antes de fazer deploy.
    echo ========================================================
    echo.
    pause
    exit /b %errorlevel%
)
echo [OK] Tipos TypeScript 100%% validados!
echo.

REM 2. Compilacao Local de Producao
echo [2/3] Executando build de producao do Next.js (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ========================================================
    echo [ERRO] A compilacao do Next.js falhou!
    echo Verifique o log de erro acima.
    echo ========================================================
    echo.
    pause
    exit /b %errorlevel%
)
echo [OK] Build de producao compilado com sucesso!
echo.

REM 3. Envio Direto para a Vercel
echo [3/3] Enviando versao de producao para a Vercel (npx vercel --prod --yes)...
echo.
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ========================================================
    echo [ERRO] Ocorreu uma falha no envio para a Vercel.
    echo ========================================================
    echo.
    pause
    exit /b %errorlevel%
)

color 0A
echo.
echo ========================================================
echo           DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================================
echo.
echo Koinonia LMS esta online e atualizado em:
echo - URL Oficial: https://koinonialms.vercel.app
echo - Link Legado: https://uiecblms.vercel.app
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
exit /b 0
