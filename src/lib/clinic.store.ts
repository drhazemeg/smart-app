// stores/index.ts

import { Store } from "@tanstack/store";
import type { GrowthChartCache, GrowthPercentileHistory, ImportBatch, VelocityStandard } from "@/db";
import type { GrowthAlert, Guardian, LMSReference, Measurement, Patient, User } from "@/db/schema/types";

// ============================================================================
// Auth Store
// ============================================================================

interface AuthState {
	error: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	sessionToken: string | null;
	user: User | null;
}

export const authStore = new Store<AuthState>({
	user: null,
	isLoading: false,
	error: null,
	isAuthenticated: false,
	sessionToken: null
});

export const authActions = {
	setUser: (user: User | null) => {
		authStore.setState(prev => ({
			...prev,
			user,
			isAuthenticated: !!user
		}));
	},
	setLoading: (isLoading: boolean) => {
		authStore.setState(state => ({ ...state, isLoading }));
	},
	setError: (error: string | null) => {
		authStore.setState(state => ({ ...state, error }));
	},
	logout: () => {
		authStore.setState(() => ({
			user: null,
			isLoading: false,
			error: null,
			isAuthenticated: false,
			sessionToken: null
		}));
	}
};

// ============================================================================
// Clinic Store
// ============================================================================

interface ClinicState {
	clinics: Array<{ id: string; name: string; timezone: string }>;
	currentClinicId: string | null;
	error: string | null;
	isLoading: boolean;
}

export const clinicStore = new Store<ClinicState>({
	currentClinicId: null,
	clinics: [],
	isLoading: false,
	error: null
});

export const clinicActions = {
	setCurrentClinic: (clinicId: string | null) => {
		clinicStore.setState(state => ({ ...state, currentClinicId: clinicId }));
	},
	setClinics: (clinics: ClinicState["clinics"]) => {
		clinicStore.setState(state => ({ ...state, clinics }));
	},
	setLoading: (isLoading: boolean) => {
		clinicStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Patient Store
// ============================================================================

interface PatientState {
	currentPatient: Patient | null;
	error: string | null;
	filters: {
		search: string;
		gender: "boy" | "girl" | null;
		ageRange: { min: number | null; max: number | null };
		hasAlerts: boolean | null;
	};
	isLoading: boolean;
	patients: Patient[];
	totalCount: number;
}

export const patientStore = new Store<PatientState>({
	patients: [],
	currentPatient: null,
	isLoading: false,
	error: null,
	totalCount: 0,
	filters: {
		search: "",
		gender: null,
		ageRange: { min: null, max: null },
		hasAlerts: null
	}
});

export const patientActions = {
	setPatients: (patients: Patient[], totalCount?: number) => {
		patientStore.setState(state => ({
			...state,
			patients,
			totalCount: totalCount ?? state.totalCount
		}));
	},
	setCurrentPatient: (patient: Patient | null) => {
		patientStore.setState(state => ({ ...state, currentPatient: patient }));
	},
	addPatient: (patient: Patient) => {
		patientStore.setState(state => ({
			...state,
			patients: [patient, ...state.patients],
			totalCount: state.totalCount + 1
		}));
	},
	updatePatient: (id: string, updates: Partial<Patient>) => {
		patientStore.setState(state => ({
			...state,
			patients: state.patients.map(p => (p.id === id ? { ...p, ...updates } : p)),
			currentPatient:
				state.currentPatient?.id === id ? { ...state.currentPatient, ...updates } : state.currentPatient
		}));
	},
	deletePatient: (id: string) => {
		patientStore.setState(state => ({
			...state,
			patients: state.patients.filter(p => p.id !== id),
			totalCount: state.totalCount - 1,
			currentPatient: state.currentPatient?.id === id ? null : state.currentPatient
		}));
	},
	setFilters: (filters: Partial<PatientState["filters"]>) => {
		patientStore.setState(state => ({
			...state,
			filters: { ...state.filters, ...filters }
		}));
	},
	setLoading: (isLoading: boolean) => {
		patientStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Measurement Store (Growth Records)
// ============================================================================

interface MeasurementState {
	chartData: {
		weight: Array<{
			ageMonths: number;
			value: number;
			zScore: number | null;
			percentile: number | null;
		}>;
		height: Array<{
			ageMonths: number;
			value: number;
			zScore: number | null;
			percentile: number | null;
		}>;
		bmi: Array<{
			ageMonths: number;
			value: number;
			zScore: number | null;
			percentile: number | null;
		}>;
		head: Array<{
			ageMonths: number;
			value: number;
			zScore: number | null;
			percentile: number | null;
		}>;
	};
	currentMeasurement: Measurement | null;
	error: string | null;
	isLoading: boolean;
	measurements: Measurement[];
	stats: {
		totalMeasurements: number;
		latestWeight: number | null;
		latestHeight: number | null;
		latestBMI: number | null;
		latestWeightZ: number | null;
		latestHeightZ: number | null;
		latestBMIZ: number | null;
		growthVelocity: {
			weightGPerDay: number | null;
			heightCmPerYear: number | null;
		};
	};
}

export const measurementStore = new Store<MeasurementState>({
	measurements: [],
	currentMeasurement: null,
	isLoading: false,
	error: null,
	chartData: {
		weight: [],
		height: [],
		bmi: [],
		head: []
	},
	stats: {
		totalMeasurements: 0,
		latestWeight: null,
		latestHeight: null,
		latestBMI: null,
		latestWeightZ: null,
		latestHeightZ: null,
		latestBMIZ: null,
		growthVelocity: {
			weightGPerDay: null,
			heightCmPerYear: null
		}
	}
});

export const measurementActions = {
	setMeasurements: (measurements: Measurement[]) => {
		const sorted = [...measurements].sort(
			(a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
		);

		// Build chart data
		const chartData = {
			weight: sorted.map(m => ({
				ageMonths: m.chronologicalAgeMonths,
				value: m.weightKg ?? 0,
				zScore: m.weightForAgeZ ?? null,
				percentile: m.weightPercentile ?? null
			})),
			height: sorted.map(m => ({
				ageMonths: m.chronologicalAgeMonths,
				value: m.heightCm ?? m.lengthCm ?? 0,
				zScore: m.heightForAgeZ ?? null,
				percentile: m.heightPercentile ?? null
			})),
			bmi: sorted.map(m => ({
				ageMonths: m.chronologicalAgeMonths,
				value: m.bmi ?? 0,
				zScore: m.bmiForAgeZ ?? null,
				percentile: m.bmiPercentile ?? null
			})),
			head: sorted.map(m => ({
				ageMonths: m.chronologicalAgeMonths,
				value: m.headCircumferenceCm ?? 0,
				zScore: m.headCircumferenceForAgeZ ?? null,
				percentile: null // head percentile not stored directly
			}))
		};

		// Calculate stats
		const latest = sorted.at(-1);
		const stats = {
			totalMeasurements: sorted.length,
			latestWeight: latest?.weightKg ?? null,
			latestHeight: latest?.heightCm ?? latest?.lengthCm ?? null,
			latestBMI: latest?.bmi ?? null,
			latestWeightZ: latest?.weightForAgeZ ?? null,
			latestHeightZ: latest?.heightForAgeZ ?? null,
			latestBMIZ: latest?.bmiForAgeZ ?? null,
			growthVelocity: {
				weightGPerDay: latest?.weightVelocityGPerDay ?? null,
				heightCmPerYear: latest?.heightVelocityCmPerYear ?? null
			}
		};

		measurementStore.setState(state => ({
			...state,
			measurements: sorted,
			chartData,
			stats
		}));
	},
	setCurrentMeasurement: (measurement: Measurement | null) => {
		measurementStore.setState(state => ({
			...state,
			currentMeasurement: measurement
		}));
	},
	addMeasurement: (measurement: Measurement) => {
		measurementStore.setState(state => ({
			...state,
			measurements: [...state.measurements, measurement]
		}));
		// Rebuild chart data with new measurement
		measurementActions.setMeasurements([...measurementStore.state.measurements]);
	},
	updateMeasurement: (id: string, updates: Partial<Measurement>) => {
		measurementStore.setState(state => ({
			...state,
			measurements: state.measurements.map(m => (m.id === id ? { ...m, ...updates } : m)),
			currentMeasurement:
				state.currentMeasurement?.id === id
					? { ...state.currentMeasurement, ...updates }
					: state.currentMeasurement
		}));
		// Rebuild chart data
		measurementActions.setMeasurements([...measurementStore.state.measurements]);
	},
	deleteMeasurement: (id: string) => {
		measurementStore.setState(state => ({
			...state,
			measurements: state.measurements.filter(m => m.id !== id),
			currentMeasurement: state.currentMeasurement?.id === id ? null : state.currentMeasurement
		}));
		measurementActions.setMeasurements([...measurementStore.state.measurements]);
	},
	setLoading: (isLoading: boolean) => {
		measurementStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Growth Alert Store
// ============================================================================

interface GrowthAlertState {
	alerts: GrowthAlert[];
	currentAlert: GrowthAlert | null;
	error: string | null;
	isLoading: boolean;
	stats: {
		total: number;
		critical: number;
		warning: number;
		info: number;
		byType: Record<string, number>;
	};
	unresolvedAlerts: GrowthAlert[];
}

export const growthAlertStore = new Store<GrowthAlertState>({
	alerts: [],
	unresolvedAlerts: [],
	currentAlert: null,
	isLoading: false,
	error: null,
	stats: {
		total: 0,
		critical: 0,
		warning: 0,
		info: 0,
		byType: {}
	}
});

export const growthAlertActions = {
	setAlerts: (alerts: GrowthAlert[]) => {
		const unresolved = alerts.filter(a => !a.isResolved);
		const byType: Record<string, number> = {};
		let critical = 0;
		let warning = 0;
		let info = 0;

		for (const a of alerts) {
			byType[a.alertType] = (byType[a.alertType] || 0) + 1;
			if (a.severity === "CRITICAL") {
				critical++;
			} else if (a.severity === "WARNING") {
				warning++;
			} else if (a.severity === "INFO") {
				info++;
			}
		}

		growthAlertStore.setState(state => ({
			...state,
			alerts,
			unresolvedAlerts: unresolved,
			stats: {
				total: alerts.length,
				critical,
				warning,
				info,
				byType
			}
		}));
	},
	addAlert: (alert: GrowthAlert) => {
		growthAlertStore.setState(state => ({
			...state,
			alerts: [alert, ...state.alerts],
			unresolvedAlerts: alert.isResolved ? state.unresolvedAlerts : [alert, ...state.unresolvedAlerts]
		}));
		growthAlertActions.setAlerts([...growthAlertStore.state.alerts]);
	},
	updateAlert: (id: string, updates: Partial<GrowthAlert>) => {
		growthAlertStore.setState(state => ({
			...state,
			alerts: state.alerts.map(a => (a.id === id ? { ...a, ...updates } : a)),
			currentAlert: state.currentAlert?.id === id ? { ...state.currentAlert, ...updates } : state.currentAlert
		}));
		growthAlertActions.setAlerts([...growthAlertStore.state.alerts]);
	},
	resolveAlert: (id: string, resolvedBy: string, resolutionNote?: string) => {
		growthAlertStore.setState(state => ({
			...state,
			alerts: state.alerts.map(a =>
				a.id === id
					? {
							...a,
							isResolved: true,
							resolvedAt: new Date(),
							resolvedBy,
							resolutionNote: resolutionNote ?? null
						}
					: a
			),
			unresolvedAlerts: state.unresolvedAlerts.filter(a => a.id !== id),
			currentAlert:
				state.currentAlert?.id === id
					? {
							...state.currentAlert,
							isResolved: true,
							resolvedAt: new Date(),
							resolvedBy,
							resolutionNote: resolutionNote ?? null
						}
					: state.currentAlert
		}));
		growthAlertActions.setAlerts([...growthAlertStore.state.alerts]);
	},
	setCurrentAlert: (alert: GrowthAlert | null) => {
		growthAlertStore.setState(state => ({ ...state, currentAlert: alert }));
	},
	setLoading: (isLoading: boolean) => {
		growthAlertStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Growth Chart Cache Store
// ============================================================================

interface GrowthChartCacheState {
	caches: GrowthChartCache[];
	currentCache: GrowthChartCache | null;
	error: string | null;
	expiringSoon: GrowthChartCache[];
	isLoading: boolean;
}

export const growthChartCacheStore = new Store<GrowthChartCacheState>({
	caches: [],
	currentCache: null,
	isLoading: false,
	error: null,
	expiringSoon: []
});

export const growthChartCacheActions = {
	setCaches: (caches: GrowthChartCache[]) => {
		const now = new Date();
		const expiringSoon = caches.filter(
			c => c.expiresAt && new Date(c.expiresAt) < new Date(now.getTime() + 24 * 60 * 60 * 1000)
		);
		growthChartCacheStore.setState(state => ({
			...state,
			caches,
			expiringSoon
		}));
	},
	addCache: (cache: GrowthChartCache) => {
		growthChartCacheStore.setState(state => ({
			...state,
			caches: [...state.caches, cache]
		}));
		growthChartCacheActions.setCaches([...growthChartCacheStore.state.caches]);
	},
	updateCache: (id: string, updates: Partial<GrowthChartCache>) => {
		growthChartCacheStore.setState(state => ({
			...state,
			caches: state.caches.map(c => (c.id === id ? { ...c, ...updates } : c)),
			currentCache: state.currentCache?.id === id ? { ...state.currentCache, ...updates } : state.currentCache
		}));
		growthChartCacheActions.setCaches([...growthChartCacheStore.state.caches]);
	},
	setCurrentCache: (cache: GrowthChartCache | null) => {
		growthChartCacheStore.setState(state => ({
			...state,
			currentCache: cache
		}));
	},
	clearExpired: () => {
		const now = new Date();
		growthChartCacheStore.setState(state => ({
			...state,
			caches: state.caches.filter(c => !c.expiresAt || new Date(c.expiresAt) > now)
		}));
		growthChartCacheActions.setCaches([...growthChartCacheStore.state.caches]);
	},
	setLoading: (isLoading: boolean) => {
		growthChartCacheStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Growth Percentile History Store
// ============================================================================

interface GrowthPercentileHistoryState {
	channelCrossings: GrowthPercentileHistory[];
	currentHistory: GrowthPercentileHistory | null;
	error: string | null;
	history: GrowthPercentileHistory[];
	isLoading: boolean;
	trends: {
		weight: Array<{
			ageMonths: number;
			percentile: number | null;
			channel: number | null;
		}>;
		height: Array<{
			ageMonths: number;
			percentile: number | null;
			channel: number | null;
		}>;
		bmi: Array<{
			ageMonths: number;
			percentile: number | null;
			channel: number | null;
		}>;
		head: Array<{ ageMonths: number; percentile: number | null }>;
	};
}

export const growthPercentileHistoryStore = new Store<GrowthPercentileHistoryState>({
	history: [],
	currentHistory: null,
	isLoading: false,
	error: null,
	trends: {
		weight: [],
		height: [],
		bmi: [],
		head: []
	},
	channelCrossings: []
});

export const growthPercentileHistoryActions = {
	setHistory: (history: GrowthPercentileHistory[]) => {
		const sorted = [...history].sort((a, b) => a.ageMonths - b.ageMonths);

		const trends = {
			weight: sorted.map(h => ({
				ageMonths: h.ageMonths,
				percentile: h.weightPercentile ?? null,
				channel: h.weightChannel ?? null
			})),
			height: sorted.map(h => ({
				ageMonths: h.ageMonths,
				percentile: h.heightPercentile ?? null,
				channel: h.heightChannel ?? null
			})),
			bmi: sorted.map(h => ({
				ageMonths: h.ageMonths,
				percentile: h.bmiPercentile ?? null,
				channel: h.bmiChannel ?? null
			})),
			head: sorted.map(h => ({
				ageMonths: h.ageMonths,
				percentile: h.headPercentile ?? null
			}))
		};

		const channelCrossings = sorted.filter(h => h.weightChannelCrossed || h.heightChannelCrossed);

		growthPercentileHistoryStore.setState(state => ({
			...state,
			history: sorted,
			trends,
			channelCrossings
		}));
	},
	addHistory: (history: GrowthPercentileHistory) => {
		growthPercentileHistoryStore.setState(state => ({
			...state,
			history: [...state.history, history]
		}));
		growthPercentileHistoryActions.setHistory([...growthPercentileHistoryStore.state.history]);
	},
	setCurrentHistory: (history: GrowthPercentileHistory | null) => {
		growthPercentileHistoryStore.setState(state => ({
			...state,
			currentHistory: history
		}));
	},
	setLoading: (isLoading: boolean) => {
		growthPercentileHistoryStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// LMS Reference Store
// ============================================================================

interface LMSReferenceState {
	error: string | null;
	isLoading: boolean;
	lookupCache: Map<string, LMSReference>;
	references: LMSReference[];
}

export const lmsReferenceStore = new Store<LMSReferenceState>({
	references: [],
	isLoading: false,
	error: null,
	lookupCache: new Map()
});

export const lmsReferenceActions = {
	setReferences: (references: LMSReference[]) => {
		const cache = new Map<string, LMSReference>();
		for (const ref of references) {
			const key = `${ref.gender}_${ref.metric}_${ref.ageMonths}`;
			cache.set(key, ref);
		}
		lmsReferenceStore.setState(state => ({
			...state,
			references,
			lookupCache: cache
		}));
	},
	getLMSParameters: (gender: "boy" | "girl", metric: "weight" | "height", ageMonths: number) => {
		const key = `${gender}_${metric}_${ageMonths}`;
		const state = lmsReferenceStore.state;
		return state.lookupCache.get(key) || null;
	},
	setLoading: (isLoading: boolean) => {
		lmsReferenceStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Velocity Standards Store
// ============================================================================

interface VelocityStandardsState {
	byGenderParameter: Map<string, VelocityStandard[]>;
	error: string | null;
	isLoading: boolean;
	standards: VelocityStandard[];
}

export const velocityStandardsStore = new Store<VelocityStandardsState>({
	standards: [],
	isLoading: false,
	error: null,
	byGenderParameter: new Map()
});

export const velocityStandardsActions = {
	setStandards: (standards: VelocityStandard[]) => {
		const byGenderParameter = new Map<string, VelocityStandard[]>();
		for (const std of standards) {
			const key = `${std.gender}_${std.parameter}`;
			if (!byGenderParameter.has(key)) {
				byGenderParameter.set(key, []);
			}
			byGenderParameter.get(key)?.push(std);
		}
		velocityStandardsStore.setState(state => ({
			...state,
			standards,
			byGenderParameter
		}));
	},
	getStandardForAge: (
		gender: "boy" | "girl",
		parameter: "weight_velocity" | "height_velocity",
		ageMonths: number
	) => {
		const key = `${gender}_${parameter}`;
		const state = velocityStandardsStore.state;
		const standards = state.byGenderParameter.get(key) || [];
		return standards.find(s => ageMonths >= s.minAgeMonths && ageMonths <= s.maxAgeMonths) || null;
	},
	setLoading: (isLoading: boolean) => {
		velocityStandardsStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Guardian Store
// ============================================================================

interface GuardianState {
	currentGuardian: Guardian | null;
	error: string | null;
	guardians: Guardian[];
	isLoading: boolean;
	primaryGuardian: Guardian | null;
}

export const guardianStore = new Store<GuardianState>({
	guardians: [],
	currentGuardian: null,
	isLoading: false,
	error: null,
	primaryGuardian: null
});

export const guardianActions = {
	setGuardians: (guardians: Guardian[]) => {
		const primary = guardians.find(g => g.isPrimary) || null;
		guardianStore.setState(state => ({
			...state,
			guardians,
			primaryGuardian: primary
		}));
	},
	addGuardian: (guardian: Guardian) => {
		guardianStore.setState(state => ({
			...state,
			guardians: [...state.guardians, guardian]
		}));
		guardianActions.setGuardians([...guardianStore.state.guardians]);
	},
	updateGuardian: (id: string, updates: Partial<Guardian>) => {
		guardianStore.setState(state => ({
			...state,
			guardians: state.guardians.map(g => (g.id === id ? { ...g, ...updates } : g)),
			currentGuardian:
				state.currentGuardian?.id === id ? { ...state.currentGuardian, ...updates } : state.currentGuardian
		}));
		guardianActions.setGuardians([...guardianStore.state.guardians]);
	},
	setCurrentGuardian: (guardian: Guardian | null) => {
		guardianStore.setState(state => ({
			...state,
			currentGuardian: guardian
		}));
	},
	setLoading: (isLoading: boolean) => {
		guardianStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Import Batch Store
// ============================================================================

interface ImportBatchState {
	batches: ImportBatch[];
	currentBatch: ImportBatch | null;
	error: string | null;
	isLoading: boolean;
	pendingBatches: ImportBatch[];
	processingBatches: ImportBatch[];
}

export const importBatchStore = new Store<ImportBatchState>({
	batches: [],
	currentBatch: null,
	isLoading: false,
	error: null,
	pendingBatches: [],
	processingBatches: []
});

export const importBatchActions = {
	setBatches: (batches: ImportBatch[]) => {
		const pending = batches.filter(b => b.status === "PENDING");
		const processing = batches.filter(b => b.status === "PROCESSING");
		importBatchStore.setState(state => ({
			...state,
			batches,
			pendingBatches: pending,
			processingBatches: processing
		}));
	},
	addBatch: (batch: ImportBatch) => {
		importBatchStore.setState(state => ({
			...state,
			batches: [batch, ...state.batches]
		}));
		importBatchActions.setBatches([...importBatchStore.state.batches]);
	},
	updateBatch: (id: string, updates: Partial<ImportBatch>) => {
		importBatchStore.setState(state => ({
			...state,
			batches: state.batches.map(b => (b.id === id ? { ...b, ...updates } : b)),
			currentBatch: state.currentBatch?.id === id ? { ...state.currentBatch, ...updates } : state.currentBatch
		}));
		importBatchActions.setBatches([...importBatchStore.state.batches]);
	},
	setCurrentBatch: (batch: ImportBatch | null) => {
		importBatchStore.setState(state => ({ ...state, currentBatch: batch }));
	},
	setLoading: (isLoading: boolean) => {
		importBatchStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// UI Store (for global UI state)
// ============================================================================

interface UIState {
	currentModule: "dashboard" | "patients" | "growth" | "alerts" | "reports" | "settings";
	loadingOverlay: boolean;
	notificationsEnabled: boolean;
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";
	toasts: Array<{
		id: string;
		message: string;
		type: "success" | "error" | "info" | "warning";
	}>;
}

export const uiStore = new Store<UIState>({
	sidebarOpen: true,
	theme: "system",
	notificationsEnabled: true,
	currentModule: "dashboard",
	loadingOverlay: false,
	toasts: []
});

export const uiActions = {
	toggleSidebar: () => {
		uiStore.setState(state => ({
			...state,
			sidebarOpen: !state.sidebarOpen
		}));
	},
	setTheme: (theme: UIState["theme"]) => {
		uiStore.setState(state => ({ ...state, theme }));
	},
	setCurrentModule: (module: UIState["currentModule"]) => {
		uiStore.setState(state => ({ ...state, currentModule: module }));
	},
	setLoadingOverlay: (loading: boolean) => {
		uiStore.setState(state => ({ ...state, loadingOverlay: loading }));
	},
	addToast: (toast: { message: string; type: UIState["toasts"][number]["type"] }) => {
		const id = Date.now().toString();
		uiStore.setState(state => ({
			...state,
			toasts: [...state.toasts, { id, message: toast.message, type: toast.type }]
		}));
		setTimeout(() => {
			uiStore.setState(state => ({
				...state,
				toasts: state.toasts.filter(t => t.id !== id)
			}));
		}, 5000);
	},
	removeToast: (id: string) => {
		uiStore.setState(state => ({
			...state,
			toasts: state.toasts.filter(t => t.id !== id)
		}));
	}
};

// ============================================================================
// Consolidated Exports
// ============================================================================

export const stores = {
	auth: authStore,
	clinic: clinicStore,
	patient: patientStore,
	measurement: measurementStore,
	growthAlert: growthAlertStore,
	growthChartCache: growthChartCacheStore,
	growthPercentileHistory: growthPercentileHistoryStore,
	lmsReference: lmsReferenceStore,
	velocityStandards: velocityStandardsStore,
	guardian: guardianStore,
	importBatch: importBatchStore,
	ui: uiStore
};

export const actions = {
	auth: authActions,
	clinic: clinicActions,
	patient: patientActions,
	measurement: measurementActions,
	growthAlert: growthAlertActions,
	growthChartCache: growthChartCacheActions,
	growthPercentileHistory: growthPercentileHistoryActions,
	lmsReference: lmsReferenceActions,
	velocityStandards: velocityStandardsActions,
	guardian: guardianActions,
	importBatch: importBatchActions,
	ui: uiActions
};
