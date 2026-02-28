import { db } from "@/lib/db";
import { bcnAuditLog } from "@/lib/db/schema";

interface AuditParams {
	actorId: string;
	actorRole: "volunteer" | "admin";
	action: string;
	entityType?: string;
	entityId?: string;
	changesJson?: Record<string, unknown>;
	ipAddress?: string;
}

/**
 * Write an immutable audit log entry. Never throws — a logging failure must
 * never crash the main request flow.
 */
export async function writeAuditLog(params: AuditParams): Promise<void> {
	try {
		await db.insert(bcnAuditLog).values({
			actorId: params.actorId,
			actorRole: params.actorRole,
			action: params.action,
			entityType: params.entityType ?? null,
			entityId: params.entityId ?? null,
			changesJson: params.changesJson ?? null,
			ipAddress: params.ipAddress ?? null,
		});
	} catch (err) {
		console.error("[beacon:audit] Failed to write audit log entry", { params, err });
	}
}
