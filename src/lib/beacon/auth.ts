import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const JWT_SECRET = process.env.BEACON_JWT_SECRET ?? "beacon-dev-secret-change-in-prod";
const ACCESS_TOKEN_TTL_S = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_S = 7 * 24 * 60 * 60; // 7 days

// ─── Password hashing (scrypt + random salt) ──────────────────────────────────

export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(password, salt, 64).toString("hex");
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	try {
		const [salt, hash] = stored.split(":");
		if (!salt || !hash) return false;
		const hashBuffer = Buffer.from(hash, "hex");
		const derivedHash = scryptSync(password, salt, 64);
		return timingSafeEqual(hashBuffer, derivedHash);
	} catch {
		return false;
	}
}

// ─── JWT (HS256 via native crypto) ───────────────────────────────────────────

function base64url(input: string): string {
	return Buffer.from(input).toString("base64url");
}

function base64urlDecode(input: string): string {
	return Buffer.from(input, "base64url").toString("utf8");
}

function signJwt(payload: Record<string, unknown>): string {
	const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = base64url(JSON.stringify(payload));
	const sig = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
	return `${header}.${body}.${sig}`;
}

export interface TokenPayload {
	sub: string; // volunteer UUID (db primary key)
	role: "volunteer" | "admin";
	volunteerId: string; // human-readable ID, e.g. VOL-4A4D001
	adminId?: string; // e.g. ADMIN-4142001, only present for admins
	exp: number;
	iat: number;
}

export function createAccessToken(payload: Omit<TokenPayload, "exp" | "iat">): string {
	const now = Math.floor(Date.now() / 1000);
	return signJwt({ ...payload, iat: now, exp: now + ACCESS_TOKEN_TTL_S });
}

export function createRefreshToken(sub: string): string {
	const now = Math.floor(Date.now() / 1000);
	return signJwt({ sub, type: "refresh", iat: now, exp: now + REFRESH_TOKEN_TTL_S });
}

export function verifyToken(token: string): TokenPayload | null {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;
		const [header, body, sig] = parts as [string, string, string];
		const expected = createHmac("sha256", JWT_SECRET)
			.update(`${header}.${body}`)
			.digest("base64url");
		if (sig !== expected) return null;
		const payload = JSON.parse(base64urlDecode(body)) as TokenPayload & { exp: number };
		if (payload.exp < Math.floor(Date.now() / 1000)) return null;
		return payload;
	} catch {
		return null;
	}
}

export function extractBearerToken(authHeader: string | null): string | null {
	if (!authHeader?.startsWith("Bearer ")) return null;
	return authHeader.slice(7);
}
