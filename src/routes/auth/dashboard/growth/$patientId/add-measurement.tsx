import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";

// ============================================================
// Schema
// ============================================================

const measurementSchema = z.object({
	measurementDate: z.date({ message: "Measurement date is required" }),
	weightKg: z.number().min(0.1, "Weight must be greater than 0").optional(),
	heightCm: z.number().min(1, "Height must be greater than 0").optional(),
	headCircumferenceCm: z.number().optional(),
	chestCircumferenceCm: z.number().optional(),
	midUpperArmCircumferenceCm: z.number().optional(),
	clinicalNotes: z.string().optional(),
	recommendations: z.string().optional(),
	followUpPlan: z.string().optional()
});

type MeasurementFormValues = z.infer<typeof measurementSchema>;

// ============================================================
// Route
// ============================================================

const patientQueryOptions = (patientId: string) => ({
	queryKey: ["growth", "patient", patientId, "basic"],
	queryFn: async () => {
		// Replace with actual API call
		return {
			id: patientId,
			firstName: "Ahmed",
			lastName: "Mohamed",
			dateOfBirth: "2022-01-15",
			gender: "boy"
		};
	},
	staleTime: 1000 * 60 * 5
});

export const Route = createFileRoute("/auth/dashboard/growth/$patientId/add-measurement")({
	component: AddMeasurementPage,
	loader: async ({ params }) => {
		try {
			const queryOptions = patientQueryOptions(params.patientId);
			return queryOptions;
		} catch {
			throw notFound();
		}
	}
});

// ============================================================
// Main Component
// ============================================================

function AddMeasurementPage() {
	const router = useRouter();
	const { patientId } = Route.useParams();
	const { data: patient } = useSuspenseQuery(patientQueryOptions(patientId));

	const measurementMutation = useMutation({
		mutationFn: async (data: MeasurementFormValues) => {
			const response = await fetch("/api/growth/measurements", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
					patientId,
					measurementDate: data.measurementDate.toISOString()
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to add measurement");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Measurement added successfully!");
			router.navigate({
				to: "/auth/dashboard/growth/$patientId",
				params: { patientId }
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add measurement");
		}
	});

	const form = useAppForm({
		defaultValues: {
			measurementDate: new Date(),
			weightKg: undefined,
			heightCm: undefined,
			headCircumferenceCm: undefined,
			chestCircumferenceCm: undefined,
			midUpperArmCircumferenceCm: undefined,
			clinicalNotes: "",
			recommendations: "",
			followUpPlan: ""
		} as MeasurementFormValues,
		validators: {
			onSubmit: measurementSchema
		},
		onSubmit: ({ value }) => {
			measurementMutation.mutate(value);
		}
	});

	const { FormTextField, FormTextareaField, FormDateField } = useFormFields<MeasurementFormValues>();

	const isSubmitting = measurementMutation.isPending;

	return (
		<div className='mx-auto max-w-2xl space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link
					params={{ patientId }}
					to='/auth/dashboard/growth/$patientId'
				>
					<Button
						size='icon'
						variant='ghost'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='font-bold text-2xl text-sea-ink'>Add Measurement</h1>
					<p className='text-sea-ink-soft text-sm'>
						{patient.firstName} {patient.lastName} • {patient.gender === "boy" ? "👦" : "👧"}
					</p>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Growth Measurements</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form.Form className='space-y-6'>
							<div className='grid gap-4 md:grid-cols-2'>
								<FormDateField
									label='Measurement Date *'
									name='measurementDate'
									required
								/>

								<FormTextField
									label='Weight (kg)'
									name='weightKg'
									placeholder='e.g., 12.5'
									step='0.01'
									type='number'
								/>

								<FormTextField
									label='Height (cm)'
									name='heightCm'
									placeholder='e.g., 85.0'
									step='0.1'
									type='number'
								/>

								<FormTextField
									label='Head Circumference (cm)'
									name='headCircumferenceCm'
									placeholder='e.g., 45.0'
									step='0.1'
									type='number'
								/>

								<FormTextField
									label='Chest Circumference (cm)'
									name='chestCircumferenceCm'
									placeholder='e.g., 50.0'
									step='0.1'
									type='number'
								/>

								<FormTextField
									label='Mid Upper Arm Circumference (cm)'
									name='midUpperArmCircumferenceCm'
									placeholder='e.g., 15.0'
									step='0.1'
									type='number'
								/>
							</div>

							<FormTextareaField
								label='Clinical Notes'
								name='clinicalNotes'
								placeholder='Any clinical observations...'
								rows={3}
							/>

							<FormTextareaField
								label='Recommendations'
								name='recommendations'
								placeholder='Recommendations for the patient...'
								rows={3}
							/>

							<FormTextareaField
								label='Follow-up Plan'
								name='followUpPlan'
								placeholder='Plan for follow-up...'
								rows={3}
							/>

							<div className='flex justify-end gap-3 border-t pt-4'>
								<Link
									params={{ patientId }}
									to='/auth/dashboard/growth/$patientId'
								>
									<Button
										type='button'
										variant='outline'
									>
										Cancel
									</Button>
								</Link>
								<form.SubmitButton disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Measurement"}
								</form.SubmitButton>
							</div>
						</form.Form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}
