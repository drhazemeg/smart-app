// src/db/seed.ts
/** biome-ignore-all lint/performance/useTopLevelRegex: <ok> */
import fs from "node:fs";
import path from "node:path";
import { db } from "../client";
import { type InsertLMSReference, lmsReference } from "../schema";

async function seedLMSDataEngine() {
	const mdPath = path.resolve(process.cwd(), "./output.md");
	if (!fs.existsSync(mdPath)) {
		console.error(`Source Markdown layout file missing at target path: ${mdPath}`);
		return;
	}

	const rawContent = fs.readFileSync(mdPath, "utf-8");
	const lines = rawContent.split("\n");

	let currentGender: "boy" | "girl" = "boy";
	let currentMetric: "WEIGHT" | "HEIGHT" = "WEIGHT";
	const recordsToInsert: InsertLMSReference[] = [];

	console.log("Parsing output.md data stream for Egyptian pediatric baselines...");

	for (const line of lines) {
		const cleanLine = line.trim();
		if (!cleanLine) {
			continue;
		}

		// Direct section dynamic switching based on table titles inside your output.md file
		if (cleanLine.toLowerCase().includes("weight-for-age boys")) {
			currentGender = "boy";
			currentMetric = "WEIGHT";
			continue;
		}
		if (cleanLine.toLowerCase().includes("weight-for-age girls")) {
			currentGender = "girl";
			currentMetric = "WEIGHT";
			continue;
		}
		if (cleanLine.toLowerCase().includes("height-for-age boys")) {
			currentGender = "boy";
			currentMetric = "HEIGHT";
			continue;
		}
		if (cleanLine.toLowerCase().includes("height-for-age girls")) {
			currentGender = "girl";
			currentMetric = "HEIGHT";
			continue;
		}

		// Match rows starting with standard age format expression (e.g., "05:01", "17:11")
		if (/^\d{2}:\d{2}/.test(cleanLine)) {
			const tokens = cleanLine.split(/\s+/);

			// Safety guard check based on physical space columns matching data format
			if (tokens.length < 12) {
				continue;
			}

			const ageToken = tokens[0] ?? ""; // e.g. "05:01"
			const ageParts = ageToken.split(":");
			if (ageParts.length < 2) {
				continue;
			}

			const yearsStr = ageParts[0] ?? "0";
			const monthsStr = ageParts[1] ?? "0";
			const absoluteMonths = Number.parseInt(yearsStr, 10) * 12 + Number.parseInt(monthsStr, 10);

			// FIXED: Fallback to "0" guarantees parseFloat receives a string, resolving type checking errors
			const mVal = Number.parseFloat(tokens[2] ?? "0");
			const sVal = Number.parseFloat(tokens[3] ?? "0");
			const lVal = Number.parseFloat(tokens[4] ?? "0");

			const sd3neg = Number.parseFloat(tokens[5] ?? "0");
			const sd2neg = Number.parseFloat(tokens[6] ?? "0");
			const sd1neg = Number.parseFloat(tokens[7] ?? "0");
			const median = Number.parseFloat(tokens[8] ?? "0");
			const sd1pos = Number.parseFloat(tokens[9] ?? "0");
			const sd2pos = Number.parseFloat(tokens[10] ?? "0");
			const sd3pos = Number.parseFloat(tokens[11] ?? "0");

			recordsToInsert.push({
				gender: currentGender,
				metric: currentMetric,
				ageMonths: absoluteMonths,
				l: lVal,
				m: mVal,
				ageYM: `${absoluteMonths / 12}-${absoluteMonths % 12}`,
				s: sVal,
				sd3neg,
				sd2neg,
				sd1neg,
				median,
				sd1pos,
				sd2pos,
				sd3pos,
				validFromAge: absoluteMonths / 12,
				validToAge: (absoluteMonths + 1) / 12
			});
		}
	}

	if (recordsToInsert.length === 0) {
		console.error("Zero data items matched. Double check table titles and file spacing formats.");
		return;
	}

	// Deduplicate records based on unique constraint (gender, metric, ageMonths)
	const uniqueRecords = new Map<string, (typeof recordsToInsert)[0]>();
	for (const record of recordsToInsert) {
		const key = `${record.gender}-${record.metric}-${record.ageMonths}`;
		if (!uniqueRecords.has(key)) {
			uniqueRecords.set(key, record);
		}
	}
	const deduplicatedRecords = Array.from(uniqueRecords.values());

	console.log(
		`Successfully structured ${recordsToInsert.length} baseline indices (${deduplicatedRecords.length} after deduplication). Populating SQLite...`
	);

	await db.transaction(async tx => {
		// Clear out standard caches to prevent duplicate compound constraints crashes
		await tx.delete(lmsReference);

		// Chunk imports securely to bypass bulk collection limits in SQLite
		const chunkSize = 200;
		for (let i = 0; i < deduplicatedRecords.length; i += chunkSize) {
			const slice = deduplicatedRecords.slice(i, i + chunkSize);
			await tx.insert(lmsReference).values(slice);
		}
	});

	console.log("🎉 SQLite has been successfully populated with clean Egyptian growth profiles!");
}

seedLMSDataEngine().catch(console.error);
