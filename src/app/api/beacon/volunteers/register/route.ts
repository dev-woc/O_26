import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createAccessToken, createRefreshToken, hashPassword } from "@/lib/beacon/auth";
import { volunteerRegisterSchema } from "@/lib/beacon/validations";
import { generateVolunteerId } from "@/lib/beacon/volunteer-ids";
import { db } from "@/lib/db";
import { bcnVolunteers } from "@/lib/db/schema";
import { createRateLimiter } from "@/lib/rate-limit";

const registerLimiter = createRateLimiter(5, 60_000); // 5 registrations/min per IP

export async function POST(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = registerLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const result = volunteerRegisterSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	const { name, email, password, phone, organization, bio, skills, availability } = result.data;

	const existing = await db.query.bcnVolunteers.findFirst({
		where: eq(bcnVolunteers.email, email.toLowerCase()),
	});
	if (existing) {
		return NextResponse.json({ error: "Email already registered" }, { status: 409 });
	}

	const volunteerId = await generateVolunteerId(name);
	const passwordHash = hashPassword(password);

	const [volunteer] = await db
		.insert(bcnVolunteers)
		.values({
			volunteerId,
			name,
			email: email.toLowerCase(),
			passwordHash,
			phone: phone ?? null,
			organization: organization ?? null,
			bio: bio ?? "",
			skills: skills ?? [],
			availability: availability ?? {},
		})
		.returning();

	if (!volunteer) {
		return NextResponse.json({ error: "Registration failed" }, { status: 500 });
	}

	const { passwordHash: _ph, ...safeVolunteer } = volunteer;

	const accessToken = createAccessToken({
		sub: volunteer.id,
		role: "volunteer",
		volunteerId: volunteer.volunteerId,
	});
	const refreshToken = createRefreshToken(volunteer.id);

	return NextResponse.json(
		{
			success: true,
			data: {
				volunteer: safeVolunteer,
				tokens: { accessToken, refreshToken, expiresIn: 900 },
			},
		},
		{ status: 201 },
	);
}
