import { LocalStorageProvider } from './localStorage.js';
export * from './types.js';
export * from './localStorage.js';
// Singleton instance
let currentStorageProvider = new LocalStorageProvider();
export function getStorageProvider() {
    return currentStorageProvider;
}
export function setStorageProvider(provider) {
    currentStorageProvider = provider;
}
