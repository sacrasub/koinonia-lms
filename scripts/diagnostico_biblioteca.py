import os
import sys
from pathlib import Path

def log(msg):
    print(msg, flush=True)

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")

log(f"=== DIAGNÓSTICO DA BIBLIOTECA FMB ===")
log(f"Raiz: {BASE_DIR}")

# 1. Pastas da Raiz
log("\n--- 1. PASTAS NA RAIZ ---")
root_dirs = sorted([d for d in BASE_DIR.iterdir() if d.is_dir()])
for d in root_dirs:
    count = len(list(d.iterdir()))
    log(f"[{d.name}] -> {count} itens diretos")

# 2. Inspecionar '17 - Recomendados'
log("\n--- 2. CONTEÚDO DE '17 - Recomendados' ---")
rec_dir = BASE_DIR / "17 - Recomendados"
for item in sorted(rec_dir.iterdir()):
    if item.is_dir():
        count = len(list(item.iterdir()))
        log(f"  [DIR] {item.name} ({count} itens)")
    else:
        log(f"  [FILE] {item.name}")

# 3. Inspecionar 'Livros Daniel'
log("\n--- 3. SUBPASTAS DENTRO DE 'Livros Daniel' ---")
daniel_candidates = [d for d in rec_dir.iterdir() if "daniel" in d.name.lower()]
if daniel_candidates:
    daniel_dir = daniel_candidates[0]
    log(f"Diretório Daniel Encontrado: {daniel_dir.name}")
    sub_daniel = sorted([d for d in daniel_dir.iterdir() if d.is_dir()])
    log(f"Total de subpastas em '{daniel_dir.name}': {len(sub_daniel)}")
    for sd in sub_daniel:
        files = list(sd.iterdir())
        pdfs = [f for f in files if f.suffix.lower() == '.pdf']
        log(f"    - {sd.name} (Total: {len(files)}, PDFs: {len(pdfs)})")
