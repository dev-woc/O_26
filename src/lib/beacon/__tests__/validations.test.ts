import { describe, expect, it } from "vitest";
import { adminLoginSchema, volunteerLoginSchema, volunteerRegisterSchema } from "../validations";

const validRegistration = {
	name: "Jane Smith",
	email: "jane@example.org",
	password: "securepass123",
};

describe("volunteerRegisterSchema", () => {
	it("accepts minimal valid registration data", () => {
		expect(volunteerRegisterSchema.safeParse(validRegistration).success).toBe(true);
	});

	it("accepts registration with all optional fields", () => {
		const result = volunteerRegisterSchema.safeParse({
			...validRegistration,
			phone: "+1-555-123-4567",
			organization: "Orlando Coalition",
			bio: "Experienced social worker with 5 years in the field",
			skills: ["counseling", "spanish_fluent", "case_management"],
			availability: { monday: ["09:00-17:00"], tuesday: ["09:00-17:00"] },
		});
		expect(result.success).toBe(true);
	});

	it("rejects a name that is too short", () => {
		expect(volunteerRegisterSchema.safeParse({ ...validRegistration, name: "J" }).success).toBe(
			false,
		);
	});

	it("rejects an invalid email address", () => {
		expect(
			volunteerRegisterSchema.safeParse({ ...validRegistration, email: "not-an-email" }).success,
		).toBe(false);
	});

	it("rejects a password shorter than 8 characters", () => {
		expect(
			volunteerRegisterSchema.safeParse({ ...validRegistration, password: "short" }).success,
		).toBe(false);
	});

	it("rejects a password of exactly 7 characters", () => {
		expect(
			volunteerRegisterSchema.safeParse({ ...validRegistration, password: "7chars!" }).success,
		).toBe(false);
	});

	it("accepts a password of exactly 8 characters", () => {
		expect(
			volunteerRegisterSchema.safeParse({ ...validRegistration, password: "8chars!!" }).success,
		).toBe(true);
	});
});

describe("volunteerLoginSchema", () => {
	it("accepts valid login credentials", () => {
		const result = volunteerLoginSchema.safeParse({
			email: "jane@example.org",
			password: "securepass123",
		});
		expect(result.success).toBe(true);
	});

	it("rejects an empty password", () => {
		expect(
			volunteerLoginSchema.safeParse({ email: "jane@example.org", password: "" }).success,
		).toBe(false);
	});

	it("rejects an invalid email", () => {
		expect(volunteerLoginSchema.safeParse({ email: "notvalid", password: "pass" }).success).toBe(
			false,
		);
	});

	it("rejects missing fields", () => {
		expect(volunteerLoginSchema.safeParse({ email: "jane@example.org" }).success).toBe(false);
		expect(volunteerLoginSchema.safeParse({ password: "pass" }).success).toBe(false);
	});
});

describe("adminLoginSchema", () => {
	const validAdmin = { email: "admin@example.org", password: "adminpass123" };

	it("accepts valid admin credentials without 2FA", () => {
		expect(adminLoginSchema.safeParse(validAdmin).success).toBe(true);
	});

	it("accepts valid admin credentials with a 6-digit 2FA code", () => {
		expect(adminLoginSchema.safeParse({ ...validAdmin, twoFactorCode: "123456" }).success).toBe(
			true,
		);
	});

	it("rejects a 2FA code with fewer than 6 digits", () => {
		expect(adminLoginSchema.safeParse({ ...validAdmin, twoFactorCode: "12345" }).success).toBe(
			false,
		);
	});

	it("rejects a 2FA code with more than 6 digits", () => {
		expect(adminLoginSchema.safeParse({ ...validAdmin, twoFactorCode: "1234567" }).success).toBe(
			false,
		);
	});

	it("rejects invalid email", () => {
		expect(adminLoginSchema.safeParse({ ...validAdmin, email: "bad" }).success).toBe(false);
	});
});
