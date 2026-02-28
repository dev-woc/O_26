import { and, asc, count, eq, inArray, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/beacon/auth";
import { db } from "@/lib/db";
import { bcnCoinDistributions, bcnTasks, bcnVolunteers } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
	const token = extractBearerToken(request.headers.get("authorization"));
	const payload = token ? verifyToken(token) : null;
	if (!payload) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const [volunteer, [taskStats], [hoursStats], [coinsStats], activeTasks] = await Promise.all([
		db.query.bcnVolunteers.findFirst({
			where: eq(bcnVolunteers.id, payload.sub),
		}),
		db
			.select({ total: count() })
			.from(bcnTasks)
			.where(and(eq(bcnTasks.assignedTo, payload.sub), eq(bcnTasks.status, "approved"))),
		db
			.select({ total: sum(bcnTasks.hoursWorked) })
			.from(bcnTasks)
			.where(and(eq(bcnTasks.assignedTo, payload.sub), eq(bcnTasks.status, "approved"))),
		db
			.select({ total: sum(bcnCoinDistributions.amount) })
			.from(bcnCoinDistributions)
			.where(
				and(
					eq(bcnCoinDistributions.volunteerId, payload.sub),
					eq(bcnCoinDistributions.approvalStatus, "approved"),
				),
			),
		db
			.select()
			.from(bcnTasks)
			.where(
				and(
					eq(bcnTasks.assignedTo, payload.sub),
					inArray(bcnTasks.status, ["open", "assigned", "in_progress"]),
				),
			)
			.orderBy(asc(bcnTasks.dueDate))
			.limit(10),
	]);

	if (!volunteer) {
		return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
	}

	const { passwordHash: _ph, ...safeVolunteer } = volunteer;

	return NextResponse.json({
		success: true,
		data: {
			volunteer: safeVolunteer,
			stats: {
				tasksCompleted: taskStats?.total ?? 0,
				hoursWorked: Number(hoursStats?.total ?? 0),
				coinsEarned: Number(coinsStats?.total ?? 0),
			},
			activeTasks,
		},
	});
}
