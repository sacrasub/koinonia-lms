import os
import sys

target_names = ["biblioteca fmb", "17 - recomendados", "livros daniel"]
roots = [
    r"D:\Meu Drive",
    r"D:\Outros computadores",
    r"C:\Projetos",
    r"C:\Users\sacra\Downloads",
    r"C:\Users\sacra\Documents",
    r"C:\Users\sacra\Desktop",
    r"F:",
    r"E:",
]

print("Iniciando busca rápida por pastas-alvo...")

for root in roots:
    if not os.path.exists(root):
        continue
    print(f"Varrendo: {root}")
    try:
        for current_root, dirs, files in os.walk(root):
            # Ignora pastas ocultas / temporárias
            dirs[:] = [d for d in dirs if not d.startswith(('.', '$', 'RecycleBin', 'node_modules'))]
            
            for d in dirs:
                dl = d.lower()
                for target in target_names:
                    if target in dl:
                        full_path = os.path.join(current_root, d)
                        print(f"--> ENCONTRADO [{target}]: {full_path}")
    except Exception as e:
        print(f"Erro em {root}: {e}")

print("Busca concluída.")
