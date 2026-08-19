import type { StorageProvider } from './types.js';
export * from './types.js';
export * from './localStorage.js';
export declare function getStorageProvider(): StorageProvider;
export declare function setStorageProvider(provider: StorageProvider): void;
