#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/02_expurgo_nao_livros.py
================================
Identifica documentos administrativos, rascunhos de TCC, relatórios de estágio,
formulários e arquivos não-bibliográficos na Biblioteca FMB usando o catálogo
estruturado do Google Drive.

Gera o relatório 'data/candidatos_expurgo.md' para revisão e oferece quarentena
controlada em '00. EXPURGO_PENDENTE_APROVACAO'.

Uso:
  python scripts/02_expurgo_nao_livros.py --dry-run
  python scripts/02_expurgo_nao_livros.py --execute
"""

import os
import re
import sys
import json
import shutil
import argparse
from pathlib import Path

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")
DEST_QUARENTENA = BASE_DIR / "00. EXPURGO_PENDENTE_APROVACAO"
CATALOGO_JSON = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\drive_files_catalog.json")
RELATORIO_MD = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\candidatos_expurgo.md")
RELATORIO_JSON = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\candidatos_expurgo.json")
ROOT_FOLDER_ID = "1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf"

# Padrões com limites de palavras (\b) para evitar falsos positivos
RE_PATTERNS = [
    (re.compile(r'\b(tcc|tce|tceo)\b', re.IGNORECASE), "Sigla de TCC ou Estágio"),
    (re.compile(r'est[aá]gio\s+supervisionado', re.IGNORECASE), "Documento de Estágio"),
    (re.compile(r'declara[cç][aã]o\s+de\s+(apresenta|aceita|est[aá]gio)', re.IGNORECASE), "Declaração de Estágio"),
    (re.compile(r'termo\s+de\s+compromisso', re.IGNORECASE), "Termo de Compromisso"),
    (re.compile(r'relat[oó]rio\s+final\s+(do\s+)?est[aá]gio', re.IGNORECASE), "Relatório de Estágio"),
    (re.compile(r'projeto\s+de\s+pesquisa\s+daniel', re.IGNORECASE), "Projeto de Pesquisa Pessoal"),
    (re.compile(r'tcc\s+(incompleto|daniel)', re.IGNORECASE), "Rascunho de TCC Pessoal"),
    (re.compile(r'\b(comprovante|boleto|nota\s+fiscal|recibo)\b', re.IGNORECASE), "Documento Financeiro"),
    (re.compile(r'links?\s+de\s+presen[cç]a', re.IGNORECASE), "Formulário de Presença"),
    (re.compile(r'\b(gabarito|frequ[eê]ncia)\b', re.IGNORECASE), "Controle Administrativo"),
    (re.compile(r'^\d+\s*-\s*atividade', re.IGNORECASE), "Atividade Escolar Avulsa"),
]

# Extensões que não são livros acadêmicos
NON_BOOK_EXTENSIONS = {'.mp4', '.mp3', '.rar', '.zip', '.heic', '.jpg', '.png', '.crdownload', '.xlsx', '.xls'}

def build_folder_paths(folders_dict):
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

def main():
    parser = argparse.ArgumentParser(description="Identificação e Quarentena de Não-Livros")
    parser.add_argument("--execute", action="store_true", help="Move arquivos para pasta de quarentena")
    parser.add_argument("--dry-run", action="store_true", help="Apenas gera o relatório sem mover")
    args = parser.parse_args()

    if not args.execute and not args.dry_run:
        print("Defina --dry-run ou --execute. Abortando.", flush=True)
        sys.exit(1)

    print(f"=== ETAPA 2: IDENTIFICAÇÃO E EXPURGO DE NÃO-LIVROS ===", flush=True)
    print(f"Modo: {'EXECUÇÃO REAL (QUARENTENA)' if args.execute else 'SIMULAÇÃO (DRY-RUN)'}", flush=True)
    print(f"Raiz: {BASE_DIR}", flush=True)

    with open(CATALOGO_JSON, "r", encoding="utf-8") as f:
        catalog_items = json.load(f)

    folders = {}
    files = []
    for it in catalog_items:
        if it.get("mimeType") == "application/vnd.google-apps.folder":
            folders[it["id"]] = it
        else:
            files.append(it)

    folder_paths = build_folder_paths(folders)

    candidatos = []
    for f in files:
        fname = f.get("name", "")
        if fname.startswith(('.', 'desktop.ini', 'Thumbs.db')):
            continue

        parents = f.get("parents", [])
        if not parents or parents[0] not in folder_paths:
            continue

        dir_rel = folder_paths[parents[0]]
        rel_path = f"{dir_rel}/{fname}" if dir_rel else fname
        rel_path_win = rel_path.replace("/", "\\")

        # Não analisa o que já foi movido para duplicatas ou quarentena
        if "00. DUPLICATAS_REVISAR" in rel_path_win or "00. EXPURGO_PENDENTE_APROVACAO" in rel_path_win:
            continue

        ext = Path(fname).suffix.lower()
        motivo = None

        # 1. Regex de nomes administrativos
        for pattern, desc in RE_PATTERNS:
            if pattern.search(fname):
                motivo = desc
                break

        # 2. Extensões não-livro
        if not motivo and ext in NON_BOOK_EXTENSIONS:
            motivo = f"Formato não bibliográfico ({ext})"

        if motivo:
            local_full = BASE_DIR / rel_path_win
            sz_kb = int(f.get("size", 0)) / 1024
            candidatos.append({
                "id": f["id"],
                "nome": fname,
                "tamanho_kb": sz_kb,
                "motivo": motivo,
                "rel_path": rel_path_win,
                "local_path": local_full
            })

    print(f"Total de arquivos no catálogo: {len(files)}", flush=True)
    print(f"Candidatos a expurgo identificados: {len(candidatos)}", flush=True)

    # Gera relatório Markdown
    RELATORIO_MD.parent.mkdir(parents=True, exist_ok=True)
    with open(RELATORIO_MD, "w", encoding="utf-8") as f:
        f.write("# Relatório de Candidatos a Expurgo da Biblioteca FMB\n\n")
        f.write(f"> **Total Identificado:** {len(candidatos)} itens  \n")
        f.write(f"> **Critério:** Rascunhos de TCC, formulários de estágio, termos administrativos e mídias não-bibliográficas.  \n\n")
        f.write("---\n\n")
        f.write("| # | Arquivo | Tamanho | Motivo / Categoria | Caminho Original |\n")
        f.write("|---|---|---|---|---|\n")
        for i, c in enumerate(candidatos, 1):
            f.write(f"| {i} | `{c['nome']}` | {c['tamanho_kb']:.1f} KB | {c['motivo']} | `{c['rel_path']}` |\n")

    # Gera JSON
    with open(RELATORIO_JSON, "w", encoding="utf-8") as f:
        json.dump([
            {
                "id": c["id"],
                "nome": c["nome"],
                "tamanho_kb": c["tamanho_kb"],
                "motivo": c["motivo"],
                "rel_path": c["rel_path"]
            }
            for c in candidatos
        ], f, indent=2, ensure_ascii=False)

    print(f"Relatório Markdown salvo em: {RELATORIO_MD}", flush=True)
    print(f"Relatório JSON salvo em: {RELATORIO_JSON}", flush=True)

    # Move para quarentena se --execute
    if args.execute:
        DEST_QUARENTENA.mkdir(parents=True, exist_ok=True)
        print(f"\nMovendo {len(candidatos)} arquivos para quarentena '{DEST_QUARENTENA.name}'...", flush=True)
        sucessos = 0
        nao_encontrados = 0
        for c in candidatos:
            origem = c["local_path"]
            if not origem.exists():
                nao_encontrados += 1
                continue
            try:
                dest_file = DEST_QUARENTENA / c["nome"]
                if dest_file.exists():
                    dest_file = DEST_QUARENTENA / f"{origem.stem}_dup{origem.suffix}"
                shutil.move(str(origem), str(dest_file))
                sucessos += 1
            except Exception as e:
                print(f"Erro ao mover {c['nome']}: {e}", flush=True)
        print(f"Concluído! {sucessos} movidos com sucesso. {nao_encontrados} ausentes no disco local.", flush=True)
    else:
        print(f"\n[DRY-RUN] Nenhum arquivo foi movido fisicamente. Consulte os relatórios para validação.", flush=True)

if __name__ == "__main__":
    main()
