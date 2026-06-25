import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

const recordSchema = z.object({
	weight: z.number().positive("Weight must be positive"),
	height: z.number().positive("Height must be positive"),
	dateOfMeasurement: z.string().min(1, "Date is required")
});

// Custom validator functions for TanStack Form
const validateWeight = (value: number) => {
	try {
		recordSchema.shape.weight.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid weight";
		}
		return "Invalid weight";
	}
};

const validateHeight = (value: number) => {
	try {
		recordSchema.shape.height.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid height";
		}
		return "Invalid height";
	}
};

const validateDate = (value: string) => {
	try {
		recordSchema.shape.dateOfMeasurement.parse(value);

		// Additional validation to ensure it's a valid date
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return "Invalid date format";
		}

		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid date";
		}
		return "Invalid date";
	}
};

interface GrowthRecordFormProps {
	patientId: string;
	onRecordAdded?: () => void;
}

export function GrowthRecordForm({ patientId, onRecordAdded }: GrowthRecordFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			weight: 0,
			height: 0,
			dateOfMeasurement: new Date().toISOString().split("T")[0]
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			setError(null);
			setSuccess(false);

			try {
				const response = await fetch("/api/growth/record", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						patientId,
						weight: value.weight,
						height: value.height,
						dateOfMeasurement: new Date(value.dateOfMeasurement).toISOString()
					})
				});

				if (!response.ok) {
					const data = await response.json();
					setError(data.error || "Failed to add record");
					return;
				}

				const data = await response.json();
				if (data.success) {
					setSuccess(true);
					form.reset();
					onRecordAdded?.();

					// Clear success message after 2 seconds
					setTimeout(() => setSuccess(false), 2000);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		}
	});

	return (
		<div className='w-full rounded-lg border border-stone-200 bg-white p-6 shadow-sm'>
			<h3 className='mb-4 font-semibold text-stone-900 text-xl'>Log Measurement</h3>

			<form
				className='space-y-4'
				onSubmit={e => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				{/* Date Field */}
				<form.Field
					name='dateOfMeasurement'
					validators={{
						onChange: ({ value }) => validateDate(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='date'
							>
								Date of Measurement
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='date'
								name='dateOfMeasurement'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								type='date'
								value={field.state.value || ""}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Weight Field */}
				<form.Field
					name='weight'
					validators={{
						onChange: ({ value }) => validateWeight(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='weight'
							>
								Weight (kg)
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='weight'
								min='0'
								name='weight'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(Number.parseFloat(e.target.value))}
								placeholder='e.g., 15.5'
								step='0.1'
								type='number'
								value={field.state.value || ""}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Height Field */}
				<form.Field
					name='height'
					validators={{
						onChange: ({ value }) => validateHeight(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='height'
							>
								Height (cm)
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='height'
								min='0'
								name='height'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(Number.parseFloat(e.target.value))}
								placeholder='e.g., 105.2'
								step='0.1'
								type='number'
								value={field.state.value || ""}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Error message */}
				{error && (
					<div className='rounded-md border border-red-200 bg-red-50 p-3'>
						<p className='text-red-600 text-sm'>{error}</p>
					</div>
				)}

				{/* Success message */}
				{success && (
					<div className='rounded-md border border-green-200 bg-green-50 p-3'>
						<p className='text-green-600 text-sm'>Record added successfully!</p>
					</div>
				)}

				{/* Submit Button */}
				<button
					className='w-full rounded-md bg-stone-700 px-4 py-2 font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400'
					disabled={isLoading}
					type='submit'
				>
					{isLoading ? "Adding..." : "Add Measurement"}
				</button>
			</form>
		</div>
	);
}
