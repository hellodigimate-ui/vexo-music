export type StorageCategory = 'image' | 'video' | 'audio' | 'document';
export interface UploadOptions {
    altText?: string;
    category?: StorageCategory;
    customFilename?: string;
}
export interface UploadResult {
    id?: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    path: string;
    category: StorageCategory;
}
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
    category: StorageCategory;
}
export interface StorageProvider {
    /**
     * Uploads a file buffer to storage
     */
    upload(buffer: Buffer, originalName: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Deletes a file from storage by its relative path or filename
     */
    delete(pathOrFilename: string): Promise<boolean>;
    /**
     * Resolves the public URL for a stored asset
     */
    getUrl(pathOrFilename: string): string;
    /**
     * Validates file size, MIME type, and filename before saving
     */
    validateFile(size: number, mimeType: string, originalName: string): FileValidationResult;
}
