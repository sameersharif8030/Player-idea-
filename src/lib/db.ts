/**
 * Lightweight, robust IndexedDB wrapper to persist local audio files (Blobs) 
 * so they can be retrieved and played even after app reloads or device reboots.
 */

const DB_NAME = 'tapedeck_local_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device/browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Save an audio file to IndexedDB keyed by track ID.
 */
export async function saveAudioFile(trackId: string, file: File | Blob): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file, trackId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save file to IndexedDB:', error);
  }
}

/**
 * Get an audio file from IndexedDB by track ID.
 */
export async function getAudioFile(trackId: string): Promise<File | Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(trackId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to retrieve file from IndexedDB:', error);
    return null;
  }
}

/**
 * Delete an audio file from IndexedDB by track ID.
 */
export async function deleteAudioFile(trackId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(trackId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete file from IndexedDB:', error);
  }
}

/**
 * Retrieve all stored files as a mapping of track ID to File objects.
 */
export async function getAllStoredFiles(): Promise<Record<string, File>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const fileMap: Record<string, File> = {};
      
      // We can use a cursor or getAll/getAllKeys to retrieve everything
      const openCursorRequest = store.openCursor();

      openCursorRequest.onsuccess = (event) => {
        const cursor = openCursorRequest.result;
        if (cursor) {
          const trackId = cursor.key as string;
          const blob = cursor.value as Blob;
          
          // Re-hydrate Blob into a File object if possible
          const file = new File([blob], `track_${trackId}.mp3`, { type: blob.type || 'audio/mpeg' });
          fileMap[trackId] = file;
          cursor.continue();
        } else {
          resolve(fileMap);
        }
      };

      openCursorRequest.onerror = () => reject(openCursorRequest.error);
    });
  } catch (error) {
    console.error('Failed to load all stored files from IndexedDB:', error);
    return {};
  }
}
