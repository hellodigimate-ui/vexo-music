import crypto from 'node:crypto';
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
}
export function signJwt(payload, secret, expiresInSeconds = 7 * 24 * 60 * 60 // 7 days default
) {
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds,
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
export function verifyJwt(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        if (signature !== expectedSignature)
            return null;
        const payloadJson = base64UrlDecode(encodedPayload);
        const payload = JSON.parse(payloadJson);
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Expired
        }
        return payload;
    }
    catch {
        return null;
    }
}
