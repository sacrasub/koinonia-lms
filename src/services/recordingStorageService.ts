/**
 * Serviço de Persistência Local em IndexedDB para Gravações de Aulas
 * Garante proteção anti-perda: salva blocos de áudio/vídeo continuamente
 * permitindo recuperar a gravação mesmo se a aba fechar acidentalmente.
 */

const DB_NAME = 'LMS_UIECB_Recordings_DB';
const DB_VERSION = 1;
const STORE_CHUNKS = 'recording_chunks';
const STORE_SESSIONS = 'recording_sessions';

export interface LocalRecordingSession {
  key: string;
  disciplinaId: string;
  disciplinaName: string;
  aulaNum: number;
  dataAula: string;
  recordedByName: string;
  recordedByEmail: string;
  recordedByRole: string;
  mimeType: string;
  durationSeconds: number;
  startedAt: string;
  updatedAt: string;
  status: 'recording' | 'completed' | 'uploading' | 'uploaded';
  totalChunks: number;
  blobSize?: number;
  driveFileId?: string;
  driveWebViewLink?: string;
}

interface ChunkRecord {
  id: string; // `${sessionKey}_${chunkIndex}`
  sessionKey: string;
  chunkIndex: number;
  data: Blob;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado neste ambiente.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
        chunkStore.createIndex('sessionKey', 'sessionKey', { unique: false });
        chunkStore.createIndex('chunkIndex', 'chunkIndex', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cria ou atualiza uma sessão de gravação no IndexedDB
 */
export async function initLocalRecordingSession(
  session: Omit<LocalRecordingSession, 'updatedAt' | 'totalChunks'>
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);

    const record: LocalRecordingSession = {
      ...session,
      totalChunks: 0,
      updatedAt: new Date().toISOString(),
    };

    store.put(record);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao inicializar sessão no IndexedDB:', err);
  }
}

/**
 * Adiciona um bloco (chunk) de vídeo recebido durante a gravação
 */
export async function appendRecordingChunk(
  sessionKey: string,
  chunkIndex: number,
  chunkBlob: Blob,
  durationSeconds?: number
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CHUNKS, STORE_SESSIONS], 'readwrite');

    const chunkStore = tx.objectStore(STORE_CHUNKS);
    const sessionStore = tx.objectStore(STORE_SESSIONS);

    const chunkRecord: ChunkRecord = {
      id: `${sessionKey}_${String(chunkIndex).padStart(6, '0')}`,
      sessionKey,
      chunkIndex,
      data: chunkBlob,
      timestamp: Date.now(),
    };

    chunkStore.put(chunkRecord);

    const sessionReq = sessionStore.get(sessionKey);
    sessionReq.onsuccess = () => {
      const existingSession = sessionReq.result as LocalRecordingSession | undefined;
      if (existingSession) {
        existingSession.totalChunks = Math.max(existingSession.totalChunks || 0, chunkIndex + 1);
        existingSession.updatedAt = new Date().toISOString();
        if (durationSeconds !== undefined) {
          existingSession.durationSeconds = durationSeconds;
        }
        sessionStore.put(existingSession);
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao salvar chunk no IndexedDB:', err);
  }
}

/**
 * Monta o Blob consolidado a partir de todos os blocos salvos
 */
export async function assembleRecordingBlob(
  sessionKey: string
): Promise<{ blob: Blob; session: LocalRecordingSession } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CHUNKS, STORE_SESSIONS], 'readonly');
    const chunkStore = tx.objectStore(STORE_CHUNKS);
    const sessionStore = tx.objectStore(STORE_SESSIONS);

    const sessionReq = sessionStore.get(sessionKey);

    const session: LocalRecordingSession | null = await new Promise((resolve) => {
      sessionReq.onsuccess = () => resolve(sessionReq.result || null);
      sessionReq.onerror = () => resolve(null);
    });

    if (!session) return null;

    const index = chunkStore.index('sessionKey');
    const chunksReq = index.getAll(sessionKey);

    const chunks: ChunkRecord[] = await new Promise((resolve) => {
      chunksReq.onsuccess = () => resolve(chunksReq.result || []);
      chunksReq.onerror = () => resolve([]);
    });

    if (chunks.length === 0) return null;

    // Ordena os chunks por chunkIndex
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

    const blobParts = chunks.map((c) => c.data);
    const mimeType = session.mimeType || 'video/webm';
    const finalBlob = new Blob(blobParts, { type: mimeType });

    return { blob: finalBlob, session };
  } catch (err) {
    console.error('Erro ao reconstruir gravação do IndexedDB:', err);
    return null;
  }
}

/**
 * Atualiza o status da gravação no IndexedDB
 */
export async function updateLocalRecordingStatus(
  sessionKey: string,
  status: LocalRecordingSession['status'],
  patch?: Partial<LocalRecordingSession>
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);

    const req = store.get(sessionKey);
    req.onsuccess = () => {
      const session = req.result as LocalRecordingSession | undefined;
      if (session) {
        session.status = status;
        session.updatedAt = new Date().toISOString();
        if (patch) {
          Object.assign(session, patch);
        }
        store.put(session);
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao atualizar status no IndexedDB:', err);
  }
}

/**
 * Busca todas as gravações pendentes ou não enviadas
 */
export async function getPendingLocalRecordings(): Promise<LocalRecordingSession[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const store = tx.objectStore(STORE_SESSIONS);
    const req = store.getAll();

    return new Promise((resolve) => {
      req.onsuccess = () => {
        const all: LocalRecordingSession[] = req.result || [];
        // Retorna gravações que têm chunks mas ainda não foram marcadas como 'uploaded'
        const pending = all.filter((s) => s.status !== 'uploaded' && s.totalChunks > 0);
        resolve(pending);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Remove os blocos e a sessão do IndexedDB após o upload bem-sucedido
 */
export async function deleteLocalRecording(sessionKey: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CHUNKS, STORE_SESSIONS], 'readwrite');
    const chunkStore = tx.objectStore(STORE_CHUNKS);
    const sessionStore = tx.objectStore(STORE_SESSIONS);

    // Remove sessão
    sessionStore.delete(sessionKey);

    // Remove chunks
    const index = chunkStore.index('sessionKey');
    const req = index.getAllKeys(sessionKey);

    req.onsuccess = () => {
      const keys = req.result;
      keys.forEach((key) => chunkStore.delete(key));
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao remover gravação do IndexedDB:', err);
  }
}
