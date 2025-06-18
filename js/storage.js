/**
 * Sistema de almacenamiento mejorado usando IndexedDB
 * con respaldo en memoria y mejor manejo de errores
 */
export class Storage {
    constructor() {
        this.memoryStorage = new Map();
        this.db = null;
        this.dbName = 'bitacoraDB';
        this.storeName = 'bitacoraStore';
        this.useMemoryOnly = false;
        this.initialized = false;
    }

    async initializeStorage() {
        if (this.initialized) return;

        try {
            // Verificar si estamos en un contexto seguro
            if (typeof window === 'undefined' || !window.indexedDB) {
                throw new Error('IndexedDB no está disponible en este contexto');
            }

            // Abrir la base de datos
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB:', event.target.error);
                this.useMemoryOnly = true;
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('IndexedDB inicializado correctamente');
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };

            // Esperar a que la base de datos esté lista
            await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.warn('Usando almacenamiento en memoria:', error);
            this.useMemoryOnly = true;
            this.initialized = true;
        }
    }

    async setItem(key, value) {
        if (!this.initialized) {
            await this.initializeStorage();
        }

        try {
            if (this.useMemoryOnly) {
                this.memoryStorage.set(key, value);
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            await new Promise((resolve, reject) => {
                const request = store.put(value, key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Respaldo en memoria
            this.memoryStorage.set(key, value);
        } catch (error) {
            console.warn('Error al guardar en IndexedDB, usando memoria:', error);
            this.useMemoryOnly = true;
            this.memoryStorage.set(key, value);
        }
    }

    async getItem(key) {
        if (!this.initialized) {
            await this.initializeStorage();
        }

        try {
            if (this.useMemoryOnly) {
                return this.memoryStorage.get(key);
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            return await new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => {
                    const value = request.result;
                    if (value !== undefined) {
                        this.memoryStorage.set(key, value);
                    }
                    resolve(value);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('Error al leer de IndexedDB, usando memoria:', error);
            return this.memoryStorage.get(key);
        }
    }

    async removeItem(key) {
        if (!this.initialized) {
            await this.initializeStorage();
        }

        try {
            if (this.useMemoryOnly) {
                this.memoryStorage.delete(key);
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            await new Promise((resolve, reject) => {
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            this.memoryStorage.delete(key);
        } catch (error) {
            console.warn('Error al eliminar de IndexedDB, usando memoria:', error);
            this.memoryStorage.delete(key);
        }
    }

    async clear() {
        if (!this.initialized) {
            await this.initializeStorage();
        }

        try {
            if (this.useMemoryOnly) {
                this.memoryStorage.clear();
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            this.memoryStorage.clear();
        } catch (error) {
            console.warn('Error al limpiar IndexedDB, usando memoria:', error);
            this.memoryStorage.clear();
        }
    }

    isUsingMemoryOnly() {
        return this.useMemoryOnly;
    }
}

// Exportar una única instancia
export const storage = new Storage(); 