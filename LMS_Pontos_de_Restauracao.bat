@echo off
chcp 65001 >nul
title LMS UIECB - Gerenciador de Pontos de Restauração (Backups)

cd /d "c:\Projetos\seminario\LMS-UIECB"

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\snapshot-manager.ps1"

exit
