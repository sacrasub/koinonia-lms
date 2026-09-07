#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/04_normalizar_nomes.py
==============================
Renomeia os PDFs restantes no padrão "Autor - Título da Obra.pdf",
removendo underscores, sufixos de sites, caixas altas excessivas
e caracteres especiais quebrados.

Uso:
  python -u scripts/04_normalizar_nomes.py --dry-run
  python -u scripts/04_normalizar_nomes.py --execute
"""

import os
import re
import sys
try:
    import ftfy
except ImportError:
    ftfy = None

import argparse
from pathlib import Path

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")

# Palavras que devem ficar em minúsculas no Title Case (exceto no início)
LOWERCASE_WORDS = {
    "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas",
    "e", "ou", "a", "o", "as", "os", "para", "por", "com", "sem",
    "sob", "sobre", "um", "uma", "uns", "umas"
}

def clean_noise(text: str) -> str:
    """Remove ruídos comuns de download e tags inúteis"""
    # Remove marcas de repositório
    text = re.sub(r'\(z-lib\.org\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[.*?z-lib.*?\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[.*?lelivros.*?\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[.*?docero.*?\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\(Livros Daniel\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\.pdf$', '', text, flags=re.IGNORECASE)
    
    # Corrige encoding quebrado se ftfy estiver disponível
    if ftfy is not None:
        try:
            text = ftfy.fix_text(text)
        except Exception:
            pass

    # Underscore isolado cercado por espaços ou traves são separadores
    text = re.sub(r'\s+[_–—]\s+', ' - ', text)
    # Underscores comuns viram espaços
    text = text.replace('_', ' ')
    
    # Remove caracteres de interrogação ou losango preto de codificação
    text = text.replace('\ufffd', '').replace('', '')

    # Remove múltiplos hífens ou hífens no início/fim
    text = re.sub(r'(\s*-\s*)+', ' - ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip(" -_")

def smart_title(text: str) -> str:
    """Aplica Title Case acadêmico respeitando conectivos em minúsculas"""
    words = text.split()
    if not words:
        return ""
    
    res = []
    for i, w in enumerate(words):
        wl = w.lower()
        if i > 0 and wl in LOWERCASE_WORDS:
            res.append(wl)
        else:
            # Preserva acrônimos tipo NT, AT, ABNT, LMS, FMB se já em maiúsculas
            if len(w) > 1 and w.isupper() and len(w) <= 4:
                res.append(w)
            else:
                res.append(w.capitalize())
    return " ".join(res)

def normalize_book_filename(filename: str) -> str:
    cleaned = clean_noise(filename)
    
    # Se contiver separador " - ", divide em Autor e Título
    if ' - ' in cleaned:
        parts = cleaned.split(' - ', 1)
        autor_part = smart_title(parts[0].strip())
        titulo_part = smart_title(parts[1].strip())
        final_stem = f"{autor_part} - {titulo_part}"
    else:
        # Tenta detectar se começa com "Por [Autor]" ou similar
        final_stem = smart_title(cleaned)

    # Limpeza final de pontuação estranha
    final_stem = re.sub(r'\s+', ' ', final_stem).strip(" -_")
    return f"{final_stem}.pdf"

def main():
    parser = argparse.ArgumentParser(description="Normalização de nomes de arquivos PDF")
    parser.add_argument("--execute", action="store_true", help="Aplica as renomeações físicas")
    parser.add_argument("--dry-run", action="store_true", help="Apenas simula e exibe amostra")
    args = parser.parse_args()

    if not args.execute and not args.dry_run:
        print("Defina --dry-run ou --execute. Abortando.", flush=True)
        sys.exit(1)

    print(f"=== ETAPA 4: NORMALIZAÇÃO DE NOMES DE LIVROS ===", flush=True)
    print(f"Modo: {'EXECUÇÃO REAL' if args.execute else 'SIMULAÇÃO (DRY-RUN)'}", flush=True)
    print(f"Raiz: {BASE_DIR}", flush=True)

    total_analisados = 0
    total_a_renomear = 0
    renomeacoes = []

    for root, dirs, files in os.walk(BASE_DIR):
        root_path = Path(root)
        # Ignora pastas de duplicatas e quarentena
        if "00. DUPLICATAS_REVISAR" in root_path.parts or "00. EXPURGO_PENDENTE_APROVACAO" in root_path.parts:
            continue

        for f in files:
            if not f.lower().endswith(".pdf"):
                continue

            total_analisados += 1
            novo_nome = normalize_book_filename(f)

            if novo_nome != f:
                total_a_renomear += 1
                renomeacoes.append((root_path / f, root_path / novo_nome, f, novo_nome))

    print(f"\nTotal de PDFs analisados: {total_analisados}", flush=True)
    print(f"Total de PDFs com necessidade de normalização: {total_a_renomear}", flush=True)

    print("\nAmostra de renomeações (primeiros 20):", flush=True)
    for orig_path, new_path, orig_name, new_name in renomeacoes[:20]:
        print(f"  [ANTES]: {orig_name}", flush=True)
        print(f"  [DEPOIS]: {new_name}\n", flush=True)

    if args.execute:
        print(f"Aplicando renomeações físicas em {len(renomeacoes)} arquivos...", flush=True)
        sucessos = 0
        erros = 0
        for orig_path, new_path, orig_name, new_name in renomeacoes:
            try:
                # Se o arquivo de destino já existir, não sobrescreve
                if new_path.exists() and new_path != orig_path:
                    new_path = new_path.parent / f"{new_path.stem}_alt{new_path.suffix}"
                
                orig_path.rename(new_path)
                sucessos += 1
            except Exception as e:
                print(f"Erro ao renomear {orig_name}: {e}", flush=True)
                erros += 1
        print(f"Concluído! Sucessos: {sucessos}, Erros: {erros}", flush=True)
    else:
        print(f"[DRY-RUN] Simulação concluída. Use --execute para aplicar.", flush=True)

if __name__ == "__main__":
    main()
