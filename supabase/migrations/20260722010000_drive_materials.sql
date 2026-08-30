-- LMS-UIECB: Migration para FASE 4 (Google Drive Público & SSOT)

-- Tabela Drive_Materials para armazenar a sincronização dos arquivos do Google Drive
CREATE TABLE IF NOT EXISTS Drive_Materials (
    id TEXT PRIMARY KEY,                       -- ID único do arquivo no Google Drive
    name TEXT NOT NULL,                        -- Nome do arquivo ou pasta
    mime_type TEXT NOT NULL,                   -- Ex: 'application/pdf', 'application/vnd.google-apps.folder'
    web_view_link TEXT NOT NULL,               -- URL de visualização direta
    folder_id TEXT DEFAULT '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO', -- Pasta pai
    file_size_bytes BIGINT DEFAULT 0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para acelerar a busca de materiais pelo aluno com TTFB < 50ms
CREATE INDEX IF NOT EXISTS idx_drive_materials_folder ON Drive_Materials(folder_id);

-- Inserção de dados iniciais de demonstração (Seed)
INSERT INTO Drive_Materials (id, name, mime_type, web_view_link, folder_id) VALUES
    ('drive_file_1', 'História_do_Pensamento_Cristao_I_Apostila.pdf', 'application/pdf', 'https://drive.google.com/file/d/drive_file_1/view', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO'),
    ('drive_file_2', 'Teologia_Contemporanea_Leitura_Obrigatória.pdf', 'application/pdf', 'https://drive.google.com/file/d/drive_file_2/view', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO'),
    ('drive_folder_1', 'Pasta_Exegese_Novo_Testamento', 'application/vnd.google-apps.folder', 'https://drive.google.com/drive/folders/drive_folder_1', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    mime_type = EXCLUDED.mime_type,
    web_view_link = EXCLUDED.web_view_link,
    last_synced_at = NOW();
