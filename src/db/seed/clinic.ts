// ============================================
// FILE: src/db/seed/seed-clinical.ts
// ============================================
// Clinical data seeding (Appointments, Medical Records, Prescriptions, Payments, etc.)

import { faker } from "@faker-js/faker";
import type { DB } from "../client.server";
import {
	appointment,
	diagnosis,
	doseGuideline,
	drug,
	immunization,
	labTest,
	medicalRecord,
	patientBill,
	payment,
	prescribedItem,
	prescription,
	prescriptionLog,
	vitalSign
} from "../schema"; // Corrected import path
import type {
	AppointmentStatus,
	DbAppointment,
	DbClinic,
	DbDoctor,
	DbDrug,
	DbGuardian,
	DbPatient,
	DbService,
	DbStaff,
	DbUser,
	LabTest,
	PaymentStatus
} from "../zod";
import { getRandomEnumValue, getRandomSubset, randomTime, weightedRandom } from "./utils";

const CONFIG = {
	totalAppointments: 200,
	totalMedicalRecords: 150,
	totalPrescriptions: 100,
	totalPayments: 150,
	totalImmunizations: 60,
	totalDrugs: 30
};

interface CoreData {
	clinics: DbClinic[];
	doctors: DbDoctor[];
	guardians: DbGuardian[];
	patients: DbPatient[];
	services: DbService[];
	staff: DbStaff[];
	users: DbUser[];
}

export async function seedClinicalData(db: DB, coreData: CoreData) {
	console.log("🏥 Seeding clinical data...");

	const { patients, doctors, services, clinics, staff } = coreData;

	// 1. Create Drugs
	const drugs = await createDrugs(db, clinics);
	console.log(`  ✅ ${drugs.length} drugs created`);

	// 2. Create Appointments
	const appointments = await createAppointments(db, patients, doctors, services);
	console.log(`  ✅ ${appointments.length} appointments created`);

	// 3. Create Medical Records
	const medicalRecords = await createMedicalRecords(db, patients, appointments);
	console.log(`  ✅ ${medicalRecords.length} medical records created`);

	// 4. Create Vital Signs
	const vitalSigns = await createVitalSigns(db, patients, medicalRecords);
	console.log(`  ✅ ${vitalSigns.length} vital signs created`);

	// 5. Create Lab Tests
	const labTests = await createLabTests(db, patients, medicalRecords, services);
	console.log(`  ✅ ${labTests.length} lab tests created`);

	// 6. Create Prescriptions
	const prescriptions = await createPrescriptions(db, patients, doctors, medicalRecords, drugs);
	console.log(`  ✅ ${prescriptions.length} prescriptions created`);

	// 7. Create Payments
	const payments = await createPayments(db, patients, appointments, services);
	console.log(`  ✅ ${payments.length} payments created`);

	// 8. Create Immunizations
	const immunizations = await createImmunizations(db, patients, medicalRecords, staff);
	console.log(`  ✅ ${immunizations.length} immunizations created`);

	return {
		appointments,
		medicalRecords,
		vitalSigns,
		labTests,
		prescriptions,
		payments,
		immunizations,
		drugs
	};
}

async function createDrugs(db: DB, clinics: DbClinic[]) {
	const drugNames = [
		"Amoxicillin",
		"Ibuprofen",
		"Paracetamol",
		"Aspirin",
		"Lisinopril",
		"Metformin",
		"Atorvastatin",
		"Levothyroxine",
		"Albuterol",
		"Omeprazole",
		"Losartan",
		"Sertraline",
		"Simvastatin",
		"Prednisone",
		"Amlodipine",
		"Metoprolol",
		"Gabapentin",
		"Warfarin",
		"Furosemide",
		"Ciprofloxacin"
	];

	const drugs: DbDrug[] = [];
	for (const name of drugNames.slice(0, CONFIG.totalDrugs)) {
		const clinic = faker.helpers.arrayElement(clinics);
		const drugData = {
			id: faker.string.uuid(),
			clinicId: clinic.id,
			name,
			genericName: faker.lorem.word(),
			brandName: faker.company.name(),
			description: faker.lorem.sentence(),
			sideEffects: faker.lorem.words(5),
			interactions: faker.lorem.words(3),
			contraindications: faker.lorem.words(3),
			quantityInStock: faker.number.int({ min: 10, max: 500 }),
			isDeleted: false,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
		await db.insert(drug).values(drugData);
		drugs.push(drugData);

		// Dose guidelines
		if (faker.datatype.boolean(0.6)) {
			await db.insert(doseGuideline).values({
				id: faker.string.uuid(),
				drugId: drugData.id,
				route: faker.helpers.arrayElement([
					"ORAL",
					"INTRAVENOUS",
					"INTRAMUSCULAR",
					"SUBCUTANEOUS",
					"TOPICAL",
					"INHALATION",
					"RECTAL"
				]),
				clinicalIndication: faker.lorem.words(3),
				minDosePerKg: faker.number.float({ min: 0.5, max: 5 }),
				maxDosePerKg: faker.number.float({ min: 5, max: 20 }),
				doseUnit: faker.helpers.arrayElement(["mg", "ml", "g", "mcg"]),
				frequencyDays: faker.helpers.arrayElement(["Once daily", "Twice daily", "Every 6 hours"]),
				maxDosePer24h: faker.number.float({ min: 100, max: 1000 }),
				postNatalAgeDaysMin: null,
				postNatalAgeDaysMax: null,
				gestationalAgeWeeksMin: null,
				gestationalAgeWeeksMax: null,
				stockConcentrationMgMl: null,
				finalConcentrationMgMl: null,
				minInfusionTimeMin: null,
				compatibilityDiluent: null,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
	}
	return drugs;
}

async function createAppointments(db: DB, patients: DbPatient[], doctors: DbDoctor[], services: DbService[]) {
	const appointments: DbAppointment[] = [];

	for (let i = 0; i < CONFIG.totalAppointments; i++) {
		const patient = faker.helpers.arrayElement(patients);
		const doctor = faker.helpers.arrayElement(doctors);
		const service = faker.helpers.arrayElement(services);

		const status = weightedRandom<AppointmentStatus>([
			{ item: "COMPLETED", weight: 0.5 },
			{ item: "CONFIRMED", weight: 0.3 },
			{ item: "CANCELLED", weight: 0.1 },
			{ item: "NO_SHOW", weight: 0.05 },
			{ item: "PENDING", weight: 0.05 }
		]);

		const now = new Date();
		const appointmentDate =
			status === "COMPLETED"
				? faker.date.past({ years: 0.5 })
				: faker.date.between({
						from: now,
						to: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90)
					});

		const appointmentData = {
			id: faker.string.uuid(),
			clinicId: patient.clinicId,
			patientId: patient.id,
			patientName: `${patient.firstName} ${patient.lastName}`,
			doctorName: doctor.name,
			doctorId: doctor.id,
			serviceId: service.id,
			doctorSpecialty: doctor.specialty,
			appointmentDate,
			time: randomTime(),
			durationMinutes: faker.number.int({ min: 15, max: 60 }),
			appointmentPrice: doctor.appointmentPrice || 0,
			status,
			type: faker.helpers.arrayElement(["Checkup", "Follow-up", "Consultation", "Emergency"]),
			note: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
			reason: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past({ years: 0.5 }),
			updatedAt: new Date()
		};
		await db.insert(appointment).values(appointmentData);
		appointments.push(appointmentData);
	}
	return appointments;
}

async function createMedicalRecords(
	db: DB,
	patients: DbPatient[],
	appointments: (typeof appointment.$inferSelect)[]
	// doctors: DbDoctor[]
) {
	const completedAppointments = appointments.filter((a: DbAppointment) => a.status === "COMPLETED");
	const medicalRecords: (typeof medicalRecord.$inferSelect)[] = [];

	for (const appointment of getRandomSubset(completedAppointments, CONFIG.totalMedicalRecords)) {
		const patient = patients.find(p => p.id === appointment.patientId);
		if (!patient) {
			continue;
		}

		const recordData = {
			id: faker.string.uuid(),
			clinicId: appointment.clinicId,
			patientId: appointment.patientId,
			appointmentId: appointment.id,
			doctorId: appointment.doctorId,
			diagnosis: faker.lorem.words(faker.number.int({ min: 2, max: 5 })),
			symptoms: faker.lorem.words(faker.number.int({ min: 3, max: 7 })),
			treatmentPlan: faker.lorem.paragraph(),
			labRequest: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
			medications: faker.datatype.boolean(0.6) ? faker.lorem.words(3) : null,
			notes: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
			attachments: null,
			diagnosisDate: appointment.appointmentDate,

			// ✅ Fixed: Anchored directly to the appointment's date variable
			// ✅ Fix: Use days instead of decimal years to prevent math rounding bugs
			followUpDate: faker.datatype.boolean(0.4)
				? faker.date.soon({
						days: 73,
						refDate: new Date(appointment.appointmentDate)
					})
				: null,

			status: "ACTIVE" as const,
			isDeleted: false,
			deletedAt: null,
			createdAt: appointment.appointmentDate,
			updatedAt: new Date()
		};
		await db.insert(medicalRecord).values(recordData);
		medicalRecords.push(recordData);

		// Create diagnosis/encounter
		await db.insert(diagnosis).values({
			id: faker.string.uuid(),
			patientId: appointment.patientId,
			doctorId: appointment.doctorId,
			clinicId: appointment.clinicId,
			appointmentId: appointment.id,
			medicalId: recordData.id,
			date: appointment.appointmentDate,
			type: faker.helpers.arrayElement(["Initial", "Follow-up", "Emergency"]),
			diagnosis: recordData.diagnosis,
			status: "CONFIRMED",
			treatment: recordData.treatmentPlan,
			notes: recordData.notes,
			symptoms: recordData.symptoms || "",
			prescribedMedications: recordData.medications,
			followUpPlan: recordData.followUpDate ? faker.lorem.sentence() : null,
			isDeleted: false,
			deletedAt: null,
			createdAt: appointment.appointmentDate,
			updatedAt: new Date()
		});
	}
	return medicalRecords;
}

async function createVitalSigns(db: DB, patients: DbPatient[], medicalRecords: (typeof medicalRecord.$inferSelect)[]) {
	const vitalSigns: (typeof vitalSign.$inferSelect)[] = [];

	for (const record of getRandomSubset(medicalRecords, Math.min(100, medicalRecords.length))) {
		const patient = patients.find(p => p.id === record.patientId);
		if (!patient) {
			continue;
		}

		const ageMonths = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 30));
		const isChild = ageMonths < 60;

		const vitalData = {
			id: faker.string.uuid(),
			clinicId: record.clinicId,
			patientId: record.patientId,
			medicalRecordId: record.id,
			encounterId: record.id,
			recordedAt: record.diagnosisDate || new Date(),
			gender: patient.gender,
			doctorId: null,
			measurementId: null,
			ageDays: Math.floor(ageMonths * 30),
			ageMonths,
			bodyTemperature: faker.number.float({ min: 36.0, max: 37.5 }),
			systolic: isChild ? null : faker.number.int({ min: 100, max: 140 }),
			diastolic: isChild ? null : faker.number.int({ min: 60, max: 90 }),
			heartRate: isChild ? faker.number.int({ min: 80, max: 160 }) : faker.number.int({ min: 60, max: 100 }),
			respiratoryRate: isChild ? faker.number.int({ min: 20, max: 40 }) : faker.number.int({ min: 12, max: 20 }),
			oxygenSaturation: faker.number.int({ min: 95, max: 100 }),
			weight: isChild ? faker.number.float({ min: 3, max: 30 }) : faker.number.float({ min: 50, max: 100 }),
			height: isChild ? faker.number.float({ min: 50, max: 150 }) : faker.number.float({ min: 150, max: 190 }),
			bmi: null as number | null,
			notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		// Calculate BMI
		if (vitalData.height && vitalData.weight) {
			vitalData.bmi = vitalData.weight / (vitalData.height / 100) ** 2;
		}
		await db.insert(vitalSign).values(vitalData);
		vitalSigns.push(vitalData);
	}
	return vitalSigns;
}

async function createLabTests(
	db: DB,
	patients: DbPatient[],
	medicalRecords: (typeof medicalRecord.$inferSelect)[],
	services: DbService[]
) {
	const labTests: LabTest[] = [];
	const labServices = services.filter(s => s.category === "LAB_TEST");

	if (labServices.length === 0) {
		return labTests;
	}

	for (const record of getRandomSubset(medicalRecords, 50)) {
		const patient = patients.find(p => p.id === record.patientId);
		if (!patient) {
			continue;
		}

		const labData = {
			id: faker.string.uuid(),
			clinicId: record.clinicId,
			patientId: record.patientId,
			recordId: record.id,
			serviceId: faker.helpers.arrayElement(labServices).id,
			diagnosisId: record.id,
			testDate: record.diagnosisDate || new Date(),
			result: faker.helpers.arrayElement(["Normal", "Abnormal", "Inconclusive", "Pending"]),
			status: faker.helpers.arrayElement(["COMPLETED", "IN_PROGRESS", "PENDING"]),
			notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
			isDeleted: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		await db.insert(labTest).values(labData);
		labTests.push(labData);
	}
	return labTests;
}
async function createPrescriptions(
	db: DB,
	patients: DbPatient[],
	doctors: DbDoctor[],
	medicalRecords: (typeof medicalRecord.$inferSelect)[],
	drugs: (typeof drug.$inferSelect)[]
) {
	const prescriptions: (typeof prescription.$inferSelect)[] = [];

	for (const record of getRandomSubset(medicalRecords, CONFIG.totalPrescriptions)) {
		const patient = patients.find(p => p.id === record.patientId);
		const doctor = doctors.find(d => d.id === record.doctorId);
		if (!(patient && doctor)) {
			continue;
		}

		const baseEncounterDate = record.diagnosisDate ? new Date(record.diagnosisDate) : new Date();

		const prescriptionData = {
			id: faker.string.uuid(),
			clinicId: record.clinicId,
			patientId: record.patientId,
			doctorId: record.doctorId,
			medicalRecordId: record.id,
			encounterId: record.id,
			diagnosis: record.diagnosis,
			notes: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
			medicationName: faker.helpers.arrayElement(drugs.map(d => d.name)),
			instructions: faker.lorem.sentence(),
			issuedDate: record.diagnosisDate || new Date(),

			// ✅ Fixed: Anchored cleanly to 'baseEncounterDate'
			endDate: faker.date.soon({
				days: 73,
				refDate: baseEncounterDate
			}),
			validUntil: faker.date.soon({
				days: 182,
				refDate: baseEncounterDate
			}),
			status: faker.helpers.arrayElement(["ACTIVE", "COMPLETED", "CANCELLED"]),
			renewedFromId: null,
			cancelledAt: null,
			cancellationReason: null,
			isDeleted: false,
			createdAt: record.diagnosisDate || new Date(),
			updatedAt: new Date()
		};
		await db.insert(prescription).values(prescriptionData);
		prescriptions.push(prescriptionData);

		// Prescribed items
		const numItems = faker.number.int({ min: 1, max: 3 });
		for (let i = 0; i < numItems; i++) {
			const drug = faker.helpers.arrayElement(drugs);
			await db.insert(prescribedItem).values({
				prescriptionId: prescriptionData.id,
				clinicId: prescriptionData.clinicId,
				drugId: drug.id,
				dosageValue: faker.number.float({ min: 5, max: 100 }),
				dosageUnit: faker.helpers.arrayElement(["mg", "ml", "mcg"]),
				frequency: getRandomEnumValue({
					ONCE_DAILY: "ONCE_DAILY",
					TWICE_DAILY: "TWICE_DAILY",
					THREE_TIMES_DAILY: "THREE_TIMES_DAILY",
					FOUR_TIMES_DAILY: "FOUR_TIMES_DAILY",
					WEEKLY: "WEEKLY",
					MONTHLY: "MONTHLY"
				} as const),
				drugRoute: getRandomEnumValue({
					ORAL: "ORAL",
					INTRAVENOUS: "INTRAVENOUS",
					INTRAMUSCULAR: "INTRAMUSCULAR",
					SUBCUTANEOUS: "SUBCUTANEOUS",
					TOPICAL: "TOPICAL"
				} as const),
				duration: faker.helpers.arrayElement(["7 days", "10 days", "14 days", "30 days"]),
				instructions: faker.lorem.sentence(),
				refillsRemaining: faker.number.int({ min: 0, max: 3 }),
				totalRefills: faker.number.int({ min: 0, max: 3 }),
				quantityDispensedTotal: 0,
				notes: null,

				// ✅ Fixed: Replaced hidden floating future call to prevent errors
				expiresAt: faker.date.soon({ days: 182, refDate: baseEncounterDate }),

				isDeleted: false,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		// Prescription log
		await db.insert(prescriptionLog).values({
			prescriptionId: prescriptionData.id,
			action: "CREATED",
			performedBy: doctor.userId ?? "",
			details: "Prescription created",
			createdAt: new Date()
		});
	}
	return prescriptions;
}
async function createPayments(
	db: DB,
	patients: DbPatient[],
	appointments: (typeof appointment.$inferSelect)[],
	services: DbService[]
) {
	const payments: (typeof payment.$inferInsert)[] = [];

	for (const appointment of getRandomSubset(appointments, CONFIG.totalPayments)) {
		const patient = patients.find(p => p.id === appointment.patientId);

		if (!patient) {
			continue;
		}

		const totalAmount = faker.number.int({
			min: 50,
			max: 500
		});

		const status = weightedRandom([
			{ item: "PAID", weight: 0.6 },
			{ item: "PARTIAL", weight: 0.2 },
			{ item: "UNPAID", weight: 0.15 },
			{ item: "REFUNDED", weight: 0.05 }
		]) as PaymentStatus;

		let amountPaid: number;

		if (status === "PAID") {
			amountPaid = totalAmount;
		} else if (status === "PARTIAL") {
			amountPaid = faker.number.int({ min: 10, max: totalAmount - 1 });
		} else {
			amountPaid = 0;
		}
		const paymentDateStart = appointment.appointmentDate > new Date() ? new Date() : appointment.appointmentDate;

		const paymentDateEnd = appointment.appointmentDate > new Date() ? appointment.appointmentDate : new Date();

		const paymentDate =
			status === "PAID" || status === "PARTIAL"
				? faker.date.between({
						from: paymentDateStart <= paymentDateEnd ? paymentDateStart : paymentDateEnd,
						to: paymentDateEnd >= paymentDateStart ? paymentDateEnd : paymentDateStart
					})
				: null;

		const paymentData = {
			id: faker.string.uuid(),
			clinicId: appointment.clinicId,
			patientId: appointment.patientId,
			appointmentId: appointment.id,

			billId: null,

			receiptNumber: faker.number.int({
				min: 1000,
				max: 9999
			}),

			totalAmount,
			amountPaid,

			discount:
				faker.helpers.maybe(
					() =>
						faker.number.int({
							min: 5,
							max: 50
						}),
					{ probability: 0.2 }
				) ?? 0,

			insurance: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }) ?? null,

			insuranceId:
				faker.helpers.maybe(() => faker.string.alphanumeric(10), {
					probability: 0.2
				}) ?? null,

			paymentMethod: getRandomEnumValue({
				CASH: "CASH",
				CARD: "CARD",
				INSURANCE: "INSURANCE",
				BANK_TRANSFER: "BANK_TRANSFER"
			} as const),

			status,

			billDate: appointment.appointmentDate,

			paymentDate,

			dueDate: faker.date.future({
				years: 1
			}),

			paidDate: status === "PAID" ? paymentDate : null,

			serviceDate: appointment.appointmentDate,

			notes:
				faker.helpers.maybe(() => faker.lorem.sentence(), {
					probability: 0.3
				}) ?? null,

			isDeleted: false,
			deletedAt: null,

			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(payment).values(paymentData);

		payments.push(paymentData);

		// Bill items
		if (faker.datatype.boolean()) {
			const numItems = faker.number.int({
				min: 1,
				max: 3
			});

			for (let i = 0; i < numItems; i++) {
				const service = faker.helpers.arrayElement(services);

				const quantity = faker.number.int({
					min: 1,
					max: 5
				});

				const unitCost = faker.number.int({
					min: 10,
					max: 100
				});

				await db.insert(patientBill).values({
					id: faker.string.uuid(),

					clinicId: appointment.clinicId,

					billId: paymentData.id,

					serviceId: service.id,

					serviceDate: appointment.appointmentDate,

					quantity,
					unitCost,

					totalCost: quantity * unitCost,

					notes: null,

					isDeleted: false,

					createdAt: new Date(),
					updatedAt: new Date()
				});
			}
		}
	}

	return payments;
}
async function createImmunizations(
	db: DB,
	patients: DbPatient[],
	medicalRecords: (typeof medicalRecord.$inferSelect)[],
	staff: DbStaff[]
) {
	const immunizations: (typeof immunization.$inferSelect)[] = [];
	const vaccines = [
		"Hepatitis B",
		"Rotavirus",
		"Diphtheria",
		"Tetanus",
		"Pertussis",
		"Haemophilus influenzae",
		"Pneumococcal",
		"Polio",
		"Influenza",
		"Measles",
		"Mumps",
		"Rubella",
		"Varicella",
		"Hepatitis A"
	];

	for (const record of getRandomSubset(medicalRecords, CONFIG.totalImmunizations)) {
		const patient = patients.find(p => p.id === record.patientId);
		if (!patient) {
			continue;
		}

		const vaccine = faker.helpers.arrayElement(vaccines);
		const immunizationData = {
			id: faker.string.uuid(),
			clinicId: record.clinicId,
			patientId: record.patientId,
			vaccine,
			date: faker.date.past({ years: 1 }),
			dose: faker.helpers.arrayElement(["1st", "2nd", "Booster"]),
			lotNumber: faker.string.alphanumeric(10).toUpperCase(),
			administeredByStaffId: faker.helpers.arrayElement(staff)?.id || null,
			recordId: record.id,
			vaccineInventoryId: null,
			notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			isOverDue: false,
			status: "COMPLETED" as const,
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		await db.insert(immunization).values(immunizationData);
		immunizations.push(immunizationData);
	}
	return immunizations;
}

// Add this export at the top of seed-clinical.ts
export interface ClinicalData {
	appointments: Record<string, unknown>[];
	drugs: Record<string, unknown>[];
	immunizations: Record<string, unknown>[];
	labTests: Record<string, unknown>[];
	medicalRecords: Record<string, unknown>[];
	payments: Record<string, unknown>[];
	prescriptions: Record<string, unknown>[];
	vitalSigns: Record<string, unknown>[];
}
