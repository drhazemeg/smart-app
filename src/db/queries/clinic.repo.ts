// db/repositories/clinic.repo.ts

import { and, eq, inArray, like, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";
import type {
	ClinicCreateInput,
	ClinicMemberCreateInput,
	ClinicMemberUpdateInput,
	ClinicUpdateInput,
	ServiceCreateInput,
	ServiceUpdateInput
} from "../zod";

export const clinicRepo = {
	// Clinic queries
	async getClinicById(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.clinic.findFirst({
			where: { id, isDeleted: false }
		});
	},

	async getClinicByName(name: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.clinic.findFirst({
			where: { name, isDeleted: false }
		});
	},

	async createClinic(data: schema.NewClinic, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.clinic).values(data).returning();
		return result;
	},

	async updateClinic(id: string, data: Partial<schema.NewClinic>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.clinic)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.clinic.id, id))
			.returning();
		return result;
	},

	async softDeleteClinic(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.clinic)
			.set({ deletedAt: new Date(), isDeleted: true })
			.where(eq(schema.clinic.id, id))
			.returning();
		return result;
	},

	async getDefaultClinic(tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.clinic.findFirst({
			where: { name: "Default Clinic", isDeleted: false }
		});
	},

	// Clinic member queries
	async addUserToClinic(userId: string, clinicId: string, role: schema.Role, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.insert(schema.clinicMember).values({
			userId,
			clinicId,
			role: role as "admin" | "doctor" | "staff" | "patient",
			createdAt: new Date(),
			updatedAt: new Date()
		});
	},

	async upsertClinicMember(userId: string, clinicId: string, role: schema.Role, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.insert(schema.clinicMember)
			.values({
				userId,
				clinicId,
				role: role as "admin" | "doctor" | "staff" | "patient",
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: schema.clinicMember.userId,
				set: {
					clinicId,
					role: role as "admin" | "doctor" | "staff" | "patient",
					updatedAt: new Date()
				}
			});
	},

	async getUserClinics(userId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.select({
				id: schema.clinic.id,
				name: schema.clinic.name,
				email: schema.clinic.email,
				role: schema.clinicMember.role,
				createdAt: schema.clinicMember.createdAt
			})
			.from(schema.clinicMember)
			.innerJoin(schema.clinic, eq(schema.clinicMember.clinicId, schema.clinic.id))
			.where(eq(schema.clinicMember.userId, userId));
	},

	async removeUserFromClinic(userId: string, clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.delete(schema.clinicMember)
			.where(and(eq(schema.clinicMember.userId, userId), eq(schema.clinicMember.clinicId, clinicId)));
	},

	// Clinic stats
	async getClinicStatistics(clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [doctors, patients, appointments, revenue] = await Promise.all([
			client
				.select({ count: sql<number>`count(*)` })
				.from(schema.doctor)
				.where(and(eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false))),
			client
				.select({ count: sql<number>`count(*)` })
				.from(schema.patient)
				.where(and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))),
			client
				.select({ count: sql<number>`count(*)` })
				.from(schema.appointment)
				.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))),
			client
				.select({ total: sql<number>`sum(${schema.payment.totalAmount})` })
				.from(schema.payment)
				.where(and(eq(schema.payment.clinicId, clinicId), eq(schema.payment.status, "PAID")))
		]);

		return {
			doctors: doctors[0]?.count ?? 0,
			patients: patients[0]?.count ?? 0,
			appointments: appointments[0]?.count ?? 0,
			revenue: revenue[0]?.total ?? 0
		};
	},

	// Clinic setting
	async getClinicSetting(clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.clinicSetting.findFirst({
			where: { clinicId }
		});
	},

	async upsertClinicSetting(data: schema.NewClinicSetting, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.clinicSetting)
			.values(data)
			.onConflictDoUpdate({
				target: schema.clinicSetting.clinicId,
				set: { ...data, updatedAt: new Date() }
			})
			.returning();
		return result;
	},

	// Config store
	async getConfigValue(key: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.configStore.findFirst({
			where: { key }
		});
	},

	async setConfigValue(key: string, value: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.insert(schema.configStore).values({ key, value }).onConflictDoUpdate({
			target: schema.configStore.key,
			set: { value }
		});
	},
	async getClinicDashboard(clinicId: string) {
		const [clinic, stats, recentAppointments, topDoctors] = await Promise.all([
			db.query.clinic.findFirst({
				where: { id: clinicId, isDeleted: false }
				// with: {
				// 	setting: true,
				// 	members: {
				// 		with: {
				// 			user: true
				// 		}
				// 	}
				// }
			}),

			// Get clinic statistics
			db.transaction(async tx => {
				const [doctorCount, patientCount, appointmentCount, revenue] = await Promise.all([
					tx
						.select({ count: sql<number>`count(*)` })
						.from(schema.doctor)
						.where(and(eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false))),

					tx
						.select({ count: sql<number>`count(*)` })
						.from(schema.patient)
						.where(and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))),

					tx
						.select({ count: sql<number>`count(*)` })
						.from(schema.appointment)
						.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))),

					tx
						.select({
							total: sql<number>`sum(${schema.payment.totalAmount})`
						})
						.from(schema.payment)
						.where(and(eq(schema.payment.clinicId, clinicId), eq(schema.payment.status, "PAID")))
				]);

				return {
					doctors: doctorCount[0]?.count ?? 0,
					patients: patientCount[0]?.count ?? 0,
					appointments: appointmentCount[0]?.count ?? 0,
					revenue: revenue[0]?.total ?? 0
				};
			}),

			// Recent appointments
			db.query.appointment.findMany({
				where: { clinicId, isDeleted: false },
				with: {
					patient: true,
					doctor: true
				},
				orderBy: { appointmentDate: "desc" },
				limit: 10
			}),

			// Top doctors by appointment count
			db.query.doctor.findMany({
				where: { clinicId, isDeleted: false },
				with: {
					appointments: {
						where: { isDeleted: false }
					}
				},
				limit: 5
			})
		]);

		return { clinic, stats, recentAppointments, topDoctors };
	},

	// Get clinic with all related data
	async getFullClinic(clinicId: string) {
		return await db.query.clinic.findFirst({
			where: { id: clinicId, isDeleted: false }
			// Relations for 'clinics' are currently commented out in relations.ts
			// with: {
			// 	setting: true
			// }
		});
	},
	async listServices(params: {
		clinicId: string;
		search?: string;
		category?: string;
		page: number;
		pageSize: number;
	}) {
		const { clinicId, search, category, page, pageSize } = params;
		const rqbWhere = {
			clinicId,
			isDeleted: false,
			...(category && { category }),
			...(search && {
				OR: [{ serviceName: { ilike: `%${search}%` } }, { description: { ilike: `%${search}%` } }]
			})
		};

		const [services, total] = await Promise.all([
			db.query.service.findMany({
				where: rqbWhere,
				limit: pageSize,
				offset: (page - 1) * pageSize,
				orderBy: { createdAt: "desc" }
			}),
			db.$count(
				schema.service,
				and(
					eq(schema.service.isDeleted, false),
					eq(schema.service.clinicId, clinicId),
					category ? eq(schema.service.category, category) : undefined,
					search ? like(schema.service.serviceName, `%${search}%`) : undefined
				)
			)
		]);

		return {
			services,
			total,
			page,
			totalPages: Math.ceil(total / pageSize)
		};
	},

	// Get all services for a clinic
	async getClinicServices(clinicId: string, includeDeleted = false) {
		return await db.query.service.findMany({
			where: {
				clinicId,
				...(includeDeleted ? {} : { isDeleted: false })
			},
			orderBy: { serviceName: "asc" }
		});
	},

	// Get available services only
	async getAvailableServices(clinicId: string) {
		return await db.query.service.findMany({
			where: {
				clinicId,
				isAvailable: true,
				isDeleted: false
			},
			orderBy: { serviceName: "asc" }
		});
	},

	// Get service by ID with related data
	async getServiceById(serviceId: string, clinicId?: string) {
		const whereClause: Record<string, unknown> = {
			id: serviceId,
			isDeleted: false
		};
		if (clinicId) {
			whereClause.clinicId = clinicId;
		}

		return await db.query.service.findFirst({
			where: whereClause,
			with: {
				appointments: {
					where: { isDeleted: false },
					limit: 10,
					orderBy: { appointmentDate: "desc" }
				},
				labTests: {
					limit: 10,
					orderBy: { testDate: "desc" }
				}
			}
		});
	},

	// Get services by category
	async getServicesByCategory(clinicId: string, category: string) {
		return await db.query.service.findMany({
			where: {
				clinicId,
				category,
				isDeleted: false
			},
			orderBy: { price: "asc" }
		});
	},

	// Get service categories (distinct categories)
	async getServiceCategories(clinicId: string) {
		const services = await db.query.service.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			columns: { category: true }
		});

		const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
		return categories;
	},

	// Search services
	async searchServices(clinicId: string, searchTerm: string) {
		return await db.query.service.findMany({
			where: {
				clinicId,
				isDeleted: false,
				OR: [
					{ serviceName: { ilike: `%${searchTerm}%` } },
					{ description: { ilike: `%${searchTerm}%` } },
					{ category: { ilike: `%${searchTerm}%` } }
				]
			},
			orderBy: { serviceName: "asc" }
		});
	},

	// Get service statistics
	async getServiceStatistics(clinicId: string, startDate?: Date, endDate?: Date) {
		const services = await db.query.service.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			with: {
				appointments: {
					where: {
						isDeleted: false,
						...(startDate &&
							endDate && {
								appointmentDate: {
									gte: startDate,
									lte: endDate
								}
							})
					}
				},
				labTests: {
					where:
						startDate && endDate
							? {
									testDate: {
										gte: startDate,
										lte: endDate
									}
								}
							: undefined
				}
			}
		});

		return services.map(service => ({
			id: service.id,
			name: service.serviceName,
			category: service.category,
			price: service.price,
			duration: service.duration,
			isAvailable: service.isAvailable,
			appointmentCount: service.appointments.length,
			labTestCount: service.labTests.length,
			totalUsage: service.appointments.length + service.labTests.length,
			estimatedRevenue: service.appointments.length * (service.price ?? 0)
		}));
	},

	// Get popular services
	async getPopularServices(clinicId: string, limit = 10, startDate?: Date, endDate?: Date) {
		const stats = await this.getServiceStatistics(clinicId, startDate, endDate);
		return stats.sort((a, b) => b.totalUsage - a.totalUsage).slice(0, limit);
	},

	// Get services with low usage
	async getLowUsageServices(clinicId: string, threshold = 5, days = 30) {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const stats = await this.getServiceStatistics(clinicId, startDate, endDate);
		return stats.filter(service => service.totalUsage < threshold);
	},

	// Get service revenue report
	async getServiceRevenueReport(clinicId: string, startDate: Date, endDate: Date) {
		const services = await db.query.service.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			with: {
				appointments: {
					where: {
						isDeleted: false,
						status: "COMPLETED",
						appointmentDate: {
							gte: startDate,
							lte: endDate
						}
					}
				}
			}
		});

		const report = {
			period: { startDate, endDate },
			totalRevenue: 0,
			services: [] as Array<{
				id: string;
				name: string;
				category: string | null;
				appointmentCount: number;
				revenue: number;
				averagePrice: number;
			}>
		};

		for (const service of services) {
			const appointmentCount = service.appointments.length;
			const revenue = appointmentCount * (service.price ?? 0);
			report.totalRevenue += revenue;
			report.services.push({
				id: service.id,
				name: service.serviceName,
				category: service.category,
				appointmentCount,
				revenue,
				averagePrice: service.price ?? 0
			});
		}

		return report;
	},

	// Check if service can be deleted (no dependencies)
	async canDeleteService(serviceId: string) {
		const service = await db.query.service.findFirst({
			where: { id: serviceId },
			with: {
				appointments: {
					where: {
						isDeleted: false,
						status: { notIn: ["CANCELLED", "COMPLETED"] }
					},
					limit: 1
				},
				labTests: {
					limit: 1
				}
			}
		});

		if (!service) {
			return { canDelete: false, reason: "Service not found" };
		}

		if (service.appointments.length > 0) {
			return { canDelete: false, reason: "Service has upcoming appointments" };
		}

		if (service.labTests.length > 0) {
			return { canDelete: false, reason: "Service has associated lab tests" };
		}

		return { canDelete: true };
	},

	// Get service usage trends
	async getServiceUsageTrends(clinicId: string, serviceId: string, months = 6) {
		const trends: {
			month: string;
			appointmentCount: number;
			revenue: number;
		}[] = [];
		const now = new Date();

		for (let i = months - 1; i >= 0; i--) {
			const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

			const appointments = await db.query.appointment.findMany({
				where: {
					clinicId,
					serviceId,
					isDeleted: false,
					status: "COMPLETED",
					appointmentDate: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			trends.push({
				month: startDate.toLocaleString("default", {
					month: "long",
					year: "numeric"
				}),
				appointmentCount: appointments.length,
				revenue: appointments.length * ((await this.getServiceById(serviceId))?.price ?? 0)
			});
		}

		return trends;
	},
	// Get doctor performance report
	async getDoctorPerformanceReport(clinicId: string, startDate: Date, endDate: Date) {
		const doctors = await db.query.doctor.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			with: {
				appointments: {
					where: {
						appointmentDate: {
							gte: startDate,
							lte: endDate
						},
						isDeleted: false
					}
				},
				ratings: {
					where: {
						createdAt: {
							gte: startDate,
							lte: endDate
						}
					}
				},
				prescriptions: {
					where: {
						issuedDate: {
							gte: startDate,
							lte: endDate
						}
					}
				}
			}
		});

		return doctors.map(doctor => {
			const completedAppointments = doctor.appointments.filter(a => a.status === "COMPLETED");
			const cancelledAppointments = doctor.appointments.filter(a => a.status === "CANCELLED");

			return {
				id: doctor.id,
				name: doctor.name,
				specialty: doctor.specialty,
				totalAppointments: doctor.appointments.length,
				completedAppointments: completedAppointments.length,
				cancelledAppointments: cancelledAppointments.length,
				completionRate:
					doctor.appointments.length > 0
						? (completedAppointments.length / doctor.appointments.length) * 100
						: 0,
				totalPrescriptions: doctor.prescriptions.length,
				revenue: completedAppointments.reduce((sum, a) => sum + (a.appointmentPrice ?? 0), 0)
			};
		});
	},

	async createClinics(data: ClinicCreateInput) {
		const [result] = await db.insert(schema.clinic).values(data).returning();
		return result;
	},

	async createManyClinicss(data: ClinicCreateInput[]) {
		return await db.insert(schema.clinic).values(data).returning();
	},

	async updateClinics(id: string, data: ClinicUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.clinic).set(updateData).where(eq(schema.clinic.id, id)).returning();
		return result;
	},

	async updateManyClinicss(ids: string[], data: ClinicUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.clinic).set(updateData).where(inArray(schema.clinic.id, ids)).returning();
	},

	async deleteClinics(id: string) {
		const [result] = await db.delete(schema.clinic).where(eq(schema.clinic.id, id)).returning();
		return result;
	},

	async softDeleteClinics(id: string) {
		const [result] = await db
			.update(schema.clinic)
			.set({ deletedAt: new Date() })
			.where(eq(schema.clinic.id, id))
			.returning();
		return result;
	},

	async restoreClinics(id: string) {
		const [result] = await db
			.update(schema.clinic)
			.set({ deletedAt: null })
			.where(eq(schema.clinic.id, id))
			.returning();
		return result;
	},

	async createClinicMembers(data: ClinicMemberCreateInput) {
		const [result] = await db.insert(schema.clinicMember).values(data).returning();
		return result;
	},

	async createManyClinicMemberss(data: ClinicMemberCreateInput[]) {
		return await db.insert(schema.clinicMember).values(data).returning();
	},

	async updateClinicMembers(id: string, data: ClinicMemberUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.clinicMember)
			.set(updateData)
			.where(eq(schema.clinicMember.userId, id))
			.returning();
		return result;
	},

	async updateManyClinicMemberss(ids: string[], data: ClinicMemberUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.clinicMember)
			.set(updateData)
			.where(inArray(schema.clinicMember.userId, ids))
			.returning();
	},

	async deleteClinicMembers(id: string) {
		const [result] = await db.delete(schema.clinicMember).where(eq(schema.clinicMember.userId, id)).returning();
		return result;
	},
	async createServiceWithCategory(data: ServiceCreateInput, categoryId?: string) {
		return await db.transaction(async tx => {
			// Check if service with same name exists in clinic
			const existing = await tx.query.service.findFirst({
				where: {
					clinicId: data.clinicId ?? "",
					serviceName: data.serviceName,
					isDeleted: false
				}
			});

			if (existing) {
				throw new Error("Service with this name already exists in the clinic");
			}

			// Create service
			const [service] = await tx
				.insert(schema.service)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					isAvailable: data.isAvailable ?? true
				})
				.returning();

			// If category is provided, you could link it to a category table
			// This assumes you have a service_categories table
			if (categoryId && service) {
				// await tx.insert(schema.serviceCategory).values({
				// 	serviceId: service.id,
				// 	categoryId
				// });
			}

			return service;
		});
	},

	async cloneService(serviceId: string, newClinicId?: string) {
		return await db.transaction(async tx => {
			const originalService = await tx.query.service.findFirst({
				where: { id: serviceId, isDeleted: false }
			});

			if (!originalService) {
				throw new Error("Original service not found");
			}

			// Clone service with new ID
			const [clonedService] = await tx
				.insert(schema.service)
				.values({
					...originalService,
					id: crypto.randomUUID(),
					clinicId: newClinicId ?? originalService.clinicId,
					serviceName: `${originalService.serviceName} (Copy)`,
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
					isDeleted: false
				})
				.returning();

			return clonedService;
		});
	},

	async batchUpdateServicePrices(updates: Array<{ id: string; price: number }>) {
		return await db.transaction(async tx => {
			const results: (typeof schema.service.$inferSelect)[] = [];

			for (const update of updates) {
				const [updated] = await tx
					.update(schema.service)
					.set({
						price: update.price,
						updatedAt: new Date()
					})
					.where(eq(schema.service.id, update.id))
					.returning();

				// Only push if the update actually found a row
				if (updated) {
					results.push(updated);
				}
			}
			return results;
		});
	},

	async createService(data: ServiceCreateInput) {
		const [result] = await db.insert(schema.service).values(data).returning();
		return result;
	},

	async createManyServices(data: ServiceCreateInput[]) {
		return await db.insert(schema.service).values(data).returning();
	},

	async updateService(id: string, data: ServiceUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.service).set(updateData).where(eq(schema.service.id, id)).returning();
		return result;
	},

	async updateManyServices(ids: string[], data: ServiceUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.service).set(updateData).where(inArray(schema.service.id, ids)).returning();
	},

	async deleteService(id: string) {
		const [result] = await db.delete(schema.service).where(eq(schema.service.id, id)).returning();
		return result;
	},

	async softDeleteService(id: string) {
		const [result] = await db
			.update(schema.service)
			.set({ deletedAt: new Date() })
			.where(eq(schema.service.id, id))
			.returning();
		return result;
	},

	async restoreService(id: string) {
		const [result] = await db
			.update(schema.service)
			.set({ deletedAt: null })
			.where(eq(schema.service.id, id))
			.returning();
		return result;
	}
};

export type ClinicRepo = typeof clinicRepo;
