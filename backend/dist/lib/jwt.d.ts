export interface AdminTokenPayload {
    userId: string;
    email: string;
    role: string;
    name: string;
    iat?: number;
    exp?: number;
}
export declare function signJwt(payload: AdminTokenPayload, secret: string, expiresInSeconds?: number): string;
export declare function verifyJwt(token: string, secret: string): AdminTokenPayload | null;
