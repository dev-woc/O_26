/**
 * Convert a single character to its 2-char uppercase hex representation.
 * 'J' → 74 decimal → '4A'
 */
function charToHex(char: string): string {
	return char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
}

/**
 * Derive the 4-char hex initials code from a full name.
 * "John Mason" → first='J', last='M' → '4A4D'
 * Single-word name → same char used twice: "Madonna" → '4D4D'
 */
export function getHexInitialsForName(fullName: string): string {
	const parts = fullName.trim().split(/\s+/).filter(Boolean);
	const first = (parts[0] ?? "X").charAt(0).toUpperCase();
	const last = (parts[parts.length - 1] ?? "X").charAt(0).toUpperCase();
	return `${charToHex(first)}${charToHex(last)}`;
}
