$wshShell = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$shortcutPath = Join-Path $desktop "Koinonia LMS - Pontos de Restauracao.lnk"
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "c:\Projetos\seminario\Koinonia-LMS\LMS_Pontos_de_Restauracao.bat"
$shortcut.WorkingDirectory = "c:\Projetos\seminario\Koinonia-LMS"
$shortcut.IconLocation = "shell32.dll,238"
$shortcut.Description = "Gerenciador de Pontos de Restauracao do Koinonia LMS"
$shortcut.Save()
Write-Host "Atalho criado na Area de Trabalho: $shortcutPath" -ForegroundColor Green
