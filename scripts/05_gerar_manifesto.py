#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/05_gerar_manifesto.py
=============================
Gera o arquivo 'data/biblioteca_manifest.json' com os metadados completos
da Biblioteca FMB pronto para integração e sincronização com o banco de dados
do Koinonia LMS.

Uso:
  python scripts/05_gerar_manifesto.py
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")
CATALOGO_DRIVE = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\drive_files_catalog.json")
MANIFESTO_PATH = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\biblioteca_manifest.json")

def extract_author_title(filename: str):
    stem = Path(filename).stem
    if " - " in stem:
        parts = stem.split(" - ", 1)
        author = parts[0].strip()
        title = parts[1].strip()
    else:
        author = "Diversos / Não Especificado"
        title = stem.strip()
    return author, title

def main():
    print(f"=== ETAPA 5: GERAÇÃO DO MANIFESTO JSON DA BIBLIOTECA FMB ===", flush=True)
    print(f"Raiz da Biblioteca: {BASE_DIR}", flush=True)
    print(f"Destino do Manifesto: {MANIFESTO_PATH}", flush=True)

    if not BASE_DIR.exists():
        print(f"ERRO: Pasta não encontrada: {BASE_DIR}", flush=True)
        sys.exit(1)

    # 1. Carrega catálogo da nuvem para correlacionar hashes e IDs oficiais
    drive_by_size = defaultdict(list)
    if CATALOGO_DRIVE.exists():
        with open(CATALOGO_DRIVE, "r", encoding="utf-8") as f:
            cat = json.load(f)
        for item in cat:
            if item.get("mimeType") != "application/vnd.google-apps.folder":
                sz = int(item.get("size", 0))
                drive_by_size[sz].append(item)
        print(f"Catálogo do Drive carregado com {len(cat)} registros.", flush=True)

    obras = []
    total_scanned = 0

    for root, dirs, files in os.walk(BASE_DIR):
        root_path = Path(root)
        # Ignora pastas de controle
        if "00. DUPLICATAS_REVISAR" in root_path.parts or "00. EXPURGO_PENDENTE_APROVACAO" in root_path.parts:
            continue

        for f in files:
            if not f.lower().endswith(".pdf"):
                continue

            full_path = root_path / f
            rel_path = full_path.relative_to(BASE_DIR)
            rel_path_str = str(rel_path).replace("\\", "/")

            # Categoria raiz (uma das 17 pastas mestras)
            categoria = rel_path.parts[0] if len(rel_path.parts) > 1 else "Geral"
            subcategoria = rel_path.parts[1] if len(rel_path.parts) > 2 else None
            author, title = extract_author_title(f)

            try:
                stat = full_path.stat()
                size_bytes = stat.st_size

                # Correlaciona com hash MD5 do Google Drive
                md5_hash = None
                drive_id = None
                if size_bytes in drive_by_size:
                    cands = drive_by_size[size_bytes]
                    # Tenta match exato de nome ou primeiro por tamanho
                    matched = None
                    for c in cands:
                        if c.get("name") == f:
                            matched = c
                            break
                    if not matched and len(cands) == 1:
                        matched = cands[0]
                    elif not matched and len(cands) > 0:
                        matched = cands[0]

                    if matched:
                        md5_hash = matched.get("md5Checksum")
                        drive_id = matched.get("id")

                if not md5_hash:
                    # Fallback para ID determinístico baseado no caminho e tamanho
                    md5_hash = hashlib.md5(f"{rel_path_str}:{size_bytes}".encode("utf-8")).hexdigest()

                item = {
                    "id": f"fmb_{md5_hash[:12]}",
                    "drive_id": drive_id,
                    "titulo": title,
                    "autor": author,
                    "categoria": categoria,
                    "subcategoria": subcategoria,
                    "formato": "pdf",
                    "tamanho_bytes": size_bytes,
                    "tamanho_formatado": f"{size_bytes / (1024*1024):.2f} MB",
                    "hash": md5_hash,
                    "caminho_relativo": rel_path_str
                }
                obras.append(item)
                total_scanned += 1
                if total_scanned % 500 == 0:
                    print(f"  Indexados {total_scanned} livros...", flush=True)
            except Exception as e:
                print(f"Erro ao processar {rel_path}: {e}", flush=True)

    # Ordena por Categoria e Título
    obras.sort(key=lambda x: (x["categoria"], x["titulo"]))

    # Estatísticas por categoria
    stats_categoria = defaultdict(int)
    for o in obras:
        stats_categoria[o["categoria"]] += 1

    manifesto = {
        "metadata": {
            "nome_repositorio": "Biblioteca Digital FMB",
            "instituicao": "Seminário Teológico Congregacional Koinonia",
            "plataforma": "Koinonia LMS",
            "total_obras_ativas": len(obras),
            "data_geracao": "2026-09-06",
            "estatisticas_por_categoria": dict(stats_categoria)
        },
        "obras": obras
    }

    MANIFESTO_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFESTO_PATH, "w", encoding="utf-8") as f:
        json.dump(manifesto, f, indent=2, ensure_ascii=False)

    print(f"\nManifesto JSON gerado com sucesso!", flush=True)
    print(f"Total de obras teológicas ativas catalogadas: {len(obras)}", flush=True)
    print(f"Arquivo salvo em: {MANIFESTO_PATH}", flush=True)
    print(f"\n--- DISTRIBUIÇÃO DAS OBRAS POR CATEGORIA MESTRA ---")
    for cat, count in sorted(stats_categoria.items()):
        print(f"  {cat}: {count} livros")

if __name__ == "__main__":
    main()
