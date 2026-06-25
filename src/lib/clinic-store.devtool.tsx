// clinic-store.devtool.tsx
// TanStack Devtools plugin for clinic stores.
// Usage in __root.tsx: import StoreDevtools from "@/lib/clinic-store.devtool";
// then add StoreDevtools to the plugins array of <TanStackDevtools />.

import { EventClient } from "@tanstack/devtools-event-client";
import { useEffect, useState } from "react";

import {
	authStore,
	clinicStore,
	growthAlertStore,
	growthChartCacheStore,
	growthPercentileHistoryStore,
	guardianStore,
	importBatchStore,
	lmsReferenceStore,
	measurementStore,
	patientStore,
	uiStore,
	velocityStandardsStore
} from "./clinic.store";

// ============================================================================
// EventMap  (pluginId:eventName  →  payload shape)
// ============================================================================

type EventMap = {
	"clinic-store:auth": {
		isAuthenticated: boolean;
		isLoading: boolean;
		error: string | null;
		userId: string | null;
		userName: string | null;
	};
	"clinic-store:clinic": {
		currentClinicId: string | null;
		clinicsCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:patient": {
		patientsCount: number;
		currentPatientName: string | null;
		totalCount: number;
		isLoading: boolean;
		error: string | null;
		filterSearch: string;
		filterGender: string | null;
		hasAlerts: boolean | null;
	};
	"clinic-store:measurement": {
		measurementsCount: number;
		chartDataPoints: number;
		latestWeight: number | null;
		latestHeight: number | null;
		latestBMI: number | null;
		growthVelocity: {
			weightGPerDay: number | null;
			heightCmPerYear: number | null;
		};
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:growth-alert": {
		totalAlerts: number;
		unresolvedAlerts: number;
		criticalAlerts: number;
		warningAlerts: number;
		infoAlerts: number;
		alertTypes: Record<string, number>;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:chart-cache": {
		cachesCount: number;
		expiringSoonCount: number;
		hasValidCache: boolean;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:percentile-history": {
		historyCount: number;
		channelCrossingsCount: number;
		weightTrend: number;
		heightTrend: number;
		bmiTrend: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:lms-reference": {
		referencesCount: number;
		cacheSize: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:velocity-standards": {
		standardsCount: number;
		byGenderParameter: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:guardian": {
		guardiansCount: number;
		hasPrimaryGuardian: boolean;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:import-batch": {
		batchesCount: number;
		pendingBatches: number;
		processingBatches: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:ui": {
		sidebarOpen: boolean;
		theme: string;
		currentModule: string;
		toastsCount: number;
	};
};

// ============================================================================
// Event client  (pluginId = "clinic-store")
// ============================================================================

class ClinicStoreEventClient extends EventClient<EventMap> {
	constructor() {
		super({ pluginId: "clinic-store" });
	}
}

const sdec = new ClinicStoreEventClient();

// ============================================================================
// Subscriptions — emit full event names
// ============================================================================

authStore.subscribe(() => {
	const s = authStore.state;
	sdec.emit("clinic-store:auth", {
		isAuthenticated: s.isAuthenticated,
		isLoading: s.isLoading,
		error: s.error,
		userId: s.user?.id ?? null,
		userName: s.user?.name ?? null
	});
});

clinicStore.subscribe(() => {
	const s = clinicStore.state;
	sdec.emit("clinic-store:clinic", {
		currentClinicId: s.currentClinicId ?? null,
		clinicsCount: s.clinics.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

patientStore.subscribe(() => {
	const s = patientStore.state;
	sdec.emit("clinic-store:patient", {
		patientsCount: s.patients.length,
		currentPatientName: s.currentPatient ? `${s.currentPatient.firstName} ${s.currentPatient.lastName}` : null,
		totalCount: s.totalCount,
		isLoading: s.isLoading,
		error: s.error,
		filterSearch: s.filters.search,
		filterGender: s.filters.gender,
		hasAlerts: s.filters.hasAlerts
	});
});

measurementStore.subscribe(() => {
	const s = measurementStore.state;
	sdec.emit("clinic-store:measurement", {
		measurementsCount: s.measurements.length,
		chartDataPoints:
			s.chartData.weight.length + s.chartData.height.length + s.chartData.bmi.length + s.chartData.head.length,
		latestWeight: s.stats.latestWeight,
		latestHeight: s.stats.latestHeight,
		latestBMI: s.stats.latestBMI,
		growthVelocity: s.stats.growthVelocity,
		isLoading: s.isLoading,
		error: s.error
	});
});

growthAlertStore.subscribe(() => {
	const s = growthAlertStore.state;
	sdec.emit("clinic-store:growth-alert", {
		totalAlerts: s.stats.total,
		unresolvedAlerts: s.unresolvedAlerts.length,
		criticalAlerts: s.stats.critical,
		warningAlerts: s.stats.warning,
		infoAlerts: s.stats.info,
		alertTypes: s.stats.byType,
		isLoading: s.isLoading,
		error: s.error
	});
});

growthChartCacheStore.subscribe(() => {
	const s = growthChartCacheStore.state;
	sdec.emit("clinic-store:chart-cache", {
		cachesCount: s.caches.length,
		expiringSoonCount: s.expiringSoon.length,
		hasValidCache: s.caches.some(c => c.expiresAt && new Date(c.expiresAt) > new Date()),
		isLoading: s.isLoading,
		error: s.error
	});
});

growthPercentileHistoryStore.subscribe(() => {
	const s = growthPercentileHistoryStore.state;
	const weightTrend = s.trends.weight.length > 0 ? (s.trends.weight.at(-1)?.percentile ?? 0) : 0;
	const heightTrend = s.trends.height.length > 0 ? (s.trends.height.at(-1)?.percentile ?? 0) : 0;
	const bmiTrend = s.trends.bmi.length > 0 ? (s.trends.bmi.at(-1)?.percentile ?? 0) : 0;

	sdec.emit("clinic-store:percentile-history", {
		historyCount: s.history.length,
		channelCrossingsCount: s.channelCrossings.length,
		weightTrend,
		heightTrend,
		bmiTrend,
		isLoading: s.isLoading,
		error: s.error
	});
});

lmsReferenceStore.subscribe(() => {
	const s = lmsReferenceStore.state;
	sdec.emit("clinic-store:lms-reference", {
		referencesCount: s.references.length,
		cacheSize: s.lookupCache.size,
		isLoading: s.isLoading,
		error: s.error
	});
});

velocityStandardsStore.subscribe(() => {
	const s = velocityStandardsStore.state;
	sdec.emit("clinic-store:velocity-standards", {
		standardsCount: s.standards.length,
		byGenderParameter: s.byGenderParameter.size,
		isLoading: s.isLoading,
		error: s.error
	});
});

guardianStore.subscribe(() => {
	const s = guardianStore.state;
	sdec.emit("clinic-store:guardian", {
		guardiansCount: s.guardians.length,
		hasPrimaryGuardian: !!s.primaryGuardian,
		isLoading: s.isLoading,
		error: s.error
	});
});

importBatchStore.subscribe(() => {
	const s = importBatchStore.state;
	sdec.emit("clinic-store:import-batch", {
		batchesCount: s.batches.length,
		pendingBatches: s.pendingBatches.length,
		processingBatches: s.processingBatches.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

uiStore.subscribe(() => {
	const s = uiStore.state;
	sdec.emit("clinic-store:ui", {
		sidebarOpen: s.sidebarOpen,
		theme: s.theme,
		currentModule: s.currentModule,
		toastsCount: s.toasts.length
	});
});

// ============================================================================
// Panel component
// ============================================================================

function DevtoolPanel() {
	const [auth, setAuth] = useState<EventMap["clinic-store:auth"]>(() => {
		const s = authStore.state;
		return {
			isAuthenticated: s.isAuthenticated,
			isLoading: s.isLoading,
			error: s.error,
			userId: s.user?.id ?? null,
			userName: s.user?.name ?? null
		};
	});
	const [clinic, setClinic] = useState<EventMap["clinic-store:clinic"]>(() => {
		const s = clinicStore.state;
		return {
			currentClinicId: s.currentClinicId ?? null,
			clinicsCount: s.clinics.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [patient, setPatient] = useState<EventMap["clinic-store:patient"]>(() => {
		const s = patientStore.state;
		return {
			patientsCount: s.patients.length,
			currentPatientName: s.currentPatient ? `${s.currentPatient.firstName} ${s.currentPatient.lastName}` : null,
			totalCount: s.totalCount,
			isLoading: s.isLoading,
			error: s.error,
			filterSearch: s.filters.search,
			filterGender: s.filters.gender,
			hasAlerts: s.filters.hasAlerts
		};
	});
	const [measurement, setMeasurement] = useState<EventMap["clinic-store:measurement"]>(() => {
		const s = measurementStore.state;
		return {
			measurementsCount: s.measurements.length,
			chartDataPoints:
				s.chartData.weight.length +
				s.chartData.height.length +
				s.chartData.bmi.length +
				s.chartData.head.length,
			latestWeight: s.stats.latestWeight,
			latestHeight: s.stats.latestHeight,
			latestBMI: s.stats.latestBMI,
			growthVelocity: s.stats.growthVelocity,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [growthAlert, setGrowthAlert] = useState<EventMap["clinic-store:growth-alert"]>(() => {
		const s = growthAlertStore.state;
		return {
			totalAlerts: s.stats.total,
			unresolvedAlerts: s.unresolvedAlerts.length,
			criticalAlerts: s.stats.critical,
			warningAlerts: s.stats.warning,
			infoAlerts: s.stats.info,
			alertTypes: s.stats.byType,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [chartCache, setChartCache] = useState<EventMap["clinic-store:chart-cache"]>(() => {
		const s = growthChartCacheStore.state;
		return {
			cachesCount: s.caches.length,
			expiringSoonCount: s.expiringSoon.length,
			hasValidCache: s.caches.some(c => c.expiresAt && new Date(c.expiresAt) > new Date()),
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [percentileHistory, setPercentileHistory] = useState<EventMap["clinic-store:percentile-history"]>(() => {
		const s = growthPercentileHistoryStore.state;
		const weightTrend = s.trends.weight.length > 0 ? (s.trends.weight.at(-1)?.percentile ?? 0) : 0;
		const heightTrend = s.trends.height.length > 0 ? (s.trends.height.at(-1)?.percentile ?? 0) : 0;
		const bmiTrend = s.trends.bmi.length > 0 ? (s.trends.bmi.at(-1)?.percentile ?? 0) : 0;
		return {
			historyCount: s.history.length,
			channelCrossingsCount: s.channelCrossings.length,
			weightTrend,
			heightTrend,
			bmiTrend,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [lmsRef, setLmsRef] = useState<EventMap["clinic-store:lms-reference"]>(() => {
		const s = lmsReferenceStore.state;
		return {
			referencesCount: s.references.length,
			cacheSize: s.lookupCache.size,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [velocityStd, setVelocityStd] = useState<EventMap["clinic-store:velocity-standards"]>(() => {
		const s = velocityStandardsStore.state;
		return {
			standardsCount: s.standards.length,
			byGenderParameter: s.byGenderParameter.size,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [guardian, setGuardian] = useState<EventMap["clinic-store:guardian"]>(() => {
		const s = guardianStore.state;
		return {
			guardiansCount: s.guardians.length,
			hasPrimaryGuardian: !!s.primaryGuardian,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [importBatch, setImportBatch] = useState<EventMap["clinic-store:import-batch"]>(() => {
		const s = importBatchStore.state;
		return {
			batchesCount: s.batches.length,
			pendingBatches: s.pendingBatches.length,
			processingBatches: s.processingBatches.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [ui, setUi] = useState<EventMap["clinic-store:ui"]>(() => {
		const s = uiStore.state;
		return {
			sidebarOpen: s.sidebarOpen,
			theme: s.theme,
			currentModule: s.currentModule,
			toastsCount: s.toasts.length
		};
	});

	useEffect(() => {
		const unsubs = [
			sdec.on("clinic-store:auth", e => setAuth(e.payload)),
			sdec.on("clinic-store:clinic", e => setClinic(e.payload)),
			sdec.on("clinic-store:patient", e => setPatient(e.payload)),
			sdec.on("clinic-store:measurement", e => setMeasurement(e.payload)),
			sdec.on("clinic-store:growth-alert", e => setGrowthAlert(e.payload)),
			sdec.on("clinic-store:chart-cache", e => setChartCache(e.payload)),
			sdec.on("clinic-store:percentile-history", e => setPercentileHistory(e.payload)),
			sdec.on("clinic-store:lms-reference", e => setLmsRef(e.payload)),
			sdec.on("clinic-store:velocity-standards", e => setVelocityStd(e.payload)),
			sdec.on("clinic-store:guardian", e => setGuardian(e.payload)),
			sdec.on("clinic-store:import-batch", e => setImportBatch(e.payload)),
			sdec.on("clinic-store:ui", e => setUi(e.payload))
		];
		return () => {
			for (const fn of unsubs) {
				fn();
			}
		};
	}, []);

	const val = (v: string | number | boolean | null | undefined) => (v === null || v === undefined ? "—" : String(v));

	const row = (label: string, value: string | number | boolean | null | undefined) => (
		<>
			<div className='whitespace-nowrap font-bold text-gray-500 text-sm'>{label}</div>
			<div className='text-sm'>{val(value)}</div>
		</>
	);

	return (
		<div className='grid grid-cols-[1fr_10fr] gap-4 p-4 text-sm'>
			{/* Auth */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Auth</div>
			{row("Authenticated", auth.isAuthenticated)}
			{row("User", auth.userName)}
			{row("User ID", auth.userId)}
			{row("Loading", auth.isLoading)}
			{row("Error", auth.error)}

			{/* Clinic */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Clinic</div>
			{row("Current Clinic ID", clinic.currentClinicId)}
			{row("Total Clinics", clinic.clinicsCount)}
			{row("Loading", clinic.isLoading)}
			{row("Error", clinic.error)}

			{/* Patient */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Patient</div>
			{row("Loaded", patient.patientsCount)}
			{row("Total", patient.totalCount)}
			{row("Current", patient.currentPatientName)}
			{row("Search", patient.filterSearch || "—")}
			{row("Gender Filter", patient.filterGender || "—")}
			{row("Has Alerts", patient.hasAlerts === null ? "—" : patient.hasAlerts)}
			{row("Loading", patient.isLoading)}
			{row("Error", patient.error)}

			{/* Measurements */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Measurements
			</div>
			{row("Records", measurement.measurementsCount)}
			{row("Chart Points", measurement.chartDataPoints)}
			{row("Latest Weight (kg)", measurement.latestWeight)}
			{row("Latest Height (cm)", measurement.latestHeight)}
			{row("Latest BMI", measurement.latestBMI)}
			{row("Weight Velocity (g/day)", measurement.growthVelocity.weightGPerDay?.toFixed(1))}
			{row("Height Velocity (cm/yr)", measurement.growthVelocity.heightCmPerYear?.toFixed(1))}
			{row("Loading", measurement.isLoading)}
			{row("Error", measurement.error)}

			{/* Growth Alerts */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Growth Alerts
			</div>
			{row("Total", growthAlert.totalAlerts)}
			{row("Unresolved", growthAlert.unresolvedAlerts)}
			{row("Critical", growthAlert.criticalAlerts)}
			{row("Warning", growthAlert.warningAlerts)}
			{row("Info", growthAlert.infoAlerts)}
			{row(
				"Alert Types",
				Object.keys(growthAlert.alertTypes).length > 0
					? Object.entries(growthAlert.alertTypes)
							.map(([k, v]) => `${k}: ${v}`)
							.join(", ")
					: "—"
			)}
			{row("Loading", growthAlert.isLoading)}
			{row("Error", growthAlert.error)}

			{/* Chart Cache */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Chart Cache
			</div>
			{row("Caches", chartCache.cachesCount)}
			{row("Expiring Soon", chartCache.expiringSoonCount)}
			{row("Has Valid Cache", chartCache.hasValidCache)}
			{row("Loading", chartCache.isLoading)}
			{row("Error", chartCache.error)}

			{/* Percentile History */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Percentile History
			</div>
			{row("History Records", percentileHistory.historyCount)}
			{row("Channel Crossings", percentileHistory.channelCrossingsCount)}
			{row("Weight Trend (latest %)", percentileHistory.weightTrend.toFixed(1))}
			{row("Height Trend (latest %)", percentileHistory.heightTrend.toFixed(1))}
			{row("BMI Trend (latest %)", percentileHistory.bmiTrend.toFixed(1))}
			{row("Loading", percentileHistory.isLoading)}
			{row("Error", percentileHistory.error)}

			{/* LMS Reference */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				LMS Reference
			</div>
			{row("References", lmsRef.referencesCount)}
			{row("Cache Size", lmsRef.cacheSize)}
			{row("Loading", lmsRef.isLoading)}
			{row("Error", lmsRef.error)}

			{/* Velocity Standards */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Velocity Standards
			</div>
			{row("Standards", velocityStd.standardsCount)}
			{row("Gender/Parameter Groups", velocityStd.byGenderParameter)}
			{row("Loading", velocityStd.isLoading)}
			{row("Error", velocityStd.error)}

			{/* Guardian */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Guardian</div>
			{row("Guardians", guardian.guardiansCount)}
			{row("Has Primary", guardian.hasPrimaryGuardian)}
			{row("Loading", guardian.isLoading)}
			{row("Error", guardian.error)}

			{/* Import Batches */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Import Batches
			</div>
			{row("Total", importBatch.batchesCount)}
			{row("Pending", importBatch.pendingBatches)}
			{row("Processing", importBatch.processingBatches)}
			{row("Loading", importBatch.isLoading)}
			{row("Error", importBatch.error)}

			{/* UI */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>UI State</div>
			{row("Sidebar Open", ui.sidebarOpen)}
			{row("Theme", ui.theme)}
			{row("Current Module", ui.currentModule)}
			{row("Toasts", ui.toastsCount)}
		</div>
	);
}

// ============================================================================
// Export — single object, matching the TanStack Devtools plugin shape
// ============================================================================

export default {
	name: "Clinic Store",
	render: <DevtoolPanel />
};
