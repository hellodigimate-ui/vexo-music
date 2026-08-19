import type { StorageProvider, StorageCategory, UploadOptions, UploadResult, FileValidationResult } from './types.js';
export declare class LocalStorageProvider implements StorageProvider {
    private baseDir;
    private baseUrl;
    constructor(options?: {
        baseDir?: string;
        baseUrl?: string;
    });
    private ensureDirectoryExists;
    /**
     * Determine asset category from MIME type
     */
    detectCategory(mimeType: string): StorageCategory;
    /**
     * Validates size, MIME type, and filename
     */
    validateFile(size: number, mimeType: string, originalName: string): FileValidationResult;
    /**
     * Generates a collision-resistant, sanitized filename
     */
    private generateSafeFilename;
    /**
     * Upload file buffer to disk
     */
    upload(buffer: Buffer, originalName: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Deletes a file from disk
     */
    delete(pathOrFilename: string): Promise<boolean>;
    /**
     * Resolves URL for an asset
     */
    getUrl(pathOrFilename: string): string;
    getBaseDir(): string;
}
