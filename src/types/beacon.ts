import type { InferSelectModel } from "drizzle-orm";
import type {
	bcnAdmins,
	bcnAuditLog,
	bcnCoinDistributions,
	bcnTasks,
	bcnUsers,
	bcnVolunteers,
} from "@/lib/db/schema";

// ─── Table row types ──────────────────────────────────────────────────────────

export type BcnVolunteer = InferSelectModel<typeof bcnVolunteers>;
export type BcnAdmin = InferSelectModel<typeof bcnAdmins>;
export type BcnUser = InferSelectModel<typeof bcnUsers>;
export type BcnTask = InferSelectModel<typeof bcnTasks>;
export type BcnCoinDistribution = InferSelectModel<typeof bcnCoinDistributions>;
export type BcnAuditLogEntry = InferSelectModel<typeof bcnAuditLog>;

// ─── Domain enums (text columns) ─────────────────────────────────────────────

export type VolunteerRole = "volunteer" | "admin";
export type AdminLevel = "standard" | "senior" | "super";
export type TaskStatus =
	| "open"
	| "assigned"
	| "in_progress"
	| "completed"
	| "approved"
	| "rejected";
export type TaskPriority = "low" | "medium" | "high";
export type DistributionType =
	| "volunteer_reward"
	| "task_completion"
	| "bonus"
	| "emergency_assistance";
export type ApprovalStatus = "pending" | "approved" | "rejected";

// ─── API response shapes ──────────────────────────────────────────────────────

/** Volunteer row with passwordHash stripped — safe to send to clients */
export type SafeVolunteer = Omit<BcnVolunteer, "passwordHash">;

export interface TokenBundle {
	accessToken: string;
	refreshToken: string;
	expiresIn: number; // seconds
}

export interface VolunteerAuthResponse {
	volunteer: SafeVolunteer;
	tokens: TokenBundle;
}

export interface AdminAuthResponse {
	admin: BcnAdmin & { volunteer: SafeVolunteer };
	tokens: TokenBundle;
}
