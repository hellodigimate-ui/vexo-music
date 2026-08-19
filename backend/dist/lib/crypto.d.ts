/**
 * Robust, zero-dependency password hashing using PBKDF2 with SHA-512.
 * Output format: `pbkdf2$iterations$salt$hash`
 */
export declare function hashPassword(password: string): string;
export declare function comparePassword(password: string, storedHash: string): boolean;
export declare function generateId(prefix?: string): string;
