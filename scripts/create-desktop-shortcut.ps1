$wshShell = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$shortcutPath = Join-Path $desktop "LMS UIECB - Pontos de Restauracao.lnk"
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "c:\Projetos\seminario\LMS-UIECB\LMS_Pontos_de_Restauracao.bat"
$shortcut.WorkingDirectory = "c:\Projetos\seminario\LMS-UIECB"
$shortcut.IconLocation = "shell32.dll,238"
$shortcut.Description = "Gerenciador de Pontos de Restauracao do LMS UIECB"
$shortcut.Save()
Write-Host "Atalho criado na Area de Trabalho: $shortcutPath" -ForegroundColor Green
