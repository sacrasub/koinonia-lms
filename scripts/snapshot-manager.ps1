# Gerenciador de Pontos de Restauracao (Snapshots) do Koinonia LMS
# Permite criar pontos de backup instantaneos e restaurar o projeto a qualquer momento.

param (
    [string]$Action = "menu",
    [string]$SnapshotName = "",
    [string]$Description = ""
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = "c:\Projetos\seminario\Koinonia-LMS"
$BackupBaseDir = "c:\Projetos\seminario\_LMS_PONTOS_RESTAURACAO"

if (-not (Test-Path $BackupBaseDir)) {
    New-Item -ItemType Directory -Path $BackupBaseDir -Force | Out-Null
}

function Show-Header {
    Clear-Host
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "        KOINONIA LMS - GERENCIADOR DE PONTOS DE RESTAURACAO (BACKUP)            " -ForegroundColor Yellow
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host " Diretorio do Projeto : $ProjectRoot" -ForegroundColor Gray
    Write-Host " Cofre de Restauracao : $BackupBaseDir" -ForegroundColor Gray
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
}

function Get-SnapshotsList {
    $dirs = Get-ChildItem -Path $BackupBaseDir -Directory | Sort-Object CreationTime -Descending
    $list = @()
    foreach ($d in $dirs) {
        $metaFile = Join-Path $d.FullName "snapshot_metadata.json"
        $desc = "Sem descricao"
        $dateStr = $d.CreationTime.ToString("dd/MM/yyyy HH:mm:ss")
        if (Test-Path $metaFile) {
            try {
                $meta = Get-Content $metaFile -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($meta.description) { $desc = $meta.description }
                if ($meta.createdAt) { $dateStr = $meta.createdAt }
            } catch {}
        }
        $list += [PSCustomObject]@{
            Folder = $d.Name
            FullPath = $d.FullName
            Date = $dateStr
            Description = $desc
        }
    }
    return $list
}

function Create-Snapshot {
    param ([string]$Name = "", [string]$DescriptionText = "")
    
    Show-Header
    Write-Host ""
    Write-Host "[+] CRIANDO NOVO PONTO DE RESTAURACAO..." -ForegroundColor Green
    Write-Host ""

    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    
    if ([string]::IsNullOrWhiteSpace($Name)) {
        Write-Host "Digite um nome/identificador para este ponto (ex: Antes_Mudancas_Gemini): " -ForegroundColor Yellow -NoNewline
        $Name = Read-Host
    }
    
    if ([string]::IsNullOrWhiteSpace($Name)) {
        $Name = "Ponto_$timestamp"
    } else {
        $clean = ($Name -replace '[^a-zA-Z0-9_\-\.]', '_')
        $Name = "${timestamp}_${clean}"
    }

    if ([string]::IsNullOrWhiteSpace($DescriptionText)) {
        Write-Host "Digite uma breve descricao (opcional): " -ForegroundColor Yellow -NoNewline
        $DescriptionText = Read-Host
    }
    if ([string]::IsNullOrWhiteSpace($DescriptionText)) {
        $DescriptionText = "Ponto de restauracao gravado em $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
    }

    $targetDir = Join-Path $BackupBaseDir $Name
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    Write-Host ""
    Write-Host ">> Copiando arquivos do projeto (codigo-fonte, public, configs, .env.local)..." -ForegroundColor Cyan

    $itemsToCopy = @(
        "src",
        "public",
        "scripts",
        "supabase",
        ".env.local",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "next.config.mjs",
        "tailwind.config.ts",
        "postcss.config.mjs",
        "vercel.json",
        "deploy.bat",
        "AGENTS.md",
        "LMS_Pontos_de_Restauracao.bat"
    )

    foreach ($item in $itemsToCopy) {
        $srcPath = Join-Path $ProjectRoot $item
        if (Test-Path $srcPath) {
            $destPath = Join-Path $targetDir $item
            if (Test-Path $srcPath -PathType Container) {
                robocopy $srcPath $destPath /E /XF *.log /XD .next node_modules .vercel /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
            } else {
                Copy-Item -Path $srcPath -Destination $destPath -Force
            }
        }
    }

    $meta = @{
        name = $Name
        createdAt = (Get-Date -Format "dd/MM/yyyy HH:mm:ss")
        timestamp = $timestamp
        description = $DescriptionText
        projectRoot = $ProjectRoot
    }
    $meta | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $targetDir "snapshot_metadata.json") -Encoding UTF8

    Write-Host ""
    Write-Host "[SUCESSO] Ponto de Restauracao '$Name' gravado com sucesso!" -ForegroundColor Green
    Write-Host "Local : $targetDir" -ForegroundColor Gray
    Write-Host "Nota  : $DescriptionText" -ForegroundColor Gray
    Write-Host ""
    if ($Action -eq "menu") {
        Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor DarkYellow
        $null = [Console]::ReadKey($true)
    }
}

function List-Snapshots {
    Show-Header
    Write-Host ""
    Write-Host "[i] PONTOS DE RESTAURACAO GRAVADOS NO COFRE:" -ForegroundColor Cyan
    Write-Host ""

    $list = Get-SnapshotsList
    if ($list.Count -eq 0) {
        Write-Host "Nenhum ponto de restauracao gravado ate o momento." -ForegroundColor Yellow
        Write-Host ""
    } else {
        $i = 1
        foreach ($s in $list) {
            Write-Host " [$i] " -ForegroundColor Yellow -NoNewline
            Write-Host "$($s.Folder)" -ForegroundColor White -NoNewline
            Write-Host " ($($s.Date))" -ForegroundColor Green
            Write-Host "     Descricao: $($s.Description)" -ForegroundColor Gray
            $i++
        }
    }
    Write-Host ""
    if ($Action -eq "menu") {
        Write-Host "Pressione qualquer tecla para voltar..." -ForegroundColor DarkYellow
        $null = [Console]::ReadKey($true)
    }
}

function Restore-Snapshot {
    Show-Header
    Write-Host ""
    Write-Host "[!] RESTAURAR PROJETO PARA UM PONTO ANTERIOR" -ForegroundColor Red
    Write-Host ""

    $list = Get-SnapshotsList
    if ($list.Count -eq 0) {
        Write-Host "Nenhum ponto de restauracao disponivel para restauro." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Pressione qualquer tecla para voltar..." -ForegroundColor DarkYellow
        $null = [Console]::ReadKey($true)
        return
    }

    $i = 1
    foreach ($s in $list) {
        Write-Host " [$i] " -ForegroundColor Yellow -NoNewline
        Write-Host "$($s.Folder)" -ForegroundColor White -NoNewline
        Write-Host " ($($s.Date))" -ForegroundColor Green
        Write-Host "     Descricao: $($s.Description)" -ForegroundColor Gray
        $i++
    }

    Write-Host ""
    Write-Host "Digite o NUMERO do ponto que deseja restaurar (ou 0 para cancelar): " -ForegroundColor Yellow -NoNewline
    $choice = Read-Host

    $num = 0
    if (-not [int]::TryParse($choice, [ref]$num) -or $num -lt 1 -or $num -gt $list.Count) {
        Write-Host "Operacao cancelada." -ForegroundColor DarkYellow
        Start-Sleep -Seconds 1
        return
    }

    $selectedSnapshot = $list[$num - 1]

    Write-Host ""
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
    Write-Host " ATENCAO: Voce selecionou o ponto:" -ForegroundColor Yellow
    Write-Host " Nome      : $($selectedSnapshot.Folder)" -ForegroundColor White
    Write-Host " Data      : $($selectedSnapshot.Date)" -ForegroundColor Green
    Write-Host " Descricao : $($selectedSnapshot.Description)" -ForegroundColor Gray
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
    Write-Host "Confirma a restauracao total do projeto para este ponto? (S/N): " -ForegroundColor Red -NoNewline
    $confirm = Read-Host

    if ($confirm -notmatch '^[Ss]$') {
        Write-Host "Restauracao cancelada pelo usuario." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
        return
    }

    Write-Host ""
    Write-Host ">> [1/2] Criando backup de seguranca automatico do estado atual..." -ForegroundColor Cyan
    $safetyName = "Auto_Safety_Backup_Antes_De_Restaurar_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    $safetyDir = Join-Path $BackupBaseDir $safetyName
    New-Item -ItemType Directory -Path $safetyDir -Force | Out-Null
    
    $itemsToCopy = @("src", "public", "scripts", "supabase", ".env.local", "package.json", "package-lock.json", "tsconfig.json", "next.config.mjs", "tailwind.config.ts", "postcss.config.mjs", "vercel.json", "AGENTS.md")
    foreach ($item in $itemsToCopy) {
        $srcPath = Join-Path $ProjectRoot $item
        if (Test-Path $srcPath) {
            $destPath = Join-Path $safetyDir $item
            if (Test-Path $srcPath -PathType Container) {
                robocopy $srcPath $destPath /E /XF *.log /XD .next node_modules .vercel /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
            } else {
                Copy-Item -Path $srcPath -Destination $destPath -Force
            }
        }
    }

    Write-Host ">> [2/2] Restaurando arquivos a partir do ponto '$($selectedSnapshot.Folder)'..." -ForegroundColor Green

    $sourceSnapshotPath = $selectedSnapshot.FullPath
    $snapshotItems = Get-ChildItem -Path $sourceSnapshotPath
    foreach ($sItem in $snapshotItems) {
        if ($sItem.Name -eq "snapshot_metadata.json") { continue }
        
        $destPath = Join-Path $ProjectRoot $sItem.Name
        if ($sItem.PSIsContainer) {
            if (Test-Path $destPath) {
                Remove-Item -Path $destPath -Recurse -Force | Out-Null
            }
            robocopy $sItem.FullName $destPath /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
        } else {
            Copy-Item -Path $sItem.FullName -Destination $destPath -Force
        }
    }

    Write-Host ""
    Write-Host "[SUCESSO] O PROJETO FOI RESTAURADO COM EXITO PARA O PONTO SELECIONADO!" -ForegroundColor Green
    Write-Host "Um backup de seguranca do estado anterior foi salvo em '$safetyName'." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor DarkYellow
    $null = [Console]::ReadKey($true)
}

function Delete-Snapshot {
    Show-Header
    Write-Host ""
    Write-Host "[-] EXCLUIR PONTO DE RESTAURACAO ARQUIVADO" -ForegroundColor Red
    Write-Host ""

    $list = Get-SnapshotsList
    if ($list.Count -eq 0) {
        Write-Host "Nenhum ponto de restauracao cadastrado." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Pressione qualquer tecla para voltar..." -ForegroundColor DarkYellow
        $null = [Console]::ReadKey($true)
        return
    }

    $i = 1
    foreach ($s in $list) {
        Write-Host " [$i] " -ForegroundColor Yellow -NoNewline
        Write-Host "$($s.Folder)" -ForegroundColor White -NoNewline
        Write-Host " ($($s.Date))" -ForegroundColor Green
        Write-Host "     Descricao: $($s.Description)" -ForegroundColor Gray
        $i++
    }

    Write-Host ""
    Write-Host "Digite o NUMERO do ponto que deseja excluir (ou 0 para cancelar): " -ForegroundColor Yellow -NoNewline
    $choice = Read-Host

    $num = 0
    if (-not [int]::TryParse($choice, [ref]$num) -or $num -lt 1 -or $num -gt $list.Count) {
        Write-Host "Operacao cancelada." -ForegroundColor DarkYellow
        Start-Sleep -Seconds 1
        return
    }

    $selectedSnapshot = $list[$num - 1]
    Write-Host "Confirma a exclusao de '$($selectedSnapshot.Folder)'? (S/N): " -ForegroundColor Red -NoNewline
    $confirm = Read-Host
    if ($confirm -match '^[Ss]$') {
        Remove-Item -Path $selectedSnapshot.FullPath -Recurse -Force
        Write-Host ""
        Write-Host "[SUCESSO] Ponto de restauracao excluido." -ForegroundColor Green
    } else {
        Write-Host "Operacao cancelada." -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 1
}

function Main-Menu {
    while ($true) {
        Show-Header
        Write-Host " [1] [CRIAR]     Criar Novo Ponto de Restauracao (Salvar Estado Atual)" -ForegroundColor Green
        Write-Host " [2] [RESTAURAR] Restaurar Projeto para um Ponto Gravado (Desfazer Alteracoes)" -ForegroundColor Cyan
        Write-Host " [3] [LISTAR]    Ver Lista de Todos os Pontos Gravados no Cofre" -ForegroundColor Yellow
        Write-Host " [4] [EXCLUIR]   Excluir um Ponto de Restauracao Antigo" -ForegroundColor Magenta
        Write-Host " [5] [TESTAR]    Executar Teste de Compilacao Local (npm run build)" -ForegroundColor White
        Write-Host " [6] [DEPLOY]    Fazer Deploy de Producao na Vercel" -ForegroundColor Blue
        Write-Host " [0] [SAIR]      Encerrar Gerenciador" -ForegroundColor DarkGray
        Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "Escolha uma opcao (0-6): " -ForegroundColor Yellow -NoNewline
        $opt = Read-Host

        switch ($opt) {
            "1" { Create-Snapshot }
            "2" { Restore-Snapshot }
            "3" { List-Snapshots }
            "4" { Delete-Snapshot }
            "5" { 
                Show-Header
                Write-Host ""
                Write-Host ">> Executando npm run build..." -ForegroundColor Cyan
                Set-Location $ProjectRoot
                npm run build
                Write-Host ""
                Write-Host "Pressione qualquer tecla para voltar ao menu..." -ForegroundColor DarkYellow
                $null = [Console]::ReadKey($true)
            }
            "6" {
                Show-Header
                Write-Host ""
                Write-Host ">> Executando deploy na Vercel..." -ForegroundColor Cyan
                Set-Location $ProjectRoot
                npx vercel --prod --yes
                Write-Host ""
                Write-Host "Pressione qualquer tecla para voltar ao menu..." -ForegroundColor DarkYellow
                $null = [Console]::ReadKey($true)
            }
            "0" { 
                Write-Host ""
                Write-Host "Encerrando gerenciador de pontos de restauracao. Ate breve!" -ForegroundColor Cyan
                Start-Sleep -Seconds 1
                break 
            }
            default {
                Write-Host "Opcao invalida. Tente novamente." -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
    }
}

if ($Action -eq "create") {
    Create-Snapshot -Name $SnapshotName -DescriptionText $Description
} elseif ($Action -eq "restore") {
    Restore-Snapshot
} elseif ($Action -eq "list") {
    List-Snapshots
} else {
    Main-Menu
}
