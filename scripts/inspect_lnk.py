import os
import re

candidates = [
    r"E:\Cache_Nuvens\OneDrive\01 - Teologia\Biblioteca FMB.lnk",
    r"D:\Meu Drive\01 - Teologia\Biblioteca FMB.lnk",
]

for path in candidates:
    if os.path.exists(path):
        print("LNK Existe:", path)
        with open(path, "rb") as f:
            data = f.read()
            # Procura por strings legíveis com caminhos (ex: C:\, D:\, E:\, etc.)
            strings = re.findall(rb'[A-Za-z]:\\[A-Za-z0-9_\\\- .]+', data)
            for s in strings:
                print(" -> Caminho encontrado no LNK:", s.decode('latin1', errors='ignore'))
            # Procura por nomes de pastas
            for m in re.finditer(rb'Biblioteca[A-Za-z0-9_\\\- .]*', data):
                print(" -> Trecho:", m.group().decode('latin1', errors='ignore'))
    else:
        print("LNK NÃO encontrado em:", path)
