// ============================================
// FILE: src/db/seed/seed-core.ts
// ============================================
// Core data seeding (Users, Clinics, Patients, Doctors, Staff)

import { faker } from "@faker-js/faker";
import type { DB } from "../client";
import {
	clinic,
	clinicMember,
	clinicSetting,
	doctor,
	guardian,
	patient,
	patientGuardian,
	service,
	staff,
	user,
	workingDay
} from "../schema";
import type { DbClinic, DbDoctor, DbGuardian, DbPatient, DbService, DbStaff, DbUser, Weekday } from "../zod";
import {
	BLOOD_GROUPS,
	generateDateOfBirth,
	getRandomEnumValue,
	getRandomSubset,
	randomTime,
	WEEKDAYS,
	weightedRandom
} from "./utils";

const CONFIG = {
	totalUsers: 50,
	totalClinics: 5,
	totalDoctors: 15,
	totalPatients: 100,
	totalStaff: 10
};

export interface CoreData {
	clinics: DbClinic[];
	doctors: DbDoctor[];
	guardians: DbGuardian[];
	patients: DbPatient[];
	services: DbService[];
	staff: DbStaff[];
	users: DbUser[];
}

export async function seedCoreData(db: DB): Promise<CoreData> {
	console.log("🏥 Seeding core data...");

	// 1. Create Clinics
	const clinics = await createClinics(db);
	console.log(`  ✅ ${clinics.length} clinics created`);

	// 2. Create Users
	const users = await createUsers(db);
	console.log(`  ✅ ${users.length} users created`);

	// 3. Associate Users with Clinics
	await associateUsersWithClinics(db, users, clinics);

	// 4. Create Doctors
	const doctors = await createDoctors(db, users, clinics);
	console.log(`  ✅ ${doctors.length} doctors created`);

	// 5. Create Staff
	const staffList = await createStaff(db, users, clinics);
	console.log(`  ✅ ${staffList.length} staff created`);

	// 6. Create Patients
	const patients = await createPatients(db, users, clinics);
	console.log(`  ✅ ${patients.length} patients created`);

	// 7. Create Guardians
	const guardians = await createGuardians(db, patients, users);
	console.log(`  ✅ ${guardians.length} guardians created`);

	// 8. Create Services
	const services = await createServices(db, clinics);
	console.log(`  ✅ ${services.length} services created`);

	return {
		clinics,
		users,
		doctors,
		staff: staffList as unknown as DbStaff[],
		patients,
		guardians,
		services
	};
}

async function createClinics(db: DB) {
	const clinicNames = [
		"Cairo Children's Hospital",
		"Alexandria Pediatric Center",
		"Giza Family Clinic",
		"Delta Medical Center",
		"Nile Valley Health Center"
	];

	const clinics: DbClinic[] = [];
	for (const name of clinicNames) {
		const clinicData = {
			id: faker.string.uuid(),
			name,
			email: faker.internet.email({
				firstName: name.split(" ")[0]?.toLowerCase()
			}),
			phone: faker.phone.number(),
			address: faker.location.streetAddress(),
			timezone: "Africa/Cairo",
			isDefault: false,
			isDeleted: false,
			deletedAt: null as Date | null,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(clinic).values(clinicData);
		clinics.push(clinicData);

		// Clinic settings
		await db.insert(clinicSetting).values({
			id: faker.string.uuid(),
			clinicId: clinicData.id,
			openingTime: "08:00",
			closingTime: "17:00",
			workingDays: "MON,TUE,WED,THU,FRI,SAT",
			defaultAppointmentDuration: 30,
			requireEmergencyContact: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}
	return clinics;
}

async function createUsers(db: DB) {
	const users: DbUser[] = [];

	const getInvitedBy = () => {
		if (users.length === 0) {
			return null;
		}
		const inviter = faker.helpers.arrayElement(users);
		return inviter?.id ?? null;
	};

	// Admin users
	for (let i = 0; i < 3; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: `admin${i + 1}@mediclinic.com`,
			emailVerified: true,
			image: faker.image.avatar(),
			role: "admin" as const,
			address: faker.location.streetAddress(),
			phone: faker.phone.number(),
			banned: false,
			clinicId: null as string | null,
			twoFactorEnabled: i === 0,
			banReason: null as string | null,
			banExpires: null as Date | null,
			apiKey: null as string | null,
			invitedBy: getInvitedBy(),
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(user).values(userData);
		users.push(userData);
	}

	// Doctor users
	for (let i = 0; i < CONFIG.totalDoctors; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: `Dr. ${faker.person.fullName()}`,
			email: faker.internet.email(),
			emailVerified: true,
			image: faker.image.avatar(),
			role: "doctor" as const,
			address: faker.location.streetAddress(),
			phone: faker.phone.number(),
			banned: false,
			clinicId: null as string | null,
			twoFactorEnabled: false,
			banReason: null as string | null,
			banExpires: null as Date | null,
			invitedBy: getInvitedBy(),

			apiKey: null as string | null,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(user).values(userData);
		users.push(userData);
	}

	// Staff users
	for (let i = 0; i < CONFIG.totalStaff; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: faker.internet.email(),
			emailVerified: true,
			image: faker.image.avatar(),
			role: "staff" as const,
			address: faker.location.streetAddress(),
			phone: faker.phone.number(),
			banned: false,
			clinicId: null as string | null,
			twoFactorEnabled: false,
			invitedBy: getInvitedBy(),

			banReason: null as string | null,
			banExpires: null as Date | null,
			apiKey: null as string | null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: new Date()
		};
		await db.insert(user).values(userData);
		users.push(userData);
	}

	// Patient users
	for (let i = 0; i < CONFIG.totalPatients; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: faker.internet.email(),
			emailVerified: true,
			image: faker.image.avatar(),
			role: "patient" as const,
			address: faker.location.streetAddress(),
			phone: faker.phone.number(),
			invitedBy: getInvitedBy(),

			banned: false,
			clinicId: null as string | null,
			twoFactorEnabled: false,
			banReason: null as string | null,
			banExpires: null as Date | null,
			apiKey: null as string | null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: new Date()
		};
		await db.insert(user).values(userData);
		users.push(userData);
	}

	return users;
}

async function associateUsersWithClinics(db: DB, users: DbUser[], clinics: DbClinic[]) {
	for (const user of users) {
		const userClinics = getRandomSubset(clinics, faker.number.int({ min: 1, max: 2 }));
		for (const clinic of userClinics) {
			await db.insert(clinicMember).values({
				userId: user.id,
				clinicId: clinic.id,
				role: user.role ?? "staff",
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
	}
}

async function createDoctors(db: DB, users: DbUser[], clinics: DbClinic[]) {
	const doctorUsers = users.filter(u => u.role === "doctor");
	const doctors: (typeof doctor.$inferSelect)[] = [];
	const specialties = [
		"Pediatrics",
		"Cardiology",
		"Neurology",
		"Orthopedics",
		"Gynecology",
		"Psychiatry",
		"General Medicine",
		"Surgery",
		"Endocrinology",
		"Gastroenterology",
		"Pulmonology",
		"Rheumatology"
	];

	for (const user of doctorUsers) {
		const clinic = faker.helpers.arrayElement(clinics);
		const doctorData = {
			id: faker.string.uuid(),
			userId: user.id,
			clinicId: clinic.id,
			name: user.name,
			email: user.email,
			phone: faker.phone.number(),
			address: faker.location.streetAddress(),
			specialty: faker.helpers.arrayElement(specialties),
			department: faker.helpers.arrayElement(["Outpatient", "ICU", "ER", "Pediatrics"]),
			licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
			img: faker.image.avatar(),
			colorCode: faker.color.rgb(),
			appointmentPrice: faker.number.int({ min: 100, max: 500 }),
			rating: faker.number.int({ min: 1, max: 5 }),
			yearsOfExperience: faker.number.int({ min: 1, max: 40 }),
			availabilityStatus: "AVAILABLE" as const,
			hospitalAffiliation: null, // Added missing property
			languages: null, // Added missing property
			education: null, // Added missing property
			certifications: null, // Added missing property
			availableFromTime: "08:00",
			availableToTime: "18:00",
			availableFromWeekDay: "MONDAY" as const,
			availableToWeekDay: "FRIDAY" as const,
			type: weightedRandom([
				{ item: "FULL", weight: 0.7 },
				{ item: "PART_TIME", weight: 0.2 },
				{ item: "CONSULTANT", weight: 0.1 }
			]) as "FULL" | "PART_TIME" | "CONSULTANT" | "VISITING",
			isActive: true,
			isDeleted: false,
			deletedAt: null as Date | null,
			status: "ACTIVE" as const,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(doctor).values(doctorData);
		doctors.push(doctorData);

		// Working days
		const workingDays = getRandomSubset([...WEEKDAYS], faker.number.int({ min: 4, max: 6 }));
		for (const day of workingDays) {
			await db.insert(workingDay).values({
				id: faker.string.uuid(),
				doctorId: doctorData.id,
				day: day as Weekday,
				startTime: randomTime(),
				endTime: randomTime(),
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
	}
	return doctors;
}

async function createStaff(db: DB, users: DbUser[], clinics: DbClinic[]) {
	const staffUsers = users.filter(u => u.role === "staff");
	const staffList: (typeof staff.$inferSelect)[] = [];

	for (const user of staffUsers) {
		const clinic = faker.helpers.arrayElement(clinics);
		const staffData = {
			id: faker.string.uuid(),
			userId: user.id,
			clinicId: clinic.id,
			name: user.name,
			email: user.email,
			phone: faker.phone.number(),
			address: faker.location.streetAddress(),
			department: faker.helpers.arrayElement(["Nursing", "Lab", "Pharmacy", "Admin", "Reception"]),
			img: faker.image.avatar(),
			licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
			colorCode: faker.color.rgb(),
			hireDate: faker.date.past({ years: 3 }),
			salary: faker.number.int({ min: 30_000, max: 80_000 }),
			languages: null,
			hospitalAffiliation: null,
			role: "staff" as const,
			isActive: true,
			isDeleted: false,
			deletedAt: null as Date | null,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(staff).values(staffData);
		staffList.push(staffData);
	}
	return staffList;
}

async function createPatients(db: DB, users: DbUser[], clinics: DbClinic[]) {
	const patientUsers = users.filter(u => u.role === "patient");
	const patients: (typeof patient.$inferSelect)[] = [];

	for (const user of patientUsers) {
		const clinic = faker.helpers.arrayElement(clinics);
		const patientType =
			weightedRandom<"infant" | "child" | "adult">([
				{ item: "infant", weight: 0.2 },
				{ item: "child", weight: 0.5 },
				{ item: "adult", weight: 0.3 }
			]) ?? "child";
		const dateOfBirth = generateDateOfBirth(patientType);

		const patientData = {
			id: faker.string.uuid(),
			clinicId: clinic.id,
			userId: user.id,
			mrn: faker.string.alphanumeric(8).toUpperCase(),
			firstName: user.name.split(" ")[0] || "Unknown",
			lastName: user.name.split(" ").slice(1).join(" ") || "Patient",
			dateOfBirth,
			gender: getRandomEnumValue({ boy: "boy", girl: "girl" }) as "boy" | "girl" | "other",
			email: user.email,
			phone: faker.phone.number(),
			address: faker.location.streetAddress(),
			emergencyContactName: faker.person.fullName(),
			emergencyContactNumber: faker.phone.number(),
			relation: faker.helpers.arrayElement(["Parent", "Spouse", "Sibling"]),
			allergies: faker.datatype.boolean(0.3) ? faker.lorem.words(3) : null,
			medicalConditions: faker.datatype.boolean(0.4) ? faker.lorem.words(5) : null,
			medicalHistory: faker.datatype.boolean(0.2) ? faker.lorem.paragraph() : null,
			bloodGroup: faker.datatype.boolean(0.8) ? faker.helpers.arrayElement(BLOOD_GROUPS) : null,
			maritalStatus: null,
			image: faker.image.avatar(),
			colorCode: faker.color.rgb(),
			isActive: true,
			isDeleted: false,
			deletedAt: null as Date | null,
			createdById: users.find(u => u.role === "admin")?.id || users[0]?.id || "",
			updatedById: null as string | null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: new Date()
		};
		await db.insert(patient).values(patientData);
		patients.push(patientData);
	}
	return patients;
}

async function createGuardians(db: DB, patients: DbPatient[], users: DbUser[]) {
	const guardians: (typeof guardian.$inferSelect)[] = [];
	const availableGuardianUsers = users.filter(u => u.role === "patient" || u.role === "staff");
	const usedGuardianUserIds = new Set<string>();

	for (const patient of patients) {
		if (faker.datatype.boolean(0.7)) {
			const eligibleGuardians = availableGuardianUsers.filter(
				user => !usedGuardianUserIds.has(user.id) && user.id !== patient.userId
			);
			if (eligibleGuardians.length === 0) {
				continue;
			}

			const guardianUser = faker.helpers.arrayElement(eligibleGuardians);
			usedGuardianUserIds.add(guardianUser.id);
			const guardianData = {
				id: faker.string.uuid(),
				clinicId: patient.clinicId,
				userId: guardianUser.id,
				firstName: guardianUser.name.split(" ")[0] || "Guardian",
				lastName: guardianUser.name.split(" ").slice(1).join(" ") || "Name",
				email: guardianUser.email,
				phone: faker.phone.number(),
				address: faker.location.streetAddress(),
				relation: faker.helpers.arrayElement(["Father", "Mother", "Guardian", "Grandparent"]),
				isPrimary: true,
				isActive: true,
				isDeleted: false,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			await db.insert(guardian).values(guardianData);
			guardians.push(guardianData);

			// Link patient to guardian
			await db.insert(patientGuardian).values({
				patientId: patient.id,
				guardianId: guardianData.id,
				relationship: guardianData.relation || "Guardian",
				isPrimary: true,
				createdAt: new Date()
			});
		}
	}
	return guardians;
}

async function createServices(db: DB, clinics: DbClinic[]) {
	const serviceTemplates = [
		{
			name: "General Consultation",
			price: 50,
			duration: 30,
			category: "CONSULTATION"
		},
		{
			name: "Specialist Consultation",
			price: 80,
			duration: 45,
			category: "CONSULTATION"
		},
		{
			name: "Emergency Visit",
			price: 120,
			duration: 60,
			category: "CONSULTATION"
		},
		{ name: "Blood Test", price: 15, duration: 15, category: "LAB_TEST" },
		{ name: "Urine Test", price: 10, duration: 10, category: "LAB_TEST" },
		{ name: "X-Ray", price: 35, duration: 30, category: "LAB_TEST" },
		{ name: "MRI Scan", price: 200, duration: 60, category: "LAB_TEST" },
		{ name: "Flu Vaccine", price: 20, duration: 20, category: "VACCINATION" },
		{
			name: "Childhood Immunization",
			price: 15,
			duration: 25,
			category: "VACCINATION"
		},
		{ name: "Minor Surgery", price: 150, duration: 60, category: "PROCEDURE" },
		{
			name: "Physical Therapy",
			price: 45,
			duration: 45,
			category: "PROCEDURE"
		},
		{ name: "Counseling Session", price: 60, duration: 50, category: "OTHER" },
		{
			name: "Medication Review",
			price: 30,
			duration: 20,
			category: "PHARMACY"
		},
		{ name: "Ultrasound", price: 75, duration: 30, category: "DIAGNOSIS" }
	];

	const services: (typeof service.$inferSelect)[] = [];
	for (const template of serviceTemplates) {
		const clinic = faker.helpers.arrayElement(clinics);
		const serviceData = {
			id: faker.string.uuid(),
			clinicId: clinic.id,
			serviceName: template.name,
			description: faker.lorem.sentence(),
			price: template.price,
			category: template.category,
			duration: template.duration,
			isAvailable: true,
			icon: faker.helpers.arrayElement(["🩺", "💉", "🧪", "📋", "🩹", "💊"]),
			color: faker.color.rgb(),
			isDeleted: false,
			deletedAt: null as Date | null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: new Date()
		};
		await db.insert(service).values(serviceData);
		services.push(serviceData);
	}
	return services;
}
