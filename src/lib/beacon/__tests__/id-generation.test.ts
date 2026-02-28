import { describe, expect, it } from "vitest";
import { getHexInitialsForName } from "../id-generation";

describe("getHexInitialsForName", () => {
	it("converts John Mason to 4A4D", () => {
		// J = 74 decimal = 0x4A, M = 77 decimal = 0x4D
		expect(getHexInitialsForName("John Mason")).toBe("4A4D");
	});

	it("converts Alice Brown to 4142", () => {
		// A = 65 = 0x41, B = 66 = 0x42
		expect(getHexInitialsForName("Alice Brown")).toBe("4142");
	});

	it("handles single-word names by using the same character twice", () => {
		// M = 0x4D
		expect(getHexInitialsForName("Madonna")).toBe("4D4D");
	});

	it("uses first and last parts for multi-word names (ignores middle)", () => {
		expect(getHexInitialsForName("John Michael Mason")).toBe("4A4D");
	});

	it("is case-insensitive — lowercase input produces same result", () => {
		expect(getHexInitialsForName("john mason")).toBe("4A4D");
	});

	it("trims leading and trailing whitespace", () => {
		expect(getHexInitialsForName("  John   Mason  ")).toBe("4A4D");
	});

	it("produces uppercase hex digits", () => {
		const result = getHexInitialsForName("Lily Zhao");
		expect(result).toMatch(/^[0-9A-F]{4}$/);
	});

	it("produces a 4-character string", () => {
		expect(getHexInitialsForName("Jane Doe").length).toBe(4);
	});
});
