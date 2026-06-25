// functions/visit.ts - FIXED

import { createServerFn } from "@tanstack/react-start";
import { visitRepo } from "@/db/queries/visit.repo";
import type * as schema from "@/db/schema";

export const getVisitsFn = createServerFn({ method: "GET" }).handler(async () => {
	try {
		// ✅ Use repository
		const dbAppointments = await visitRepo.getVisits();

		// Format database objects into the shape expected by PatientVisit
		const visits = dbAppointments.map(v => {
			const patient = v.patient;
			const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";

			return {
				id: v.id,
				patientId: v.patientId,
				patientName,
				patientAvatar: patient?.image ?? undefined,
				patientAvatarFallback: patientName
					.split(" ")
					.map(n => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2),
				age: patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : "N/A",
				gender: patient?.gender,
				visitDate: v.appointmentDate.toISOString(),
				visitType: v.type || v.service?.serviceName || "Consultation",
				status: mapAppointmentStatus(v.status),
				diagnosis: v.note ? [v.note] : [],
				amount: Number(v.appointmentPrice ?? v.service?.price ?? 0),
				paymentStatus: (v.status === "COMPLETED" ? "PAID" : "PENDING") as
					| "PAID"
					| "PENDING"
					| "UNPAID"
					| "REFUNDED"
					| "PARTIAL",
				provider: v.doctor?.name || "Unknown",
				nextAppointment: null
			};
		});

		// Compute metric aggregations
		const totalVisits = visits.length;
		const scheduledCount = visits.filter(v => v.status === "PENDING").length;
		const completedCount = visits.filter(v => v.status === "COMPLETED").length;
		const cancelledCount = visits.filter(v => v.status === "CANCELLED").length;
		const noShowCount = visits.filter(v => v.status === "NO_SHOW").length;
		const totalRevenue = visits.reduce((sum, v) => (v.paymentStatus === "PAID" ? sum + v.amount : sum), 0);

		return {
			visits,
			summary: {
				totalVisits,
				scheduledCount,
				completedCount,
				cancelledCount,
				noShowCount,
				totalRevenue
			}
		};
	} catch (error) {
		console.error("Database error while fetching visits:", error);
		throw new Error("Failed to pull visit logs.");
	}
});

// Helper functions...
function calculateAge(dateOfBirth: Date): string {
	const now = new Date();
	const diff = now.getTime() - dateOfBirth.getTime();
	const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));

	if (years < 1) {
		const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
		return `${months}mo`;
	}
	if (years < 5) {
		return `${years}y ${Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))}mo`;
	}
	return `${years}y`;
}

function mapAppointmentStatus(status: schema.AppointmentStatus): "PENDING" | "COMPLETED" | "CANCELLED" | "NO_SHOW" {
	switch (status) {
		case "CONFIRMED":
		case "PENDING":
			return "PENDING";
		case "COMPLETED":
			return "COMPLETED";
		case "CANCELLED":
			return "CANCELLED";
		case "NO_SHOW":
			return "NO_SHOW";
		default:
			return "PENDING";
	}
}
