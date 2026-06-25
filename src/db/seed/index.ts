// ============================================
// FILE: src/db/seed/index.ts
// ============================================
// Main seed orchestration file
import { db } from "../client.server";
import { type ClinicalData, seedClinicalData } from "./clinic";
import { type CoreData, seedCoreData } from "./core";
import { type GrowthData, seedGrowthData } from "./growth";
import { seedLMSData } from "./lms";
import { clearAllData } from "./utils";

export async function runFullSeed() {
	console.log("🌱 Starting comprehensive seed process...");

	try {
		// Clear existing data
		await clearAllData(db);
		console.log("✅ Existing data cleared");

		// Seed in order of dependencies
		const coreData = await seedCoreData(db);
		console.log("✅ Core data seeded");

		const clinicalData = await seedClinicalData(db, coreData);
		console.log("✅ Clinical data seeded");

		const growthData = await seedGrowthData(db, coreData);
		console.log("✅ Growth data seeded");

		await seedLMSData(db);
		console.log("✅ LMS reference data seeded");

		console.log("\n🎉 Full seed completed successfully!");
		printSummary(coreData, clinicalData, growthData);
	} catch (error) {
		console.error("❌ Error during seed:", error);
		throw error;
	}
}

function printSummary(coreData: CoreData, clinicalData: ClinicalData, growthData: GrowthData) {
	console.log("\n📊 Summary of created data:");
	console.log(`🏥 Clinics: ${coreData.clinics.length}`);
	console.log(`👥 Users: ${coreData.users.length}`);
	console.log(`👨‍⚕️ Doctors: ${coreData.doctors.length}`);
	console.log(`👨‍💼 Staff: ${coreData.staff.length}`);
	console.log(`👤 Patients: ${coreData.patients.length}`);
	console.log(`🩺 Services: ${coreData.services.length}`);
	console.log(`📅 Appointments: ${clinicalData.appointments.length}`);
	console.log(`📋 Medical Records: ${clinicalData.medicalRecords.length}`);
	console.log(`💊 Drugs: ${clinicalData.drugs.length}`);
	console.log(`💊 Prescriptions: ${clinicalData.prescriptions.length}`);
	console.log(`💰 Payments: ${clinicalData.payments.length}`);
	console.log(`💉 Immunizations: ${clinicalData.immunizations.length}`);
	console.log(`📏 Measurements: ${growthData.measurements.length}`);
	console.log(`📊 LMS References: ${growthData.lmsReferences.length}`);
}

// Run if called directly
if (require.main === module) {
	runFullSeed().catch(console.error);
}
