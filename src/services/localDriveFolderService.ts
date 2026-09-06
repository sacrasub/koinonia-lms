/**
 * Serviço de Sincronização Direta com a Pasta Local do Google Drive (Desktop)
 * Utiliza a File System Access API do Google Chrome / Edge
 * Permite salvar as gravações diretamente na pasta sincronizada do computador
 * (ex: "D:\Meu Drive\01 - Teologia\11 - Gravações das aulas")
 * sem depender de Service Accounts ou APIs de nuvem com cotas restritas.
 */

const DB_NAME = 'LMS_GoogleDrive_Folder_DB';
const STORE_NAME = 'folder_handles';
const LOCAL_STORAGE_FOLDER_NAME = 'lms_drive_local_folder_name';
const LOCAL_STORAGE_FOLDER_PATH = 'lms_drive_local_folder_path';

const DEFAULT_PATH_HINT = 'D:\\Meu Drive\\01 - Teologia\\11 - Gravações das aulas';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado.'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('google_drive_folder');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, 'google_drive_folder');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Falha ao salvar handle da pasta:', e);
  }
}

export async function clearStoredDirectoryHandle(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('google_drive_folder');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_FOLDER_NAME);
      localStorage.removeItem(LOCAL_STORAGE_FOLDER_PATH);
    }
  } catch (e) {}
}

export function getSavedFolderDisplay(): { name: string; path: string } {
  if (typeof window === 'undefined') {
    return { name: '11 - Gravações das aulas', path: DEFAULT_PATH_HINT };
  }
  const name = localStorage.getItem(LOCAL_STORAGE_FOLDER_NAME) || '11 - Gravações das aulas';
  const path = localStorage.getItem(LOCAL_STORAGE_FOLDER_PATH) || DEFAULT_PATH_HINT;
  return { name, path };
}

export function setSavedFolderPath(path: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_FOLDER_PATH, path);
  }
}

export async function verifyHandlePermission(dirHandle: any, readWrite = true): Promise<boolean> {
  if (!dirHandle) return false;
  const opts: any = {};
  if (readWrite) opts.mode = 'readwrite';
  try {
    if ((await dirHandle.queryPermission(opts)) === 'granted') {
      return true;
    }
    if ((await dirHandle.requestPermission(opts)) === 'granted') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Solicita ao usuário que selecione a pasta local onde o Google Drive para Desktop sincroniza
 * (ex: "D:\Meu Drive\01 - Teologia\11 - Gravações das aulas")
 */
export async function pickGoogleDriveLocalFolder(): Promise<{
  handle: FileSystemDirectoryHandle;
  folderName: string;
} | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('O seu navegador não suporta a File System Access API. Recomendamos o uso do Google Chrome ou Microsoft Edge no Windows.');
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      id: 'koinonia_google_drive_recordings',
      mode: 'readwrite',
      startIn: 'desktop',
    });

    await storeDirectoryHandle(dirHandle);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_FOLDER_NAME, dirHandle.name);
    }

    return { handle: dirHandle, folderName: dirHandle.name };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null; // Usuário cancelou a seleção
    }
    throw err;
  }
}

/**
 * Salva diretamente o vídeo Blob na pasta selecionada do Google Drive Desktop.
 * O Google Drive para Desktop instalado no computador detectará o arquivo e enviará para a nuvem.
 */
export async function saveVideoToLocalDriveFolder(
  blob: Blob,
  fileName: string,
  userSelectedHandle?: FileSystemDirectoryHandle | null
): Promise<{ success: boolean; folderName?: string; error?: string }> {
  try {
    let dirHandle = userSelectedHandle || (await getStoredDirectoryHandle());

    if (!dirHandle) {
      // Solicita seleção da pasta se ainda não houver
      const picked = await pickGoogleDriveLocalFolder();
      if (!picked) {
        return { success: false, error: 'Seleção de pasta cancelada pelo usuário.' };
      }
      dirHandle = picked.handle;
    }

    // Verifica permissão
    const hasPermission = await verifyHandlePermission(dirHandle, true);
    if (!hasPermission) {
      // Tenta pedir permissão novamente
      const picked = await pickGoogleDriveLocalFolder();
      if (!picked) {
        return { success: false, error: 'Permissão de gravação na pasta local não concedida.' };
      }
      dirHandle = picked.handle;
    }

    // Cria o arquivo e grava o Blob
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(blob);
    await writable.close();

    return {
      success: true,
      folderName: dirHandle.name,
    };
  } catch (err: any) {
    console.error('Erro ao salvar vídeo na pasta local do Google Drive:', err);
    return {
      success: false,
      error: err.message || 'Erro ao gravar arquivo na pasta do Google Drive.',
    };
  }
}
