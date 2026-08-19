import { LocalStorageProvider } from './localStorage.js';
import type { StorageProvider } from './types.js';

export * from './types.js';
export * from './localStorage.js';

// Singleton instance
let currentStorageProvider: StorageProvider = new LocalStorageProvider();

export function getStorageProvider(): StorageProvider {
  return currentStorageProvider;
}

export function setStorageProvider(provider: StorageProvider): void {
  currentStorageProvider = provider;
}
