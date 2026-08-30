$wshShell = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)

# 1. Atalho para Testar Localmente
$testShortcutPath = Join-Path $desktop "LMS UIECB - Testar Mudancas Locais.lnk"
$testShortcut = $wshShell.CreateShortcut($testShortcutPath)
$testShortcut.TargetPath = "c:\Projetos\seminario\LMS-UIECB\testar_local.bat"
$testShortcut.WorkingDirectory = "c:\Projetos\seminario\LMS-UIECB"
$testShortcut.IconLocation = "shell32.dll,13"
$testShortcut.Description = "Inicia o servidor local do LMS UIECB e abre o navegador em http://localhost:3000 para testes antes do deploy"
$testShortcut.Save()
Write-Host "✅ Atalho de Teste Local criado na Área de Trabalho: $testShortcutPath" -ForegroundColor Cyan

# 2. Atalho para Fazer Deploy em Produção
$deployShortcutPath = Join-Path $desktop "LMS UIECB - Fazer Deploy Producao.lnk"
$deployShortcut = $wshShell.CreateShortcut($deployShortcutPath)
$deployShortcut.TargetPath = "c:\Projetos\seminario\LMS-UIECB\deploy.bat"
$deployShortcut.WorkingDirectory = "c:\Projetos\seminario\LMS-UIECB"
$deployShortcut.IconLocation = "shell32.dll,238"
$deployShortcut.Description = "Valida o código, compila e publica o LMS UIECB em producao na Vercel (https://uiecblms.vercel.app)"
$deployShortcut.Save()
Write-Host "🚀 Atalho de Deploy em Produção criado na Área de Trabalho: $deployShortcutPath" -ForegroundColor Green
