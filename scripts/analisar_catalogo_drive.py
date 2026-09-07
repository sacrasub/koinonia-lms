import json
from collections import defaultdict
from pathlib import Path

with open('data/drive_files_catalog.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total de itens carregados: {len(items)}")

folders = {}
files = []
for it in items:
    if it.get('mimeType') == 'application/vnd.google-apps.folder':
        folders[it['id']] = it
    else:
        files.append(it)

print(f"Pastas: {len(folders)}, Arquivos: {len(files)}")

# Agrupa por md5Checksum
by_md5 = defaultdict(list)
pdfs = [f for f in files if f.get('name', '').lower().endswith('.pdf')]
print(f"Total de PDFs: {len(pdfs)}")

for f in pdfs:
    md5 = f.get('md5Checksum')
    if md5:
        by_md5[md5].append(f)

dups_md5 = {k: v for k, v in by_md5.items() if len(v) > 1}
total_dup_copies = sum(len(v) - 1 for v in dups_md5.values())

print(f"\n--- ANÁLISE DE DUPLICATAS REAIS ---")
print(f"Grupos com hash MD5 idêntico: {len(dups_md5)}")
print(f"Total de arquivos que são cópias duplicadas a mover: {total_dup_copies}")

# Mostra exemplos
top_dups = sorted(dups_md5.items(), key=lambda x: len(x[1]), reverse=True)[:5]
print("\nTop 5 arquivos com mais cópias duplicadas:")
for md5, flist in top_dups:
    print(f"Hash {md5[:10]}... ({len(flist)} cópias):")
    for f in flist:
        p_name = f.get('name')
        f_id = f.get('id')
        sz = int(f.get('size', 0)) / (1024*1024)
        print(f"   - {p_name} ({sz:.2f} MB)")
