import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
// Configuration: Allowed MIME types & limits per category
const ALLOWED_MIME_TYPES = {
    image: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'image/avif',
    ],
    video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        'video/x-msvideo',
        'image/jpeg', // Allowed for video thumbnail posters
        'image/png',
        'image/webp',
    ],
    audio: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
        'audio/m4a',
        'audio/x-m4a',
        'audio/mp4',
    ],
    document: [
        'application/pdf',
        'text/plain',
        'application/json',
    ],
};
const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024, // 10 MB
    audio: 25 * 1024 * 1024, // 25 MB
    video: 50 * 1024 * 1024, // 50 MB
    document: 10 * 1024 * 1024, // 10 MB
};
export class LocalStorageProvider {
    baseDir;
    baseUrl;
    constructor(options) {
        // Default upload directory in backend/uploads
        this.baseDir = options?.baseDir || path.resolve(process.cwd(), 'uploads');
        this.baseUrl = options?.baseUrl || '/uploads';
        this.ensureDirectoryExists(this.baseDir);
        this.ensureDirectoryExists(path.join(this.baseDir, 'image'));
        this.ensureDirectoryExists(path.join(this.baseDir, 'video'));
        this.ensureDirectoryExists(path.join(this.baseDir, 'audio'));
        this.ensureDirectoryExists(path.join(this.baseDir, 'document'));
    }
    ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    /**
     * Determine asset category from MIME type
     */
    detectCategory(mimeType) {
        const mime = mimeType.toLowerCase().trim();
        if (mime.startsWith('image/'))
            return 'image';
        if (mime.startsWith('audio/'))
            return 'audio';
        if (mime.startsWith('video/'))
            return 'video';
        return 'document';
    }
    /**
     * Validates size, MIME type, and filename
     */
    validateFile(size, mimeType, originalName) {
        const cleanName = path.basename(originalName).trim();
        if (!cleanName || cleanName === '.' || cleanName === '..') {
            return {
                isValid: false,
                error: 'Invalid filename provided.',
                category: 'document',
            };
        }
        const category = this.detectCategory(mimeType);
        const allowed = ALLOWED_MIME_TYPES[category] || [];
        if (!allowed.includes(mimeType.toLowerCase().trim())) {
            return {
                isValid: false,
                error: `File type "${mimeType}" is not permitted for category "${category}". Allowed: ${allowed.join(', ')}`,
                category,
            };
        }
        const maxSize = MAX_FILE_SIZES[category] || 10 * 1024 * 1024;
        if (size > maxSize) {
            const maxMb = Math.round(maxSize / (1024 * 1024));
            return {
                isValid: false,
                error: `File size (${(size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${maxMb} MB for ${category} assets.`,
                category,
            };
        }
        return {
            isValid: true,
            category,
        };
    }
    /**
     * Generates a collision-resistant, sanitized filename
     */
    generateSafeFilename(originalName) {
        const ext = path.extname(originalName).toLowerCase() || '.bin';
        const base = path.basename(originalName, ext)
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 40);
        const randomSuffix = crypto.randomBytes(4).toString('hex');
        const timestamp = Date.now();
        return `vexo-${timestamp}-${base || 'asset'}-${randomSuffix}${ext}`;
    }
    /**
     * Upload file buffer to disk
     */
    async upload(buffer, originalName, mimeType, options) {
        const validation = this.validateFile(buffer.length, mimeType, originalName);
        if (!validation.isValid) {
            throw new Error(validation.error || 'File validation failed');
        }
        const category = options?.category || validation.category;
        const filename = options?.customFilename || this.generateSafeFilename(originalName);
        const categoryDir = path.join(this.baseDir, category);
        await fsp.mkdir(categoryDir, { recursive: true });
        const targetFilePath = path.join(categoryDir, filename);
        await fsp.writeFile(targetFilePath, buffer);
        const relativeUrl = `${this.baseUrl}/${category}/${filename}`;
        const relativePath = path.join(category, filename).replace(/\\/g, '/');
        return {
            filename,
            originalName,
            mimeType,
            size: buffer.length,
            url: relativeUrl,
            path: relativePath,
            category,
        };
    }
    /**
     * Deletes a file from disk
     */
    async delete(pathOrFilename) {
        try {
            const sanitized = pathOrFilename.replace(/^[/\\]+/, '').replace(/\.\./g, '');
            const fullPath = path.resolve(this.baseDir, sanitized);
            // Security check: ensure path stays within baseDir
            if (!fullPath.startsWith(path.resolve(this.baseDir))) {
                throw new Error('Access denied: Cannot delete file outside upload directory.');
            }
            if (fs.existsSync(fullPath)) {
                await fsp.unlink(fullPath);
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    /**
     * Resolves URL for an asset
     */
    getUrl(pathOrFilename) {
        const sanitized = pathOrFilename.replace(/^[/\\]+/, '').replace(/\\/g, '/');
        if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
            return sanitized;
        }
        return `${this.baseUrl}/${sanitized}`;
    }
    getBaseDir() {
        return this.baseDir;
    }
}
