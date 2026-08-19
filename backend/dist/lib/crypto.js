import crypto from 'node:crypto';
/**
 * Robust, zero-dependency password hashing using PBKDF2 with SHA-512.
 * Output format: `pbkdf2$iterations$salt$hash`
 */
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 10000;
    const keylen = 64;
    const digest = 'sha512';
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
    return `pbkdf2$${iterations}$${salt}$${derivedKey.toString('hex')}`;
}
export function comparePassword(password, storedHash) {
    if (!password || !storedHash)
        return false;
    // If plain text fallback during initial bootstrap
    if (!storedHash.includes('$')) {
        return password === storedHash;
    }
    const parts = storedHash.split('$');
    if (parts.length === 4 && parts[0] === 'pbkdf2') {
        const iterations = parseInt(parts[1], 10);
        const salt = parts[2];
        const originalHash = parts[3];
        const keylen = 64;
        const digest = 'sha512';
        const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
        return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), derivedKey);
    }
    return false;
}
export function generateId(prefix = '') {
    const randomStr = crypto.randomBytes(8).toString('hex');
    return prefix ? `${prefix}-${randomStr}` : `cuid-${randomStr}`;
}
