import { z } from "zod";

export const volunteerRegisterSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters"),
	email: z.string().email("Must be a valid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must be at most 100 characters"),
	phone: z.string().max(30).optional(),
	organization: z.string().max(200).optional(),
	bio: z.string().max(500).optional(),
	skills: z.array(z.string()).optional(),
	availability: z.record(z.string(), z.unknown()).optional(),
});

export const volunteerLoginSchema = z.object({
	email: z.string().email("Must be a valid email address"),
	password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
	email: z.string().email("Must be a valid email address"),
	password: z.string().min(1, "Password is required"),
	twoFactorCode: z.string().length(6, "2FA code must be exactly 6 digits").optional(),
});

export type VolunteerRegisterInput = z.infer<typeof volunteerRegisterSchema>;
export type VolunteerLoginInput = z.infer<typeof volunteerLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
