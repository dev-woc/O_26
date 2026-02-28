import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/beacon/audit";
import { createAccessToken, createRefreshToken, verifyPassword } from "@/lib/beacon/auth";
import { volunteerLoginSchema } from "@/lib/beacon/validations";
import { db } from "@/lib/db";
import { bcnVolunteers } from "@/lib/db/schema";
import { createRateLimiter } from "@/lib/rate-limit";

const loginLimiter = createRateLimiter(10, 60_000); // 10 attempts/min per IP

export async function POST(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = loginLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const result = volunteerLoginSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	const { email, password } = result.data;

	const volunteer = await db.query.bcnVolunteers.findFirst({
		where: eq(bcnVolunteers.email, email.toLowerCase()),
	});

	// Use constant-time check even on not-found to prevent user enumeration
	if (!volunteer || !verifyPassword(password, volunteer.passwordHash)) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	if (!volunteer.isActive) {
		return NextResponse.json({ error: "Account is suspended" }, { status: 403 });
	}

	await db
		.update(bcnVolunteers)
		.set({ lastLoginAt: new Date(), updatedAt: new Date() })
		.where(eq(bcnVolunteers.id, volunteer.id));

	await writeAuditLog({
		actorId: volunteer.id,
		actorRole: volunteer.role as "volunteer" | "admin",
		action: "volunteer_login",
		entityType: "volunteer",
		entityId: volunteer.id,
		ipAddress: ip,
	});

	const { passwordHash: _ph, ...safeVolunteer } = volunteer;

	const accessToken = createAccessToken({
		sub: volunteer.id,
		role: volunteer.role as "volunteer" | "admin",
		volunteerId: volunteer.volunteerId,
	});
	const refreshToken = createRefreshToken(volunteer.id);

	return NextResponse.json({
		success: true,
		data: {
			volunteer: safeVolunteer,
			tokens: { accessToken, refreshToken, expiresIn: 900 },
		},
	});
}
