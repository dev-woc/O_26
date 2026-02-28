import { describe, expect, it } from "vitest";
import {
	createAccessToken,
	createRefreshToken,
	extractBearerToken,
	hashPassword,
	verifyPassword,
	verifyToken,
} from "../auth";

describe("hashPassword / verifyPassword", () => {
	it("hashes and verifies a correct password", () => {
		const hash = hashPassword("securepass123");
		expect(verifyPassword("securepass123", hash)).toBe(true);
	});

	it("rejects an incorrect password", () => {
		const hash = hashPassword("securepass123");
		expect(verifyPassword("wrongpassword", hash)).toBe(false);
	});

	it("produces different hashes for the same password (random salt)", () => {
		const h1 = hashPassword("mypassword");
		const h2 = hashPassword("mypassword");
		expect(h1).not.toBe(h2);
		// Both hashes must still verify correctly
		expect(verifyPassword("mypassword", h1)).toBe(true);
		expect(verifyPassword("mypassword", h2)).toBe(true);
	});

	it("returns false for a malformed stored hash", () => {
		expect(verifyPassword("anything", "notahash")).toBe(false);
	});
});

describe("createAccessToken / verifyToken", () => {
	const base = {
		sub: "550e8400-e29b-41d4-a716-446655440000",
		role: "volunteer" as const,
		volunteerId: "VOL-4A4D001",
	};

	it("creates a token that verifies successfully", () => {
		const token = createAccessToken(base);
		const payload = verifyToken(token);
		expect(payload).not.toBeNull();
		expect(payload?.sub).toBe(base.sub);
		expect(payload?.role).toBe("volunteer");
		expect(payload?.volunteerId).toBe("VOL-4A4D001");
	});

	it("includes an expiry in the future", () => {
		const token = createAccessToken(base);
		const payload = verifyToken(token);
		expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
	});

	it("returns null for a tampered signature", () => {
		const token = createAccessToken(base);
		const [header, body] = token.split(".");
		const tampered = `${header}.${body}.invalidsignature`;
		expect(verifyToken(tampered)).toBeNull();
	});

	it("returns null for a token with wrong number of parts", () => {
		expect(verifyToken("only.two")).toBeNull();
		expect(verifyToken("one")).toBeNull();
		expect(verifyToken("a.b.c.d")).toBeNull();
	});

	it("returns null for an empty string", () => {
		expect(verifyToken("")).toBeNull();
	});

	it("includes adminId when provided", () => {
		const token = createAccessToken({ ...base, role: "admin", adminId: "ADMIN-4142001" });
		const payload = verifyToken(token);
		expect(payload?.adminId).toBe("ADMIN-4142001");
	});
});

describe("createRefreshToken", () => {
	it("creates a verifiable token with the correct sub", () => {
		const sub = "550e8400-e29b-41d4-a716-446655440000";
		const token = createRefreshToken(sub);
		const payload = verifyToken(token);
		expect(payload?.sub).toBe(sub);
	});

	it("expires further in the future than an access token", () => {
		const sub = "550e8400-e29b-41d4-a716-446655440000";
		const refresh = verifyToken(createRefreshToken(sub));
		const access = verifyToken(
			createAccessToken({ sub, role: "volunteer", volunteerId: "VOL-001" }),
		);
		expect(refresh?.exp).toBeGreaterThan(access?.exp);
	});
});

describe("extractBearerToken", () => {
	it("extracts the token from a Bearer header", () => {
		expect(extractBearerToken("Bearer mytoken123")).toBe("mytoken123");
	});

	it("returns null for a null header", () => {
		expect(extractBearerToken(null)).toBeNull();
	});

	it("returns null for a Basic auth header", () => {
		expect(extractBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
	});

	it("returns null for a header with no scheme", () => {
		expect(extractBearerToken("mytoken123")).toBeNull();
	});
});
