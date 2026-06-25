import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { generateId } from "@/utils/id";

type UserRole = "admin" | "doctor" | "staff" | "patient";

const seeds: Array<{
	email: string;
	password: string;
	name: string;
	role: UserRole;
}> = [
	{
		email: "hazem032012@gmail.com",
		password: "HealthF26",
		name: "Hazem Ali",
		role: "admin"
	},
	{
		email: "doctor@clinic.com",
		password: "DoctorPass123!",
		name: "Dr. John Doe",
		role: "doctor"
	},
	{
		email: "patient@clinic.com",
		password: "PatientPass123!",
		name: "Jane Patient",
		role: "patient"
	},
	{
		email: "staff@clinic.com",
		password: "StaffPass123!",
		name: "Staff Member",
		role: "staff"
	}
];

async function seedUsers() {
	console.log("🌱 Starting user seed...");

	for (const seed of seeds) {
		try {
			const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, seed.email)).limit(1);

			if (existing[0]) {
				console.log(`ℹ️  ${seed.role} already exists (${seed.email})`);
				continue;
			}

			const userId = generateId();
			const hashedPassword = await hash(seed.password, 10);
			const now = new Date();

			await db.transaction(async tx => {
				await tx.insert(user).values({
					id: userId,
					email: seed.email,
					name: seed.name,
					role: seed.role,
					emailVerified: true,
					createdAt: now,
					updatedAt: now
				});

				await tx.insert(account).values({
					id: generateId(),
					userId: userId,
					accountId: userId,
					providerId: "credential",
					password: hashedPassword,
					createdAt: now,
					updatedAt: now
				});
			});

			console.log(`✅ Created ${seed.role} user (${seed.email})`);
		} catch (error) {
			console.error(`❌ Failed to create ${seed.role} (${seed.email}):`, error);
			throw error; // Re-throw to stop the seeding process
		}
	}
}

seedUsers()
	.then(() => {
		console.log("🎉 Seed complete");
		process.exit(0);
	})
	.catch(error => {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	});
