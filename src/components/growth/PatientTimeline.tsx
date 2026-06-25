import { formatZScore, getZScoreCategory } from "@/lib/zscore";

export interface TimelineRecord {
	id: string;
	dateOfMeasurement: string;
	ageInMonths: number;
	weight: number;
	height: number;
	bmi: number | null;
	weightZScore: number | null;
	heightZScore: number | null;
	bmiZScore: number | null;
}

interface PatientTimelineProps {
	records: TimelineRecord[];
	isLoading?: boolean;
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}

/**
 * Format age in months to years and months
 */
function formatAge(months: number): string {
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years === 0) {
		return `${months}m`;
	}

	return remainingMonths === 0 ? `${years}y` : `${years}y ${remainingMonths}m`;
}

/**
 * Get Z-score category color
 */
function getZScoreCategoryColor(zscore: number | null): string {
	if (zscore === null) return "text-stone-500";
	if (zscore < -2) return "text-red-600";
	if (zscore < -1) return "text-orange-600";
	if (zscore < 1) return "text-green-600";
	if (zscore < 2) return "text-orange-600";
	return "text-red-600";
}

export function PatientTimeline({ records, isLoading }: PatientTimelineProps) {
	if (isLoading) {
		return (
			<div className='w-full rounded-lg border border-stone-200 bg-white p-6 shadow-sm'>
				<div className='flex justify-center'>
					<div className='inline-flex items-center gap-2 text-stone-500'>
						<div className='h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700' />
						<span>Loading records...</span>
					</div>
				</div>
			</div>
		);
	}

	if (records.length === 0) {
		return (
			<div className='w-full rounded-lg border border-stone-200 bg-stone-50 p-6'>
				<p className='text-center text-stone-500'>
					No measurements recorded yet. Add a measurement to get started.
				</p>
			</div>
		);
	}

	// Sort records by date (newest first)
	const sortedRecords = [...records].sort(
		(a, b) => new Date(b.dateOfMeasurement).getTime() - new Date(a.dateOfMeasurement).getTime()
	);

	return (
		<div className='w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm'>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='border-stone-200 border-b bg-stone-50'>
						<tr>
							<th className='px-4 py-3 text-left font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								Date
							</th>
							<th className='px-4 py-3 text-left font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								Age
							</th>
							<th className='px-4 py-3 text-right font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								Weight (kg)
							</th>
							<th className='px-4 py-3 text-right font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								Height (cm)
							</th>
							<th className='px-4 py-3 text-right font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								BMI
							</th>
							<th className='px-4 py-3 text-center font-semibold text-stone-900 text-xs uppercase tracking-wide'>
								Z-Scores
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedRecords.map(record => (
							<tr
								className='border-stone-200 border-b transition-colors hover:bg-stone-50'
								key={record.id}
							>
								<td className='px-4 py-3 text-sm text-stone-700'>
									{formatDate(record.dateOfMeasurement)}
								</td>
								<td className='px-4 py-3 text-sm text-stone-700'>{formatAge(record.ageInMonths)}</td>
								<td className='px-4 py-3 text-right text-sm text-stone-700'>
									{record.weight.toFixed(2)}
								</td>
								<td className='px-4 py-3 text-right text-sm text-stone-700'>
									{record.height.toFixed(1)}
								</td>
								<td className='px-4 py-3 text-right text-sm text-stone-700'>
									{record.bmi !== null ? record.bmi.toFixed(2) : "N/A"}
								</td>
								<td className='px-4 py-3 text-sm'>
									<div className='flex flex-col items-start gap-1'>
										{record.weightZScore !== null && (
											<div className={`text-xs ${getZScoreCategoryColor(record.weightZScore)}`}>
												<span className='font-medium'>W:</span>{" "}
												{formatZScore(record.weightZScore)}{" "}
												<span className='text-stone-500'>
													({getZScoreCategory(record.weightZScore)})
												</span>
											</div>
										)}
										{record.heightZScore !== null && (
											<div className={`text-xs ${getZScoreCategoryColor(record.heightZScore)}`}>
												<span className='font-medium'>H:</span>{" "}
												{formatZScore(record.heightZScore)}{" "}
												<span className='text-stone-500'>
													({getZScoreCategory(record.heightZScore)})
												</span>
											</div>
										)}
										{record.bmiZScore !== null && (
											<div className={`text-xs ${getZScoreCategoryColor(record.bmiZScore)}`}>
												<span className='font-medium'>BMI:</span>{" "}
												{formatZScore(record.bmiZScore)}{" "}
												<span className='text-stone-500'>
													({getZScoreCategory(record.bmiZScore)})
												</span>
											</div>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='bg-stone-50 px-4 py-3 text-stone-600 text-xs'>
				<p>
					<strong>Note:</strong> Weight-for-Age Z-scores are only valid for ages 5-10 years (60-120 months)
					per El Shafie et al. (2020). Height-for-Age is valid for ages 5-19 years.
				</p>
			</div>
		</div>
	);
}
