import sqlite3
import os

db_path = os.path.expandvars(r'%LOCALAPPDATA%\Google\DriveFS\112669996874412561222\mirror_sqlite.db')
conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
c = conn.cursor()

def get_full_path(local_stable_id):
    parts = []
    curr = local_stable_id
    visited = set()
    while curr and curr not in visited:
        visited.add(curr)
        row = c.execute("SELECT local_stable_id, parent_local_stable_id, local_filename, is_root FROM mirror_item WHERE local_stable_id = ?", (curr,)).fetchone()
        if not row:
            break
        parts.append(row[2])
        if row[3] == 1: # is_root
            break
        curr = row[1]
    return " / ".join(reversed(parts))

# Busca onde está a pasta '17 - Recomendados' ou 'Livros Daniel' ou 'Biblioteca FMB'
query = """
SELECT local_stable_id, parent_local_stable_id, local_filename, is_root 
FROM mirror_item 
WHERE local_filename LIKE '%Biblioteca FMB%' 
   OR local_filename LIKE '%17 - Recomendados%' 
   OR local_filename LIKE '%Livros Daniel%'
"""

for row in c.execute(query).fetchall():
    print(f"Item: {row[2]} (ID: {row[0]}, Parent: {row[1]})")
    print(f" -> Caminho: {get_full_path(row[0])}\n")

conn.close()
