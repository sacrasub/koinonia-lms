import json

with open('src/lib/bibliotecaData.json', 'r', encoding='utf-8') as f:
    old_books = json.load(f)

with open('data/biblioteca_manifest.json', 'r', encoding='utf-8') as f:
    new_manifest = json.load(f)

print(f"Livros antigos em bibliotecaData.json: {len(old_books)}")
print(f"Novas obras ativas no manifesto: {len(new_manifest['obras'])}")

with_cover = sum(1 for b in old_books if b.get('cover_url'))
with_desc = sum(1 for b in old_books if b.get('description'))
print(f"Antigos com cover_url: {with_cover}, com description: {with_desc}")

# Amostra de livros antigos
for b in old_books[:3]:
    print("Exemplo antigo:", b.get('title'), "| Drive URL:", b.get('drive_url'))
