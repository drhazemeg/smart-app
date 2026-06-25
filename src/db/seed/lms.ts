// ============================================
// FILE: src/db/seed/seed-lms.ts
// ============================================
// LMS Reference data seeding from output.md

import fs from "node:fs";
import path from "node:path";
import type { DB } from "../client";
import { type InsertLMSReference, lmsReference } from "../schema";

export async function seedLMSData(db: DB) {
	console.log("📊 Seeding LMS reference data...");

	const mdPath = path.resolve(process.cwd(), "./docs/output.md");

	if (!fs.existsSync(mdPath)) {
		console.warn(`⚠️  Source Markdown file not found at: ${mdPath}`);
		console.warn("   Skipping LMS data seed. You can generate the file from your growth data.");
		return [];
	}

	const rawContent = fs.readFileSync(mdPath, "utf-8");
	const lines = rawContent.split("\n");

	let currentGender: "boy" | "girl" = "boy";
	let currentMetric: "WEIGHT" | "HEIGHT" = "WEIGHT";
	const recordsToInsert: InsertLMSReference[] = [];

	console.log("   Parsing output.md for Egyptian growth baselines...");

	for (const line of lines) {
		const cleanLine = line.trim();
		if (!cleanLine) {
			continue;
		}

		// Detect sections
		const lowerLine = cleanLine.toLowerCase();
		if (lowerLine.includes("weight-for-age boys")) {
			currentGender = "boy";
			currentMetric = "WEIGHT";
			continue;
		}
		if (lowerLine.includes("weight-for-age girls")) {
			currentGender = "girl";
			currentMetric = "WEIGHT";
			continue;
		}
		if (lowerLine.includes("height-for-age boys")) {
			currentGender = "boy";
			currentMetric = "HEIGHT";
			continue;
		}
		if (lowerLine.includes("height-for-age girls")) {
			currentGender = "girl";
			currentMetric = "HEIGHT";
			continue;
		}

		// Match data rows: "05:01   61   18.6985 ..."
		if (/^\d{2}:\d{2}/.test(cleanLine)) {
			const tokens = cleanLine.split(/\s+/);
			if (tokens.length < 12) {
				continue;
			}

			const ageToken = tokens[0] || "00:00";
			const ageParts = ageToken.split(":");
			const years = Number.parseInt(ageParts[0] || "0", 10);
			const months = Number.parseInt(ageParts[1] || "0", 10);
			const absoluteMonths = years * 12 + months;

			// Parse values with fallbacks
			const parseFloatSafe = (value: string | undefined): number => {
				if (!value) {
					return 0;
				}
				const parsed = Number.parseFloat(value);
				return Number.isNaN(parsed) ? 0 : parsed;
			};

			const mVal = parseFloatSafe(tokens[2]);
			const sVal = parseFloatSafe(tokens[3]);
			const lVal = parseFloatSafe(tokens[4]);
			const sd3neg = parseFloatSafe(tokens[5]);
			const sd2neg = parseFloatSafe(tokens[6]);
			const sd1neg = parseFloatSafe(tokens[7]);
			const median = parseFloatSafe(tokens[8]);
			const sd1pos = parseFloatSafe(tokens[9]);
			const sd2pos = parseFloatSafe(tokens[10]);
			const sd3pos = parseFloatSafe(tokens[11]);

			if (mVal === 0 && lVal === 0 && sVal === 0) {
				continue;
			}

			recordsToInsert.push({
				gender: currentGender,
				metric: currentMetric,
				ageMonths: absoluteMonths,
				ageYM: `${years}:${months.toString().padStart(2, "0")}`,
				ageMonthsDecimal: absoluteMonths,
				l: lVal,
				m: mVal,
				s: sVal,
				sd3neg,
				sd2neg,
				sd1neg,
				median,
				sd1pos,
				sd2pos,
				sd3pos,
				referenceSource: "EGYPT_2020",
				validFromAge: absoluteMonths / 12,
				validToAge: (absoluteMonths + 1) / 12,
				createdAt: new Date()
			});
		}
	}

	if (recordsToInsert.length === 0) {
		console.warn("   ⚠️  No data rows matched. Check file format.");
		return [];
	}

	// Deduplicate
	const uniqueRecords = new Map<string, (typeof recordsToInsert)[0]>();
	for (const record of recordsToInsert) {
		const key = `${record.gender}-${record.metric}-${record.ageMonths}`;
		if (!uniqueRecords.has(key)) {
			uniqueRecords.set(key, record);
		}
	}
	const deduplicatedRecords = Array.from(uniqueRecords.values());

	console.log(`   ✅ Parsed ${recordsToInsert.length} records (${deduplicatedRecords.length} unique)`);

	// Clear existing LMS data
	await db.delete(lmsReference);

	// Insert in chunks
	const chunkSize = 200;
	for (let i = 0; i < deduplicatedRecords.length; i += chunkSize) {
		const chunk = deduplicatedRecords.slice(i, i + chunkSize);
		await db.insert(lmsReference).values(chunk);
	}

	console.log(`   ✅ ${deduplicatedRecords.length} LMS references inserted`);

	return deduplicatedRecords;
}
