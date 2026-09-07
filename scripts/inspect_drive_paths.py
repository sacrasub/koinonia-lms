import sqlite3
import os
import glob

db_dir = os.path.expandvars(r'%LOCALAPPDATA%\Google\DriveFS\112669996874412561222')
print("Inspecionando bases do DriveFS em:", db_dir)

for db_file in glob.glob(os.path.join(db_dir, "*sqlite*.db")):
    basename = os.path.basename(db_file)
    try:
        conn = sqlite3.connect(f"file:{db_file}?mode=ro", uri=True)
        c = conn.cursor()
        tables = [t[0] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        for t in tables:
            try:
                for row in c.execute(f"SELECT * FROM [{t}]").fetchall():
                    row_str = str(row)
                    if any(term in row_str.lower() for term in ["biblioteca", "fmb", "17 -", "daniel", "livros daniel"]):
                        print(f"[{basename} -> {t}]: {row_str[:300]}")
            except Exception:
                pass
        conn.close()
    except Exception as e:
        # print(f"Erro {basename}: {e}")
        pass

# Também vamos checar a base raiz
root_db = os.path.expandvars(r'%LOCALAPPDATA%\Google\DriveFS\root_preference_sqlite.db')
if os.path.exists(root_db):
    try:
        conn = sqlite3.connect(f"file:{root_db}?mode=ro", uri=True)
        c = conn.cursor()
        for t in [t[0] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]:
            for row in c.execute(f"SELECT * FROM [{t}]").fetchall():
                print(f"[root_preference -> {t}]: {row}")
        conn.close()
    except Exception as e:
        print("Erro root_db:", e)
