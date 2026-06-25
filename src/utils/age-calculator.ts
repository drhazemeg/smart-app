// src/lib/age-calculator.ts
export interface AgeResult {
	days: number;
	formatted: string;
	months: number;
	years: number;
}

export interface LMSParameters {
	l: number; // Box-Cox transformation (skewness)
	m: number; // median
	s: number; // coefficient of variation
}
export interface VelocityResult {
	heightVelocityCmPerYear: number | null;
	weightVelocityGPerDay: number | null;
	weightZVelocityPerYear: number | null;
}

export interface ZScoreResult {
	percentile: number;
	percentileBand: string; // e.g., "P50", "P85", "P97"
	zScore: number;
}

export class AgeCalculator {
	/**
	 * Calculate age from date of birth
	 */
	calculate(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeResult {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		if (dob > ref) {
			throw new Error("Birth date cannot be in the future");
		}

		const { years, months, days } = this.calculateDifference(dob, ref);

		return {
			days,
			months: years * 12 + months,
			years,
			formatted: this.formatAge(years, months, days)
		};
	}

	private calculateDifference(dob: Date, ref: Date) {
		const days = Math.floor((ref.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

		let years = ref.getFullYear() - dob.getFullYear();
		let months = ref.getMonth() - dob.getMonth();

		if (months < 0 || (months === 0 && ref.getDate() < dob.getDate())) {
			years--;
			months += 12;
		}

		// Adjust remaining days logic if needed,
		// currently simplified to maintain your exact behavior
		return { years, months, days };
	}

	private formatAge(years: number, months: number, days: number): string {
		if (years === 0) {
			if (months <= 1) {
				return `${days} ${days === 1 ? "day" : "days"}`;
			}
			if (months < 24) {
				return `${months} ${months === 1 ? "month" : "months"}`;
			}
		}

		return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
	}
	calculateZScore(value: number, lms: LMSParameters): number {
		const { l, m, s } = lms;

		if (l === 0) {
			return Math.log(value / m) / s;
		}

		return ((value / m) ** l - 1) / (l * s);
	}
	zScoreToPercentile(zScore: number): number {
		// Approximation of standard normal CDF
		const t = 1 / (1 + 0.231_641_9 * Math.abs(zScore));
		const d = 0.398_942_3 * Math.exp((-zScore * zScore) / 2);
		const p = d * t * (0.319_381_5 + t * (-0.356_563_8 + t * (1.781_478 + t * (-1.821_256 + t * 1.330_274))));

		return zScore > 0 ? 1 - p : p;
	}
	getPercentileBand(percentile: number): string {
		if (percentile < 0.01) {
			return "P0";
		}
		if (percentile < 0.03) {
			return "P1";
		}
		if (percentile < 0.05) {
			return "P3";
		}
		if (percentile < 0.1) {
			return "P5";
		}
		if (percentile < 0.15) {
			return "P10";
		}
		if (percentile < 0.25) {
			return "P15";
		}
		if (percentile < 0.5) {
			return "P25";
		}
		if (percentile < 0.75) {
			return "P50";
		}
		if (percentile < 0.85) {
			return "P75";
		}
		if (percentile < 0.9) {
			return "P85";
		}
		if (percentile < 0.95) {
			return "P90";
		}
		if (percentile < 0.97) {
			return "P95";
		}
		if (percentile < 0.99) {
			return "P97";
		}
		return "P99";
	}
	calculateGrowthMetrics(value: number, lms: LMSParameters): ZScoreResult {
		const zScore = this.calculateZScore(value, lms);
		const percentile = this.zScoreToPercentile(zScore);
		const percentileBand = this.getPercentileBand(percentile);

		return { zScore, percentile, percentileBand };
	}
	valueFromZScore(zScore: number, lms: LMSParameters): number {
		const { l, m, s } = lms;

		if (l === 0) {
			return m * Math.exp(zScore * s);
		}

		return m * (1 + l * s * zScore) ** (1 / l);
	}
	calculateBMI(weightKg: number, heightCm: number): number {
		if (!(weightKg && heightCm) || heightCm === 0) {
			return 0;
		}
		const heightM = heightCm / 100;
		return weightKg / (heightM * heightM);
	}
	calculateAgeMonths(dateOfBirth: Date, measurementDate: Date = new Date()): number {
		const diffTime = measurementDate.getTime() - dateOfBirth.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return diffDays / 30.44; // Average days per month
	}
	calculateCorrectedAgeMonths(
		dateOfBirth: Date,
		gestationalAgeWeeks: number,
		measurementDate: Date = new Date()
	): number {
		const chronologicalAge = this.calculateAgeMonths(dateOfBirth, measurementDate);
		const weeksPremature = 40 - gestationalAgeWeeks; // 40 weeks is term
		if (weeksPremature <= 0) {
			return chronologicalAge;
		}

		const monthsPremature = weeksPremature / 4.33;
		return Math.max(0, chronologicalAge - monthsPremature);
	}
	getNutritionalStatusFromZScore(weightForAgeZ: number): string {
		if (weightForAgeZ < -3) {
			return "severe_acute_malnutrition";
		}
		if (weightForAgeZ < -2) {
			return "moderate_acute_malnutrition";
		}
		if (weightForAgeZ < -1) {
			return "at_risk";
		}
		if (weightForAgeZ > 2) {
			return "obese";
		}
		if (weightForAgeZ > 1) {
			return "overweight";
		}
		return "normal";
	}
	getStuntingStatusFromZScore(heightForAgeZ: number): string {
		if (heightForAgeZ < -3) {
			return "severe_stunting";
		}
		if (heightForAgeZ < -2) {
			return "moderate_stunting";
		}
		if (heightForAgeZ > 2) {
			return "tall";
		}
		return "normal";
	}
	getWastingStatusFromZScore(weightForHeightZ: number): string {
		if (weightForHeightZ < -3) {
			return "severe_wasting";
		}
		if (weightForHeightZ < -2) {
			return "moderate_wasting";
		}
		if (weightForHeightZ > 2) {
			return "overweight";
		}
		return "normal";
	}
	calculateGrowthVelocity(
		previousMeasurement: {
			weightKg: number | null;
			heightCm: number | null;
			weightForAgeZ: number | null;
			measurementDate: Date;
		},
		currentMeasurement: {
			weightKg: number | null;
			heightCm: number | null;
			weightForAgeZ: number | null;
			measurementDate: Date;
		}
	): VelocityResult {
		const daysDiff =
			(currentMeasurement.measurementDate.getTime() - previousMeasurement.measurementDate.getTime()) /
			(1000 * 60 * 60 * 24);
		const yearsDiff = daysDiff / 365.25;

		if (daysDiff <= 0) {
			return {
				weightVelocityGPerDay: null,
				heightVelocityCmPerYear: null,
				weightZVelocityPerYear: null
			};
		}

		let weightVelocityGPerDay: number | null = null;
		let heightVelocityCmPerYear: number | null = null;
		let weightZVelocityPerYear: number | null = null;

		if (previousMeasurement.weightKg && currentMeasurement.weightKg) {
			weightVelocityGPerDay = ((currentMeasurement.weightKg - previousMeasurement.weightKg) * 1000) / daysDiff;
		}

		if (previousMeasurement.heightCm && currentMeasurement.heightCm) {
			heightVelocityCmPerYear = (currentMeasurement.heightCm - previousMeasurement.heightCm) / yearsDiff;
		}

		if (previousMeasurement.weightForAgeZ !== null && currentMeasurement.weightForAgeZ !== null) {
			weightZVelocityPerYear = (currentMeasurement.weightForAgeZ - previousMeasurement.weightForAgeZ) / yearsDiff;
		}

		return {
			weightVelocityGPerDay,
			heightVelocityCmPerYear,
			weightZVelocityPerYear
		};
	}
	checkChannelCrossing(
		previousPercentile: number,
		currentPercentile: number,
		threshold = 15 // 15 percentile points threshold
	): boolean {
		return Math.abs(currentPercentile - previousPercentile) >= threshold;
	}
	getGrowthChannel(zScore: number): number {
		if (zScore < -3) {
			return 1;
		}
		if (zScore < -2) {
			return 2;
		}
		if (zScore < -1) {
			return 3;
		}
		if (zScore < 0) {
			return 4;
		}
		if (zScore < 1) {
			return 5;
		}
		if (zScore < 2) {
			return 6;
		}
		return 7;
	}

	/**
	 * Get age in months (standard for pediatric metrics)
	 */
	inMonths(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		let months = (ref.getFullYear() - dob.getFullYear()) * 12 + (ref.getMonth() - dob.getMonth());

		if (ref.getDate() < dob.getDate()) {
			months--;
		}

		return months;
	}

	/**
	 * Get age in days
	 */
	inDays(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		return Math.floor((ref.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
	}

	/**
	 * Get age in years
	 */
	inYears(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		let years = ref.getFullYear() - dob.getFullYear();

		if (ref.getMonth() < dob.getMonth() || (ref.getMonth() === dob.getMonth() && ref.getDate() < dob.getDate())) {
			years--;
		}

		return years;
	}

	/**
	 * Get age group for pediatric care
	 */
	getAgeGroup(
		dateOfBirth: Date | string,
		referenceDate: Date = new Date()
	): "infant" | "toddler" | "preschool" | "school_age" | "adolescent" {
		const ageMonths = this.inMonths(dateOfBirth, referenceDate);

		if (ageMonths < 12) {
			return "infant";
		}
		if (ageMonths < 36) {
			return "toddler";
		}
		if (ageMonths < 72) {
			return "preschool";
		}
		if (ageMonths < 216) {
			return "school_age";
		}
		return "adolescent";
	}

	/**
	 * Get age range string
	 */
	getAgeRangeString(dateOfBirth: Date | string, referenceDate: Date = new Date()): string {
		const years = this.inYears(dateOfBirth, referenceDate);
		const months = this.inMonths(dateOfBirth, referenceDate) - years * 12;

		if (years === 0) {
			if (months === 0) {
				return "0 months";
			}
			return `${months} month${months === 1 ? "" : "s"}`;
		}
		return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
	}
}

export const ageCalculator = new AgeCalculator();

// Convenience function for backward compatibility
export function calculateAge(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeResult {
	const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
	return ageCalculator.calculate(birthDate, referenceDate);
}
