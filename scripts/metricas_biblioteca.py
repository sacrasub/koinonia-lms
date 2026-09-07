import os
import hashlib
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")

total_pdfs = 0
non_pdf_files = []
pdf_files = []
non_book_candidates = []

NON_BOOK_PATTERNS = [
    "tcc", "estagio", "estgio", "declaracao", "declarao", "termo", "tce", "tceo",
    "frequencia", "frequncia", "presenca", "presena", "checklist", "gabarito",
    "relatorio final", "relatrio final", "ata", "matricula", "matrcula", "curriculo",
    "currculo", "nota fiscal", "comprovante", "boleto", "recibo", "rascunho"
]

print("Contabilizando biblioteca...", flush=True)

for root, dirs, files in os.walk(BASE_DIR):
    for f in files:
        full_path = Path(root) / f
        rel_path = full_path.relative_to(BASE_DIR)
        ext = full_path.suffix.lower()
        
        # Ignora arquivos de sistema
        if f.startswith(('.', 'desktop.ini', 'Thumbs.db')):
            continue
            
        if ext == '.pdf':
            total_pdfs += 1
            pdf_files.append((full_path, rel_path, full_path.stat().st_size))
            
            # Checa não-livros
            f_lower = f.lower()
            if any(p in f_lower for p in NON_BOOK_PATTERNS):
                non_book_candidates.append(rel_path)
        else:
            non_pdf_files.append((rel_path, ext))

print(f"\n--- MÉTRICAS CONSOLIDADAS ---", flush=True)
print(f"Total de PDFs encontrados: {total_pdfs}", flush=True)
print(f"Total de outros arquivos (não-PDF): {len(non_pdf_files)}", flush=True)
print(f"Candidatos a não-livros (TCCs, declarações, etc.): {len(non_book_candidates)}", flush=True)

# Amostragem de não-livros
print("\nAmostra de Não-Livros identificados para expurgo:", flush=True)
for nb in non_book_candidates[:15]:
    print(f"  [EXPURGO CANDIDATO] {nb}", flush=True)

# Amostra de extensões não-PDF
ext_dict = defaultdict(int)
for _, ext in non_pdf_files:
    ext_dict[ext] += 1
print("\nExtensões não-PDF:", dict(ext_dict), flush=True)
