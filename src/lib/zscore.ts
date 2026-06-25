// WHO 2007 Reference LMS Parameters for Boys and Girls
// Age in months, parameters for Height-for-Age and BMI-for-Age
// Weight-for-Age only up to 120 months (10 years)
import zscoreWfaData from "../../data/zscore-wfa.json";

interface LMSParams {
	l: number; // Box-Cox power
	m: number; // Median
	s: number; // Coefficient of variation
}

interface WHOReference {
	bmiForAge: Record<number, { boy: LMSParams; girl: LMSParams }>;
	heightForAge: Record<number, { boy: LMSParams; girl: LMSParams }>;
	weightForAge: Record<number, { boy: LMSParams; girl: LMSParams }>;
}

// Simplified LMS parameters for ages 5-19 years (60-228 months)
// Based on WHO 2007 reference tables
const whoReference: WHOReference = {
	heightForAge: generateHeightForAgeParams(),
	weightForAge: generateWeightForAgeParams(),
	bmiForAge: generateBMIForAgeParams()
};

function generateHeightForAgeParams(): WHOReference["heightForAge"] {
	const params: WHOReference["heightForAge"] = {};

	// Ages from 60 months (5 years) to 228 months (19 years)
	for (let months = 60; months <= 228; months++) {
		const age = months / 12;

		// LMS parameters derived from WHO 2007 reference
		// These are simplified representative values
		// In production, you would use the complete WHO tables
		params[months] = {
			boy: calculateHeightParams(age, "boy"),
			girl: calculateHeightParams(age, "girl")
		};
	}

	return params;
}

function generateWeightForAgeParams(): WHOReference["weightForAge"] {
	const params: WHOReference["weightForAge"] = {};

	// Weight-for-age only up to 120 months (10 years)
	for (let months = 60; months <= 120; months++) {
		const age = months / 12;
		params[months] = {
			boy: calculateWeightParams(age, "boy"),
			girl: calculateWeightParams(age, "girl")
		};
	}

	return params;
}

function generateBMIForAgeParams(): WHOReference["bmiForAge"] {
	const params: WHOReference["bmiForAge"] = {};

	for (let months = 60; months <= 228; months++) {
		const age = months / 12;
		params[months] = {
			boy: calculateBMIParams(age, "boy"),
			girl: calculateBMIParams(age, "girl")
		};
	}

	return params;
}

// Helper function to calculate height LMS parameters by age
function calculateHeightParams(ageYears: number, gender: "boy" | "girl"): LMSParams {
	// These are simplified polynomial approximations of WHO 2007 data
	// For production, use complete reference tables
	if (gender === "boy") {
		if (ageYears <= 10) {
			return {
				l: 1.0,
				m: 76.5 + 5.7 * ageYears,
				s: 0.036 - 0.0008 * ageYears
			};
		}
		if (ageYears <= 15) {
			return {
				l: 0.8,
				m: 131.2 + 4.2 * (ageYears - 10),
				s: 0.028 + 0.0002 * (ageYears - 10)
			};
		}
		return {
			l: 0.5,
			m: 167.8 + 1.4 * (ageYears - 15),
			s: 0.032
		};
	}
	if (ageYears <= 10) {
		return {
			l: 1.0,
			m: 75.2 + 5.5 * ageYears,
			s: 0.035 - 0.0007 * ageYears
		};
	}
	if (ageYears <= 14) {
		return {
			l: 0.8,
			m: 130.5 + 4.8 * (ageYears - 10),
			s: 0.027 + 0.0003 * (ageYears - 10)
		};
	}
	return {
		l: 0.5,
		m: 158.5 + 1.0 * (ageYears - 14),
		s: 0.031
	};
}

function calculateWeightParams(ageYears: number, gender: "boy" | "girl"): LMSParams {
	if (gender === "boy") {
		if (ageYears <= 8) {
			return {
				l: 0.9,
				m: 7.2 + 2.3 * ageYears,
				s: 0.12 - 0.007 * ageYears
			};
		}
		return {
			l: 0.7,
			m: 25.4 + 3.1 * (ageYears - 8),
			s: 0.08 - 0.002 * (ageYears - 8)
		};
	}
	if (ageYears <= 8) {
		return {
			l: 0.9,
			m: 6.9 + 2.2 * ageYears,
			s: 0.12 - 0.007 * ageYears
		};
	}
	return {
		l: 0.7,
		m: 24.6 + 3.3 * (ageYears - 8),
		s: 0.08 - 0.002 * (ageYears - 8)
	};
}

function calculateBMIParams(ageYears: number, gender: "boy" | "girl"): LMSParams {
	if (gender === "boy") {
		if (ageYears <= 12) {
			return {
				l: -0.5,
				m: 15.2 + 0.15 * ageYears,
				s: 0.09 - 0.002 * ageYears
			};
		}
		return {
			l: -0.8,
			m: 19.5 + 0.25 * (ageYears - 12),
			s: 0.07 + 0.001 * (ageYears - 12)
		};
	}
	if (ageYears <= 11) {
		return {
			l: -0.5,
			m: 15.0 + 0.2 * ageYears,
			s: 0.09 - 0.002 * ageYears
		};
	}
	if (ageYears <= 15) {
		return {
			l: -0.7,
			m: 18.2 + 0.4 * (ageYears - 11),
			s: 0.075 + 0.0005 * (ageYears - 11)
		};
	}
	return {
		l: -0.6,
		m: 21.0 + 0.1 * (ageYears - 15),
		s: 0.082
	};
}

export function getLMSParams(
	ageMonths: number,
	gender: "boy" | "girl",
	metric: "height" | "weight" | "bmi"
): LMSParams | null {
	// Weight-for-age not calculated beyond 120 months
	if (metric === "weight" && ageMonths > 120) {
		return null;
	}

	// Height-for-age and BMI-for-age up to 228 months
	if ((metric === "height" || metric === "bmi") && (ageMonths < 60 || ageMonths > 228)) {
		return null;
	}

	if (metric === "weight" && (ageMonths < 60 || ageMonths > 120)) {
		return null;
	}

	const referenceMap = {
		height: whoReference.heightForAge,
		weight: whoReference.weightForAge,
		bmi: whoReference.bmiForAge
	} as const;

	// Simply access the reference using the metric key
	const reference = referenceMap[metric as keyof typeof referenceMap];

	//// Find closest age match
	const ages = Object.keys(reference).map(Number);
	const closestAge = ages.reduce((prev, curr) =>
		Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
	);

	return reference[closestAge]?.[gender] || null;
}

export function calculateZScore(value: number, params: LMSParams): number {
	const { l, m, s } = params;

	if (l === 0) {
		return Math.log(value / m) / s;
	}

	return ((value / m) ** l - 1) / (l * s);
}

export function calculateValueFromZScore(zScore: number, params: LMSParams): number {
	const { l, m, s } = params;

	if (l === 0) {
		return m * Math.exp(zScore * s);
	}

	return m * (1 + l * s * zScore) ** (1 / l);
}

export interface GrowthAssessment {
	bmiZScore: number | null;
	heightZScore: number | null;
	percentiles: {
		weight: number | null;
		height: number | null;
		bmi: number | null;
	};
	weightForAgeAllowed: boolean;
	weightZScore: number | null;
}

export function assessGrowth(
	ageMonths: number,
	gender: "boy" | "girl",
	weightKg?: number,
	heightCm?: number
): GrowthAssessment {
	const weightForAgeAllowed = ageMonths <= 120;

	let weightZScore: number | null = null;
	let heightZScore: number | null = null;
	let bmiZScore: number | null = null;

	let bmi: number | null = null;
	if (weightKg && heightCm && heightCm > 0) {
		bmi = weightKg / (heightCm / 100) ** 2;
	}

	// Calculate weight Z-score
	if (weightKg !== undefined && weightForAgeAllowed) {
		const params = getLMSParams(ageMonths, gender, "weight");
		if (params) {
			weightZScore = calculateZScore(weightKg, params);
		}
	}

	// Calculate height Z-score
	if (heightCm !== undefined) {
		const params = getLMSParams(ageMonths, gender, "height");
		if (params) {
			heightZScore = calculateZScore(heightCm, params);
		}
	}

	// Calculate BMI Z-score
	if (bmi !== null) {
		const params = getLMSParams(ageMonths, gender, "bmi");
		if (params) {
			bmiZScore = calculateZScore(bmi, params);
		}
	}

	// Convert Z-scores to percentiles
	const zToPercentile = (z: number | null): number | null => {
		if (z === null) {
			return null;
		}
		// Standard normal CDF approximation
		const t = 1 / (1 + 0.231_641_9 * Math.abs(z));
		const d = 0.398_942_3 * Math.exp((-z * z) / 2);
		const p = d * t * (0.319_381_5 + t * (-0.356_563_8 + t * (1.781_478 + t * (-1.821_256 + t * 1.330_274))));
		const percentile = 1 - p;
		return z > 0 ? percentile * 100 : (1 - percentile) * 100;
	};

	return {
		weightZScore,
		heightZScore,
		bmiZScore,
		weightForAgeAllowed,
		percentiles: {
			weight: zToPercentile(weightZScore),
			height: zToPercentile(heightZScore),
			bmi: zToPercentile(bmiZScore)
		}
	};
}

export function getZScoreCurvePoints(
	ageMonths: number[],
	gender: "boy" | "girl",
	metric: "height" | "weight" | "bmi",
	zScores: number[] = [-3, -2, -1, 0, 1, 2, 3]
): Array<{ ageMonths: number; values: Record<number, number> }> {
	const result: Array<{ ageMonths: number; values: Record<number, number> }> = [];

	for (const age of ageMonths) {
		const params = getLMSParams(age, gender, metric);
		if (params) {
			const values: Record<number, number> = {};
			for (const z of zScores) {
				values[z] = calculateValueFromZScore(z, params);
			}
			result.push({ ageMonths: age, values });
		}
	}

	return result;
}

// Type definitions for LMS reference data
interface LMSRecord {
	Day: string;
	L: string;
	M: string;
	S: string;
	SD0: string;
	SD1: string;
	SD1neg: string;
	SD2: string;
	SD2neg: string;
	SD3: string;
	SD3neg: string;
	SD4: string;
	SD4neg: string;
}

interface ZScoreData {
	wfa: {
		boys: LMSRecord[];
		girls: LMSRecord[];
	};
}

const zscoreData = zscoreWfaData as ZScoreData;

/**
 * Calculate Z-score using LMS method
 * Z = [(X/M)^L - 1] / (L * S)
 * where X is the observation, L/M/S are the parameters
 */
function calculateZScoreFromLMS(value: number, L: number, M: number, S: number): number {
	if (M === 0 || S === 0) {
		return 0;
	}

	if (L === 0) {
		return Math.log(value / M) / S;
	}

	const zscore = ((value / M) ** L - 1) / (L * S);
	return Math.round(zscore * 100) / 100; // Round to 2 decimal places
}

/**
 * Get the closest LMS record for a given age in days
 */
function getClosestLMSRecord(ageInDays: number, records: LMSRecord[]): LMSRecord | null {
	if (records.length === 0) {
		return null;
	}

	let closest = records[0];
	let minDiff = Math.abs(Number.parseInt(records[0].Day, 10) - ageInDays);

	for (const record of records) {
		const diff = Math.abs(Number.parseInt(record.Day, 10) - ageInDays);
		if (diff < minDiff) {
			minDiff = diff;
			closest = record;
		}
	}

	return closest;
}

/**
 * Calculate Weight-for-Age Z-Score
 * Valid only for ages 60-120 months (5-10 years)
 * Per El Shafie et al. (2020)
 */
export function calculateWeightForAgeZScore(
	weight: number,
	ageInMonths: number,
	gender: "boy" | "girl"
): number | null {
	// Validate age range: Weight-for-Age is only valid for 5-10 years
	if (ageInMonths < 60 || ageInMonths > 120) {
		return null; // Out of valid range
	}

	const ageInDays = Math.round(ageInMonths * 30.44); // Convert months to days (avg days per month)
	const records = gender === "boy" ? zscoreData.wfa.boys : zscoreData.wfa.girls;
	const lmsRecord = getClosestLMSRecord(ageInDays, records);
	if (!lmsRecord) {
		return null;
	}

	const L = Number.parseFloat(lmsRecord.L);
	const M = Number.parseFloat(lmsRecord.M);
	const S = Number.parseFloat(lmsRecord.S);

	return calculateZScoreFromLMS(weight, L, M, S);
}

/**
 * Calculate Height-for-Age Z-Score
 * Valid for ages 60-228 months (5-19 years)
 * Per El Shafie et al. (2020)
 */

export function calculateHeightForAgeZScore(
	height: number,
	ageInMonths: number,
	gender: "boy" | "girl"
): number | null {
	// Validate range: WHO 5-19 years is 60 to 228 months
	if (ageInMonths < 60 || ageInMonths > 228) {
		return null;
	}
	const params = getLMSParams(ageInMonths, gender, "height");
	if (!params) {
		return null;
	}

	const z = calculateZScore(height, params);
	return Number(z.toFixed(2));
}

/**
 * Calculate BMI from weight and height
 * BMI = weight (kg) / (height (m))^2
 */
export function calculateBMI(weight: number, height: number): number {
	if (height === 0) {
		return 0;
	}
	const heightInMeters = height / 100;
	const bmi = weight / (heightInMeters * heightInMeters);
	return Math.round(bmi * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate BMI-for-Age Z-Score
 * TODO: Implement when WHO BMI-for-Age reference data is available
 */ // You need to import your LMS reference data here
// import { WHO_LMS_DATA } from './who-lms-data';

export function calculateBMIForAgeZScore(bmi: number, ageInMonths: number, gender: "boy" | "girl"): number | null {
	const params = getLMSParams(ageInMonths, gender, "bmi");
	if (!params) {
		return null;
	}

	const z = calculateZScore(bmi, params);
	return Number(z.toFixed(2));
}

// Backwards-compatible wrapper to fetch LMS parameters from generated WHO references
export function getLMSParameters(ageInMonths: number, gender: "boy" | "girl") {
	// Prefer WHO generated params for height/BMI; weight WFA uses external data
	// Try BMI/height range first (60-228 months)
	const heightParams = getLMSParams(ageInMonths, gender, "height");
	if (heightParams) {
		return { L: heightParams.l, M: heightParams.m, S: heightParams.s };
	}

	// Fallback to weight-for-age records (external JSON) if within 60-120 months
	if (ageInMonths >= 60 && ageInMonths <= 120) {
		const data = gender === "boy" ? zscoreData.wfa.boys : zscoreData.wfa.girls;
		const entry = data[Math.round(ageInMonths)];
		if (!entry) {
			return null;
		}
		return {
			L: Number.parseFloat(entry.L),
			M: Number.parseFloat(entry.M),
			S: Number.parseFloat(entry.S)
		};
	}

	return null;
}
/**
 * Get Z-score category description
 */
export function getZScoreCategory(zscore: number | null): string {
	if (zscore === null) {
		return "Invalid";
	}
	if (zscore < -3) {
		return "< -3 SD";
	}
	if (zscore < -2) {
		return "-3 to -2 SD";
	}
	if (zscore < -1) {
		return "-2 to -1 SD";
	}
	if (zscore < 0) {
		return "-1 to 0 SD";
	}
	if (zscore < 1) {
		return "0 to +1 SD";
	}
	if (zscore < 2) {
		return "+1 to +2 SD";
	}
	if (zscore < 3) {
		return "+2 to +3 SD";
	}
	return "> +3 SD";
}

/**
 * Get nutritional status based on Z-scores
 * WHO Classification
 */
export function getNutritionalStatus(
	weightZScore: number | null,
	heightZScore: number | null,
	bmiZScore: number | null
): string {
	// Based on height-for-age (stunting)
	if (heightZScore !== null && heightZScore < -2) {
		return "STUNTED";
	}

	// Based on weight-for-age (underweight) - only valid for ages < 10 years
	if (weightZScore !== null && weightZScore < -2) {
		return "UNDERWEIGHT";
	}

	// Based on BMI-for-age or weight-for-height (wasting)
	if (bmiZScore !== null && bmiZScore < -2) {
		return "WASTED";
	}

	// Overweight/Obese based on BMI
	if (bmiZScore !== null && bmiZScore > 1) {
		return "OVERWEIGHT";
	}

	if (bmiZScore !== null && bmiZScore > 2) {
		return "OBESE";
	}

	return "NORMAL";
}

/**
 * Format Z-score for display
 */
export function formatZScore(zscore: number | null): string {
	if (zscore === null) {
		return "N/A";
	}
	return zscore >= 0 ? `+${zscore}` : `${zscore}`;
}

/**
 * Generate reference percentile values for a given age
 * Used for charting Z-score reference bands
 */
export function getReferencePercentiles(
	ageInMonths: number,
	gender: "male" | "female"
): {
	metric: string;
	sd3neg: number;
	sd2neg: number;
	sd1neg: number;
	sd0: number;
	sd1: number;
	sd2: number;
	sd3: number;
} | null {
	if (ageInMonths < 60 || ageInMonths > 120) {
		return null; // Only WFA data available for now
	}

	const ageInDays = Math.round(ageInMonths * 30.44);
	const records = gender === "male" ? zscoreData.wfa.boys : zscoreData.wfa.girls;
	const lmsRecord = getClosestLMSRecord(ageInDays, records);

	if (!lmsRecord) {
		return null;
	}

	return {
		metric: "weight",
		sd3neg: Number.parseFloat(lmsRecord.SD3neg),
		sd2neg: Number.parseFloat(lmsRecord.SD2neg),
		sd1neg: Number.parseFloat(lmsRecord.SD1neg),
		sd0: Number.parseFloat(lmsRecord.SD0),
		sd1: Number.parseFloat(lmsRecord.SD1),
		sd2: Number.parseFloat(lmsRecord.SD2),
		sd3: Number.parseFloat(lmsRecord.SD3)
	};
}
