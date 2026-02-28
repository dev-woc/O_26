import { like } from "drizzle-orm";
import { db } from "@/lib/db";
import { bcnAdmins, bcnVolunteers } from "@/lib/db/schema";
import { getHexInitialsForName } from "./id-generation";

/**
 * Generate a unique volunteer ID: VOL-{hexInitials}{3-digit-increment}
 * e.g. VOL-4A4D001, VOL-4A4D002
 *
 * Note: a unique constraint on volunteer_id catches any race-condition collisions.
 */
export async function generateVolunteerId(fullName: string): Promise<string> {
	const hexCode = getHexInitialsForName(fullName);
	const prefix = `VOL-${hexCode}`;

	const existing = await db
		.select({ id: bcnVolunteers.id })
		.from(bcnVolunteers)
		.where(like(bcnVolunteers.volunteerId, `${prefix}%`));

	const increment = (existing.length + 1).toString().padStart(3, "0");
	return `${prefix}${increment}`;
}

/**
 * Generate a unique admin ID: ADMIN-{hexInitials}{3-digit-increment}
 * e.g. ADMIN-4142001
 */
export async function generateAdminId(fullName: string): Promise<string> {
	const hexCode = getHexInitialsForName(fullName);
	const prefix = `ADMIN-${hexCode}`;

	const existing = await db
		.select({ id: bcnAdmins.id })
		.from(bcnAdmins)
		.where(like(bcnAdmins.adminId, `${prefix}%`));

	const increment = (existing.length + 1).toString().padStart(3, "0");
	return `${prefix}${increment}`;
}
