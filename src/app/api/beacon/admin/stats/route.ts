import { count, desc, eq, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/beacon/auth";
import { db } from "@/lib/db";
import {
	bcnAuditLog,
	bcnCoinDistributions,
	bcnTasks,
	bcnUsers,
	bcnVolunteers,
} from "@/lib/db/schema";

export async function GET(request: NextRequest) {
	const token = extractBearerToken(request.headers.get("authorization"));
	const payload = token ? verifyToken(token) : null;
	if (!payload) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	if (payload.role !== "admin") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const [
		[volunteerCountResult],
		[userCountResult],
		[coinsResult],
		tasksByStatus,
		recentDistributions,
		recentAuditLog,
	] = await Promise.all([
		db.select({ total: count() }).from(bcnVolunteers).where(eq(bcnVolunteers.isActive, true)),
		db.select({ total: count() }).from(bcnUsers),
		db
			.select({ total: sum(bcnCoinDistributions.amount) })
			.from(bcnCoinDistributions)
			.where(eq(bcnCoinDistributions.approvalStatus, "approved")),
		db.select({ status: bcnTasks.status, count: count() }).from(bcnTasks).groupBy(bcnTasks.status),
		db
			.select()
			.from(bcnCoinDistributions)
			.orderBy(desc(bcnCoinDistributions.distributionDate))
			.limit(5),
		db.select().from(bcnAuditLog).orderBy(desc(bcnAuditLog.createdAt)).limit(10),
	]);

	return NextResponse.json({
		success: true,
		data: {
			volunteerCount: volunteerCountResult?.total ?? 0,
			userCount: userCountResult?.total ?? 0,
			coinsDistributed: Number(coinsResult?.total ?? 0),
			tasksByStatus,
			recentDistributions,
			recentAuditLog,
		},
	});
}
