import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/beacon/audit";
import { createAccessToken, createRefreshToken, verifyPassword } from "@/lib/beacon/auth";
import { adminLoginSchema } from "@/lib/beacon/validations";
import { db } from "@/lib/db";
import { bcnAdmins, bcnVolunteers } from "@/lib/db/schema";
import { createRateLimiter } from "@/lib/rate-limit";

// Stricter limit for admin login — 5 attempts/min per IP
const adminLoginLimiter = createRateLimiter(5, 60_000);

export async function POST(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = adminLoginLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const result = adminLoginSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	const { email, password } = result.data;

	const volunteer = await db.query.bcnVolunteers.findFirst({
		where: eq(bcnVolunteers.email, email.toLowerCase()),
	});

	// Same generic error for not-found and wrong password to prevent user enumeration
	if (!volunteer || !verifyPassword(password, volunteer.passwordHash)) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	if (!volunteer.isActive) {
		return NextResponse.json({ error: "Account is suspended" }, { status: 403 });
	}

	const admin = await db.query.bcnAdmins.findFirst({
		where: eq(bcnAdmins.volunteerId, volunteer.id),
	});

	if (!admin) {
		return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
	}

	// TODO Phase 2: enforce 2FA check here when twoFactorEnabled is true

	await db
		.update(bcnVolunteers)
		.set({ lastLoginAt: new Date(), updatedAt: new Date() })
		.where(eq(bcnVolunteers.id, volunteer.id));

	await writeAuditLog({
		actorId: volunteer.id,
		actorRole: "admin",
		action: "admin_login",
		entityType: "admin",
		entityId: admin.id,
		ipAddress: ip,
	});

	const { passwordHash: _ph, ...safeVolunteer } = volunteer;

	const accessToken = createAccessToken({
		sub: volunteer.id,
		role: "admin",
		volunteerId: volunteer.volunteerId,
		adminId: admin.adminId,
	});
	const refreshToken = createRefreshToken(volunteer.id);

	return NextResponse.json({
		success: true,
		data: {
			admin: { ...admin, volunteer: safeVolunteer },
			tokens: { accessToken, refreshToken, expiresIn: 900 },
		},
	});
}
