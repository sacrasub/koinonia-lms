#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/01_deduplica_hash.py
=============================
Mapeia e identifica todas as duplicatas da Biblioteca FMB usando os hashes oficiais
do Google Drive e os caminhos locais sincronizados.
Move todas as cópias excedentes para "00. DUPLICATAS_REVISAR".

Uso:
  python scripts/01_deduplica_hash.py --dry-run
  python scripts/01_deduplica_hash.py --execute
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")
DEST_DUPLICATAS = BASE_DIR / "00. DUPLICATAS_REVISAR"
CATALOGO_JSON = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\drive_files_catalog.json")
RELATORIO_PATH = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\relatorio_duplicatas.json")
ROOT_FOLDER_ID = "1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf"

def build_folder_paths(folders_dict):
    """
    Reconstrói o caminho relativo de cada pasta a partir do ROOT_FOLDER_ID.
    """
    memo = {ROOT_FOLDER_ID: ""}

    def get_path(fid):
        if fid in memo:
            return memo[fid]
        if fid not in folders_dict:
            return None
        folder = folders_dict[fid]
        parents = folder.get("parents", [])
        if not parents:
            memo[fid] = folder["name"]
            return memo[fid]
        parent_id = parents[0]
        parent_path = get_path(parent_id)
        if parent_path is None:
            memo[fid] = folder["name"]
        elif parent_path == "":
            memo[fid] = folder["name"]
        else:
            memo[fid] = f"{parent_path}/{folder['name']}"
        return memo[fid]

    for fid in folders_dict:
        get_path(fid)

    return memo

def score_file_quality(rel_path_str: str, file_name: str) -> int:
    """
    Pontuação para escolher a cópia canônica:
    - Obras em pastas 01 a 16 ganham +50 pontos
    - Fora de '17 - Recomendados' ganha +30 pontos
    - Fora de 'Livros Daniel' ganha +20 pontos
    - Nome mais limpo (sem 'dup', sem '(1)', sem underscores) ganha pontos
    - Menor profundidade ganha pontos
    """
    score = 100
    norm = rel_path_str.replace("\\", "/")
    parts = norm.split("/")
    score -= len(parts) * 5

    if any(f"{i:02d} - " in norm for i in range(1, 17)):
        score += 50
    if "17 - Recomendados" not in norm:
        score += 30
    if "Livros Daniel" not in norm:
        score += 20

    # Penaliza nomes feios ou temporários
    fn_lower = file_name.lower()
    if "(1)" in fn_lower or "(2)" in fn_lower:
        score -= 20
    if "_" in file_name:
        score -= 5
    if "z-lib" in fn_lower:
        score -= 15
    if fn_lower.startswith("pdfcookie") or fn_lower.startswith("docero"):
        score -= 25

    return score

def main():
    parser = argparse.ArgumentParser(description="Deduplicação de PDFs via catálogo de hashes oficiais do Google Drive")
    parser.add_argument("--execute", action="store_true", help="Executa a movimentação física das cópias duplicadas")
    parser.add_argument("--dry-run", action="store_true", help="Apenas simula e gera o relatório")
    args = parser.parse_args()

    if not args.execute and not args.dry_run:
        print("Defina --dry-run ou --execute. Abortando.", flush=True)
        sys.exit(1)

    print(f"=== ETAPA 1: MAPEAMENTO E DEDUPLICAÇÃO DE ARQUIVOS ===", flush=True)
    print(f"Modo: {'EXECUÇÃO REAL' if args.execute else 'SIMULAÇÃO (DRY-RUN)'}", flush=True)
    print(f"Raiz da Biblioteca Local: {BASE_DIR}", flush=True)
    print(f"Destino das Duplicatas: {DEST_DUPLICATAS}", flush=True)

    if not CATALOGO_JSON.exists():
        print(f"Erro: Arquivo de catálogo {CATALOGO_JSON} não encontrado.", flush=True)
        sys.exit(1)

    with open(CATALOGO_JSON, "r", encoding="utf-8") as f:
        catalog_items = json.load(f)

    # Separa pastas e arquivos
    folders = {}
    files = []
    for it in catalog_items:
        if it.get("mimeType") == "application/vnd.google-apps.folder":
            folders[it["id"]] = it
        else:
            files.append(it)

    print(f"Catálogo carregado: {len(folders)} pastas, {len(files)} arquivos.", flush=True)

    # Reconstrói caminhos de pastas
    folder_paths = build_folder_paths(folders)

    # Mapeia arquivos PDFs pertencentes à árvore de Biblioteca FMB
    pdf_entries = []
    for f in files:
        fname = f.get("name", "")
        if not fname.lower().endswith(".pdf"):
            continue

        parents = f.get("parents", [])
        if not parents:
            continue
        pid = parents[0]
        if pid not in folder_paths:
            continue

        dir_rel = folder_paths[pid]
        rel_path = f"{dir_rel}/{fname}" if dir_rel else fname
        rel_path = rel_path.replace("/", "\\")

        # Ignora arquivos que já estejam dentro de 00. DUPLICATAS_REVISAR
        if "00. DUPLICATAS_REVISAR" in rel_path:
            continue

        md5 = f.get("md5Checksum")
        if not md5:
            continue

        local_full = BASE_DIR / rel_path
        pdf_entries.append({
            "id": f["id"],
            "name": fname,
            "size": int(f.get("size", 0)),
            "md5": md5,
            "rel_path": rel_path,
            "local_path": local_full,
            "exists_local": local_full.exists()
        })

    print(f"Total de PDFs ativos mapeados: {len(pdf_entries)}", flush=True)
    present_local = sum(1 for p in pdf_entries if p["exists_local"])
    print(f"PDFs confirmados existentes no disco local: {present_local}", flush=True)

    # Agrupa por hash MD5
    by_hash = defaultdict(list)
    for p in pdf_entries:
        by_hash[p["md5"]].append(p)

    duplicatas_a_mover = []
    relatorio = {
        "total_pdfs": len(pdf_entries),
        "total_grupos_duplicados": 0,
        "total_copias_duplicadas": 0,
        "grupos": []
    }

    for md5, items in by_hash.items():
        if len(items) > 1:
            # Ordena por pontuação de qualidade: o primeiro é o CANÔNICO (mantido)
            sorted_items = sorted(
                items,
                key=lambda x: score_file_quality(x["rel_path"], x["name"]),
                reverse=True
            )
            canonico = sorted_items[0]
            dups = sorted_items[1:]

            grupo_info = {
                "md5": md5,
                "tamanho_bytes": canonico["size"],
                "canonico": {
                    "id": canonico["id"],
                    "caminho": canonico["rel_path"],
                    "nome": canonico["name"]
                },
                "duplicatas": [
                    {
                        "id": d["id"],
                        "caminho": d["rel_path"],
                        "nome": d["name"],
                        "existe_local": d["exists_local"]
                    }
                    for d in dups
                ]
            }
            relatorio["grupos"].append(grupo_info)

            for d in dups:
                duplicatas_a_mover.append((d, canonico))

    relatorio["total_grupos_duplicados"] = len(relatorio["grupos"])
    relatorio["total_copias_duplicadas"] = len(duplicatas_a_mover)

    print(f"\n--- RESULTADO DA IDENTIFICAÇÃO DE DUPLICATAS ---", flush=True)
    print(f"Grupos com hash idêntico: {len(relatorio['grupos'])}", flush=True)
    print(f"Total de cópias excedentes a mover para 00. DUPLICATAS_REVISAR: {len(duplicatas_a_mover)}", flush=True)

    # Salva relatório JSON
    RELATORIO_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(RELATORIO_PATH, "w", encoding="utf-8") as f:
        json.dump(relatorio, f, indent=2, ensure_ascii=False)
    print(f"Relatório gerado em: {RELATORIO_PATH}", flush=True)

    # Movimentação física se --execute
    if args.execute:
        DEST_DUPLICATAS.mkdir(parents=True, exist_ok=True)
        print(f"\n4. Movendo cópias duplicadas para {DEST_DUPLICATAS.name}...", flush=True)
        sucessos = 0
        nao_encontrados = 0
        erros = 0

        for d, canonico in duplicatas_a_mover:
            origem = d["local_path"]
            if not origem.exists():
                nao_encontrados += 1
                continue

            try:
                dest_file = DEST_DUPLICATAS / origem.name
                if dest_file.exists():
                    stem = origem.stem
                    ext = origem.suffix
                    idx = 1
                    while dest_file.exists():
                        dest_file = DEST_DUPLICATAS / f"{stem}_dup{idx}{ext}"
                        idx += 1

                shutil.move(str(origem), str(dest_file))
                sucessos += 1
                if sucessos % 100 == 0:
                    print(f"  Movidos {sucessos}/{len(duplicatas_a_mover)} arquivos...", flush=True)
            except Exception as e:
                print(f"Erro ao mover {origem.name}: {e}", flush=True)
                erros += 1

        print(f"\nConcluído com sucesso!", flush=True)
        print(f"  Arquivos movidos com sucesso: {sucessos}", flush=True)
        print(f"  Arquivos já ausentes/movidos no local: {nao_encontrados}", flush=True)
        print(f"  Erros: {erros}", flush=True)
    else:
        print(f"\n[DRY-RUN] Nenhuma alteração física foi aplicada. Execute com --execute para mover.", flush=True)

if __name__ == "__main__":
    main()
