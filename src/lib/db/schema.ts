import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

// ─── Project Beacon Tables ────────────────────────────────────────────────────

// Volunteers (staff / community members who verify activities and distribute coins)
export const bcnVolunteers = pgTable(
	"bcn_volunteers",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		volunteerId: text("volunteer_id").notNull().unique(), // e.g. VOL-4A4D001
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		passwordHash: text("password_hash").notNull(),
		phone: text("phone"),
		organization: text("organization"),
		bio: text("bio").notNull().default(""),
		skills: jsonb("skills").notNull().default([]),
		availability: jsonb("availability").notNull().default({}),
		role: text("role").notNull().default("volunteer"), // 'volunteer' | 'admin'
		isActive: boolean("is_active").notNull().default(true),
		backgroundCheckDate: text("background_check_date"),
		trainingCompletedDate: text("training_completed_date"),
		lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("idx_bcn_volunteers_email").on(table.email),
		uniqueIndex("idx_bcn_volunteers_volunteer_id").on(table.volunteerId),
	],
);

// Admins (elevated volunteers with coin distribution authority)
export const bcnAdmins = pgTable(
	"bcn_admins",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		adminId: text("admin_id").notNull().unique(), // e.g. ADMIN-4142001
		volunteerId: uuid("volunteer_id")
			.notNull()
			.unique()
			.references(() => bcnVolunteers.id, { onDelete: "cascade" }),
		adminLevel: text("admin_level").notNull().default("standard"), // 'standard' | 'senior' | 'super'
		canDistributeCoins: boolean("can_distribute_coins").notNull().default(true),
		maxCoinDistributionAmount: numeric("max_coin_distribution_amount", { precision: 18, scale: 8 })
			.notNull()
			.default("500"),
		twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
		twoFactorSecret: text("two_factor_secret"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("idx_bcn_admins_admin_id").on(table.adminId),
		index("idx_bcn_admins_volunteer_id").on(table.volunteerId),
	],
);

// Users (unsheltered individuals — primary beneficiaries of the platform)
export const bcnUsers = pgTable(
	"bcn_users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		uniqueIdentifier: text("unique_identifier").notNull().unique(), // QR code string
		walletAddress: text("wallet_address").unique(),
		coinBalance: numeric("coin_balance", { precision: 18, scale: 8 }).notNull().default("0"),
		isActive: boolean("is_active").notNull().default(true),
		privacySettings: jsonb("privacy_settings").notNull().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [uniqueIndex("idx_bcn_users_unique_identifier").on(table.uniqueIdentifier)],
);

// Tasks (volunteer work items — verify activities, distribute coins, outreach)
export const bcnTasks = pgTable(
	"bcn_tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		category: text("category"), // 'verification' | 'outreach' | 'administrative'
		priority: text("priority").notNull().default("medium"), // 'low' | 'medium' | 'high'
		status: text("status").notNull().default("open"), // 'open' | 'assigned' | 'in_progress' | 'completed' | 'approved' | 'rejected'
		estimatedHours: numeric("estimated_hours", { precision: 5, scale: 2 }),
		rewardAmount: numeric("reward_amount", { precision: 18, scale: 8 }),
		dueDate: timestamp("due_date", { withTimezone: true }),
		requiredSkills: jsonb("required_skills").notNull().default([]),
		locationLat: numeric("location_lat", { precision: 10, scale: 8 }),
		locationLng: numeric("location_lng", { precision: 11, scale: 8 }),
		createdBy: uuid("created_by").references(() => bcnAdmins.id),
		assignedTo: uuid("assigned_to").references(() => bcnVolunteers.id),
		hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }),
		completionNotes: text("completion_notes"),
		completedAt: timestamp("completed_at", { withTimezone: true }),
		approvedBy: uuid("approved_by").references(() => bcnAdmins.id),
		rewardAdjustment: numeric("reward_adjustment", { precision: 18, scale: 8 }),
		approvalNotes: text("approval_notes"),
		approvedAt: timestamp("approved_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_bcn_tasks_status").on(table.status),
		index("idx_bcn_tasks_assigned_to").on(table.assignedTo),
		index("idx_bcn_tasks_created_by").on(table.createdBy),
	],
);

// Coin distributions (every BEACON transfer from admin to user is recorded here)
export const bcnCoinDistributions = pgTable(
	"bcn_coin_distributions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		recipientId: uuid("recipient_id").references(() => bcnUsers.id),
		volunteerId: uuid("volunteer_id").references(() => bcnVolunteers.id),
		taskId: uuid("task_id").references(() => bcnTasks.id),
		adminId: uuid("admin_id")
			.notNull()
			.references(() => bcnAdmins.id),
		amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
		distributionType: text("distribution_type").notNull(), // 'volunteer_reward' | 'task_completion' | 'bonus' | 'emergency_assistance'
		description: text("description"),
		approvalStatus: text("approval_status").notNull().default("approved"), // 'pending' | 'approved' | 'rejected'
		blockchainHash: text("blockchain_hash"),
		notes: text("notes"),
		distributionDate: timestamp("distribution_date", { withTimezone: true }).defaultNow().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_bcn_distributions_admin_id").on(table.adminId),
		index("idx_bcn_distributions_recipient_id").on(table.recipientId),
		index("idx_bcn_distributions_date").on(table.distributionDate),
	],
);

// Audit log (immutable — no delete endpoint, every admin action is recorded)
export const bcnAuditLog = pgTable(
	"bcn_audit_log",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		actorId: uuid("actor_id").notNull(),
		actorRole: text("actor_role").notNull(), // 'volunteer' | 'admin'
		action: text("action").notNull(),
		entityType: text("entity_type"),
		entityId: uuid("entity_id"),
		changesJson: jsonb("changes_json"),
		ipAddress: text("ip_address"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_bcn_audit_log_actor_id").on(table.actorId),
		index("idx_bcn_audit_log_action").on(table.action),
		index("idx_bcn_audit_log_created_at").on(table.createdAt),
	],
);

// ─── Beacon Relations ─────────────────────────────────────────────────────────

export const bcnVolunteersRelations = relations(bcnVolunteers, ({ one, many }) => ({
	admin: one(bcnAdmins, {
		fields: [bcnVolunteers.id],
		references: [bcnAdmins.volunteerId],
	}),
	assignedTasks: many(bcnTasks),
	distributions: many(bcnCoinDistributions),
}));

export const bcnAdminsRelations = relations(bcnAdmins, ({ one, many }) => ({
	volunteer: one(bcnVolunteers, {
		fields: [bcnAdmins.volunteerId],
		references: [bcnVolunteers.id],
	}),
	distributions: many(bcnCoinDistributions),
	createdTasks: many(bcnTasks, { relationName: "bcnTask_creator" }),
	approvedTasks: many(bcnTasks, { relationName: "bcnTask_approver" }),
}));

export const bcnUsersRelations = relations(bcnUsers, ({ many }) => ({
	distributions: many(bcnCoinDistributions),
}));

export const bcnTasksRelations = relations(bcnTasks, ({ one, many }) => ({
	creator: one(bcnAdmins, {
		fields: [bcnTasks.createdBy],
		references: [bcnAdmins.id],
		relationName: "bcnTask_creator",
	}),
	assignee: one(bcnVolunteers, {
		fields: [bcnTasks.assignedTo],
		references: [bcnVolunteers.id],
	}),
	approver: one(bcnAdmins, {
		fields: [bcnTasks.approvedBy],
		references: [bcnAdmins.id],
		relationName: "bcnTask_approver",
	}),
	distributions: many(bcnCoinDistributions),
}));

export const bcnCoinDistributionsRelations = relations(bcnCoinDistributions, ({ one }) => ({
	recipient: one(bcnUsers, {
		fields: [bcnCoinDistributions.recipientId],
		references: [bcnUsers.id],
	}),
	volunteer: one(bcnVolunteers, {
		fields: [bcnCoinDistributions.volunteerId],
		references: [bcnVolunteers.id],
	}),
	task: one(bcnTasks, {
		fields: [bcnCoinDistributions.taskId],
		references: [bcnTasks.id],
	}),
	admin: one(bcnAdmins, {
		fields: [bcnCoinDistributions.adminId],
		references: [bcnAdmins.id],
	}),
}));
