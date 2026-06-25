// ============================================
// FILE: src/db/seed/utils.ts
// ============================================
// Utility functions for seeding

import { faker } from "@faker-js/faker";
import type { DB } from "../client.server";
import {
	account,
	appointment,
	clinic,
	clinicMember,
	clinicSetting,
	configStore,
	diagnosis,
	doctor,
	doseGuideline,
	drug,
	feedingLog,
	file,
	folder,
	growthAlert,
	growthChartCache,
	growthPercentileHistory,
	guardian,
	immunization,
	invite,
	labTest,
	lmsReference,
	measurement,
	medicalRecord,
	medicationDispense,
	notification,
	patient,
	patientBill,
	patientGuardian,
	payment,
	prescribedItem,
	prescription,
	prescriptionLog,
	service,
	session,
	staff,
	twoFactor,
	user,
	vaccineInventory,
	vaccineSchedule,
	verification,
	vitalSign,
	workingDay
} from "../schema";

export const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
export const BLOOD_GROUPS = [
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE"
] as const;

export function getRandomEnumValue<T extends Record<string, unknown>>(enumObj: T): T[keyof T] {
	const values = Object.values(enumObj) as T[keyof T][];

	// Guard against empty enums
	if (values.length === 0) {
		throw new Error("getRandomEnumValue: Provided enum/object is empty");
	}

	const randomIndex = Math.floor(Math.random() * values.length);

	// We use the non-null assertion (!) because we checked length > 0
	return (
		values[randomIndex] ??
		(() => {
			throw new Error("getRandomEnumValue: Unexpected error retrieving enum value");
		})()
	);
}

export function getRandomSubset<T>(array: T[], count: number): T[] {
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T {
	const total = items.reduce((sum, { weight }) => sum + weight, 0);
	let random = Math.random() * total;
	for (const { item, weight } of items) {
		if (random < weight) {
			return item;
		}
		random -= weight;
	}
	return (
		items[0]?.item ??
		(() => {
			throw new Error("weightedRandom: Unexpected error retrieving item");
		})()
	);
}

export function randomTime(): string {
	const hours = faker.number.int({ min: 8, max: 17 }).toString().padStart(2, "0");
	const minutes = faker.helpers.arrayElement(["00", "15", "30", "45"]);
	return `${hours}:${minutes}`;
}

export function generateDateOfBirth(patientType: "infant" | "child" | "adult"): Date {
	switch (patientType) {
		case "infant":
			return faker.date.birthdate({ min: 0, max: 2, mode: "age" });
		case "child":
			return faker.date.birthdate({ min: 2, max: 18, mode: "age" });
		default:
			return faker.date.birthdate({ min: 18, max: 90, mode: "age" });
	}
}

export function calculateAgeInMonths(dateOfBirth: Date, asOfDate?: Date): number {
	const effectiveDate = asOfDate || new Date();
	const months = (effectiveDate.getFullYear() - dateOfBirth.getFullYear()) * 12;
	return months + effectiveDate.getMonth() - dateOfBirth.getMonth();
}

export function calculateAgeInDays(dateOfBirth: Date): number {
	const now = new Date();
	return Math.floor((now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));
}

export async function safeDeleteMany(db: DB, table: Parameters<DB["delete"]>[0]): Promise<void> {
	try {
		await db.delete(table);
	} catch (err: unknown) {
		const errMsg = err instanceof Error ? err.message : String(err);
		if (errMsg.includes("no such table") || errMsg.includes("does not exist")) {
			return;
		}
		throw err;
	}
}

export async function clearAllData(db: DB) {
	console.log("🗑️ Clearing existing data in proper order...");

	const tables = [
		prescribedItem,
		prescriptionLog,
		medicationDispense,
		prescription,
		doseGuideline,
		drug,
		growthPercentileHistory,
		growthChartCache,
		growthAlert,
		measurement,
		lmsReference,
		feedingLog,
		immunization,
		vaccineInventory,
		vaccineSchedule,
		labTest,
		patientBill,
		payment,
		vitalSign,
		diagnosis,
		medicalRecord,
		appointment,
		workingDay,
		service,
		patientGuardian,
		guardian,
		patient,
		staff,
		doctor,
		clinicMember,
		clinicSetting,
		clinic,
		notification,
		invite,
		folder,
		file,
		twoFactor,
		verification,
		account,
		session,
		user,
		configStore
	];

	for (const table of tables) {
		await safeDeleteMany(db, table);
	}
}
