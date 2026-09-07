#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/atualizar_biblioteca_plataforma.py
=========================================
Mescla o acervo histórico (preservando capas da Google Books API, ISBNs, páginas
e descrições pedagógicas) com as 4.617 obras catalogadas do novo manifesto.
Atualiza diretamente 'src/lib/bibliotecaData.json' para exibição instantânea no LMS.
"""

import json
import unicodedata
from pathlib import Path

OLD_DATA_PATH = Path(r"c:\Projetos\seminario\Koinonia-LMS\src\lib\bibliotecaData.json")
MANIFEST_PATH = Path(r"c:\Projetos\seminario\Koinonia-LMS\data\biblioteca_manifest.json")

def norm_key(s: str) -> str:
    if not s:
        return ""
    nfkd = unicodedata.normalize('NFKD', s)
    ascii_str = nfkd.encode('ASCII', 'ignore').decode('ASCII').lower()
    return "".join(c for c in ascii_str if c.isalnum())

def main():
    print("=== ATUALIZAÇÃO DO ACERVO DA PLATAFORMA KOINONIA LMS ===")
    
    with open(OLD_DATA_PATH, "r", encoding="utf-8") as f:
        old_books = json.load(f)
    print(f"Acervo anterior em bibliotecaData.json: {len(old_books)} livros.")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    new_obras = manifest["obras"]
    print(f"Obras ativas no novo manifesto: {len(new_obras)} livros.")

    # Índices dos livros antigos para enriquecimento
    by_hash = {}
    by_title_key = {}
    by_path_key = {}

    for b in old_books:
        bid = b.get("id")
        h = b.get("hash") or b.get("md5")
        if h:
            by_hash[h.lower()] = b
        
        t_key = norm_key(b.get("title", ""))
        if t_key:
            by_title_key[t_key] = b
            
        p_key = norm_key(b.get("path", ""))
        if p_key:
            by_path_key[p_key] = b

    updated_books = []
    enriched_covers = 0
    enriched_descriptions = 0
    seen_ids = set()

    for item in new_obras:
        # Identifica match nos livros antigos
        matched_old = None
        h = (item.get("hash") or "").lower()
        if h and h in by_hash:
            matched_old = by_hash[h]
        elif norm_key(item.get("titulo", "")) in by_title_key:
            matched_old = by_title_key[norm_key(item.get("titulo", ""))]
        elif norm_key(item.get("caminho_relativo", "")) in by_path_key:
            matched_old = by_path_key[norm_key(item.get("caminho_relativo", ""))]

        # ID único
        book_id = item["id"]
        if matched_old and matched_old.get("id"):
            book_id = matched_old["id"]
        
        # Garante unicidade do ID
        if book_id in seen_ids:
            book_id = f"{book_id}_{len(seen_ids)}"
        seen_ids.add(book_id)

        # Drive URL
        drive_id = item.get("drive_id")
        if drive_id:
            drive_url = f"https://drive.google.com/open?id={drive_id}&usp=drive_copy"
        elif matched_old and matched_old.get("drive_url"):
            drive_url = matched_old["drive_url"]
        else:
            drive_url = "https://drive.google.com/drive/folders/1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf?usp=sharing"

        # Capa e Descrição
        cover_url = None
        description = None
        publisher = None
        pages = None
        year = None
        isbn = None

        if matched_old:
            cover_url = matched_old.get("cover_url")
            description = matched_old.get("description")
            publisher = matched_old.get("publisher")
            pages = matched_old.get("pages")
            year = matched_old.get("year")
            isbn = matched_old.get("isbn")

        if cover_url:
            enriched_covers += 1
        if description:
            enriched_descriptions += 1
        else:
            author_str = item.get("autor") or "Diversos"
            description = f"Obra de referência acadêmica em {item['categoria']}. Autor: {author_str} • Acervo Digital do Seminário Koinonia."

        final_book = {
            "id": book_id,
            "title": item["titulo"],
            "author": item["autor"],
            "category": item["categoria"],
            "size": item["tamanho_bytes"],
            "date": "2026-09-06T20:00:00.000Z",
            "mime": "application/pdf",
            "path": item["caminho_relativo"],
            "drive_url": drive_url,
            "description": description,
            "is_custom": False
        }

        if item.get("subcategoria"):
            final_book["subcategoria"] = item["subcategoria"]
        if cover_url:
            final_book["cover_url"] = cover_url
        if publisher:
            final_book["publisher"] = publisher
        if pages:
            final_book["pages"] = pages
        if year:
            final_book["year"] = str(year)
        if isbn:
            final_book["isbn"] = isbn

        updated_books.append(final_book)

    print(f"\nTotal de obras montadas para a plataforma: {len(updated_books)}")
    print(f"Livros com capas preservadas/enriquecidas: {enriched_covers}")
    print(f"Livros com descrições preservadas: {enriched_descriptions}")

    # Salva o arquivo final atualizado
    with open(OLD_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(updated_books, f, indent=2, ensure_ascii=False)

    print(f"\nArquivo '{OLD_DATA_PATH}' atualizado com sucesso!")

if __name__ == "__main__":
    main()
