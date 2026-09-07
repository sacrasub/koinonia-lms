#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/03_redistribuir_daniel.py
=================================
Redistribui as subpastas temáticas e de autores de "17 - Recomendados/Livros Daniel"
para as 17 pastas mestras numeradas na raiz da Biblioteca FMB.

Uso:
  python -u scripts/03_redistribuir_daniel.py --dry-run
  python -u scripts/03_redistribuir_daniel.py --execute
"""

import os
import sys
import shutil
import argparse
import unicodedata
from pathlib import Path

BASE_DIR = Path(r"D:\.shortcut-targets-by-id\1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf\Biblioteca FMB")
DANIEL_DIR = BASE_DIR / "17 - Recomendados" / "Livros Daniel"

def norm(text: str) -> str:
    """Normaliza texto removendo acentos e convertendo para minúsculas"""
    return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII').lower().strip()

# Mapa de palavras-chave da pasta de origem -> Pasta mestra na raiz
MAPA_DESTINOS = [
    # 15 - John MacArthur
    (["john macarthur"], "15 - John MacArthur - Obras"),

    # 16 - Coletâneas por Autor
    ([
        "hernandes dias lopes", "r. c. sproul", "sproul", "timothy keller", "keller",
        "john stott", "stott", "john frame", "frame", "josh mcdowell", "mcdowell",
        "justo gonzalez", "gonzalez", "john c. maxwell", "maxwell", "franklin ferreira",
        "augusto cury", "c. s. lewis", "charles spurgeon", "spurgeon", "a. w. tozer", "tozer"
    ], "16 - Coletâneas por Autor"),

    # 01 - Bíblia e Referência
    ([
        "enciclopedia", "dicionario", "geografia biblica", "manual biblico", "mapas",
        "mapa mental", "historia de israel", "genealogia", "historia da biblia", "guia da biblia",
        "guia facil", "historia de jerusalem", "aramaico"
    ], "01 - Bíblia e Referência"),

    # 02 - Exegese e Hermenêutica
    ([
        "hermeneutica", "exegese", "grego", "hebraico", "gramatica", "etimologico",
        "interpretacao", "critica textual"
    ], "02 - Exegese e Hermenêutica"),

    # 03 - Comentários Bíblicos
    ([
        "comentario", "estudos dos livros", "estudo livros", "evangelho", "livro de",
        "habacuque", "hebreus", "levitico", "pentateuco", "ester", "jo", "jeremias",
        "proverbios", "salmos", "genesis", "exodo", "deuteronomio", "atos", "romanos",
        "corintios", "galatas", "efesios", "filipenses", "colossenses", "tessalonicenses",
        "timoteo", "tito", "filemom", "tiago", "pedro", "judas", "apocalipse", "profetas",
        "tesouro de davi"
    ], "03 - Comentários Bíblicos"),

    # 11 - Escatologia
    ([
        "escatologia", "70 semanas", "semanas de daniel", "milenio", "vinda de cristo",
        "arrebatamento", "tribulacao", "anticristo"
    ], "11 - Escatologia"),

    # 12 - História das Religiões
    ([
        "historia das religioes", "judaismo", "espiritismo", "fenomenologia da religiao",
        "religioes", "festas judaica", "outras denominacoes"
    ], "12 - História das Religiões"),

    # 10 - Apologética e Filosofia
    ([
        "apologetica", "seitas", "heresias", "gnosticismo", "iluminismo", "feminismo",
        "fundamentalismo", "maconaria", "filosofia", "ateismo", "evolucionismo",
        "marxismo", "liberalismo", "pragmatismo", "pos-modernismo", "defesa da fe"
    ], "10 - Apologética e Filosofia"),

    # 13 - Doutrinas Específicas
    ([
        "predestinacao", "calvinismo", "arminianismo", "cinco pontos", "lapsarianismo",
        "confissoes", "catecismo", "batismo", "santa ceia", "trindade", "angelologia"
    ], "13 - Doutrinas Específicas"),

    # 04 - Teologia Sistemática
    ([
        "teologia sistematica", "fundamentos da teologia", "atributos de deus",
        "teologia reformada", "dogmatica", "soteriologia", "cristologia", "pneumatologia",
        "antropologia", "hamartiologia"
    ], "04 - Teologia Sistemática"),

    # 05 - Teologia Bíblica
    ([
        "teologia do novo testamento", "teologia do velho testamento", "teologia biblica",
        "tipologia", "pacto de deus", "alianca"
    ], "05 - Teologia Bíblica"),

    # 06 - Teologia Histórica e Patrística
    ([
        "historia da igreja", "historia do cristianismo", "concilios", "reforma protestante",
        "patristica", "pais da igreja", "agostinho", "aquino", "lutero", "calvino",
        "puritanos", "martires", "historia dos hebreus", "historia das assembleias"
    ], "06 - Teologia Histórica e Patrística"),

    # 07 - Teologia Pastoral e Pregação
    ([
        "homiletica", "oratoria", "pregacao", "manual do pregador", "pregando",
        "lideranca", "presbitero", "pastoral", "aconselhamento", "ministerio pastoral"
    ], "07 - Teologia Pastoral e Pregação"),

    # 08 - Missões e Evangelismo
    ([
        "evangelismo", "evangelizar", "missoes", "missionario", "plantacao de igrejas",
        "evangelizacao"
    ], "08 - Missões e Evangelismo"),

    # 09 - Vida Cristã e Espiritualidade
    ([
        "oracao", "vida crista", "espiritualidade", "mulheres da biblia", "personagens",
        "santidade", "devocional", "familia", "casamento", "jejum", "discipulado"
    ], "09 - Vida Cristã e Espiritualidade"),

    # 14 - Sociologia e Ciências Afins
    ([
        "sociologia", "civilizacao", "civilizacoes", "holocausto", "george orwell",
        "fernando pessoa", "literatura", "psicologia", "direito", "politica"
    ], "14 - Sociologia e Ciências Afins"),
]

def encontrar_destino(nome_pasta: str) -> str:
    n = norm(nome_pasta)
    for keywords, destino in MAPA_DESTINOS:
        for kw in keywords:
            if kw in n:
                return destino
    # Padrão: permanece em Recomendados
    return "17 - Recomendados"

def main():
    parser = argparse.ArgumentParser(description="Redistribuição de subpastas de Livros Daniel")
    parser.add_argument("--execute", action="store_true", help="Executa a redistribuição física")
    parser.add_argument("--dry-run", action="store_true", help="Apenas simula a redistribuição")
    args = parser.parse_args()

    if not args.execute and not args.dry_run:
        print("Defina --dry-run ou --execute. Abortando.", flush=True)
        sys.exit(1)

    print("=== ETAPA 3: REESTRUTURAÇÃO DE LIVROS DANIEL ===", flush=True)
    print(f"Modo: {'EXECUÇÃO REAL' if args.execute else 'SIMULAÇÃO (DRY-RUN)'}", flush=True)
    print(f"Origem: {DANIEL_DIR}", flush=True)

    if not DANIEL_DIR.exists():
        print(f"ERRO: Diretório não encontrado: {DANIEL_DIR}", flush=True)
        sys.exit(1)

    subpastas = sorted([d for d in DANIEL_DIR.iterdir() if d.is_dir()])
    print(f"Total de subpastas a redistribuir: {len(subpastas)}", flush=True)

    plano_redistribuicao = []
    distribuicao_contagem = {}

    for sd in subpastas:
        destino_pasta_nome = encontrar_destino(sd.name)
        destino_path = BASE_DIR / destino_pasta_nome / sd.name
        
        # Conta itens imediatos
        arquivos_f = [f for f in sd.iterdir() if f.is_file()]

        plano_redistribuicao.append({
            "origem": sd,
            "destino": destino_path,
            "destino_categoria": destino_pasta_nome,
            "total_arquivos": len(arquivos_f)
        })

        distribuicao_contagem[destino_pasta_nome] = distribuicao_contagem.get(destino_pasta_nome, 0) + 1

    print("\n--- RESUMO DO PLANO DE REDISTRIBUIÇÃO POR CATEGORIA MESTRA ---", flush=True)
    for cat, qtd in sorted(distribuicao_contagem.items(), key=lambda x: x[0]):
        print(f"  -> {cat}: {qtd} subpastas", flush=True)

    if args.execute:
        print("\nExecutando movimentação das subpastas...", flush=True)
        sucessos = 0
        for item in plano_redistribuicao:
            orig = item["origem"]
            dest = item["destino"]
            dest.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                if dest.exists():
                    # Se destino já existe, mescla arquivos
                    for f in orig.iterdir():
                        d_f = dest / f.name
                        if not d_f.exists():
                            shutil.move(str(f), str(d_f))
                        else:
                            d_f_alt = dest / f"{f.stem}_alt{f.suffix}"
                            shutil.move(str(f), str(d_f_alt))
                    # Remove pasta de origem se vazia
                    try:
                        orig.rmdir()
                    except Exception:
                        pass
                else:
                    shutil.move(str(orig), str(dest))
                sucessos += 1
            except Exception as e:
                print(f"Erro ao mover {orig.name} para {dest}: {e}", flush=True)

        print(f"Redistribuição concluída! {sucessos}/{len(plano_redistribuicao)} subpastas realocadas.", flush=True)
    else:
        print("\n[DRY-RUN] Simulação concluída com sucesso. Use --execute para aplicar.", flush=True)

if __name__ == "__main__":
    main()
