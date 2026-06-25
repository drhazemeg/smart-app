// products/services/components/service-form.tsx
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";

import { createServiceMutation, updateServiceMutation } from "../api/mutations";
import type { Service, ServiceCategory, ServiceMutationPayload } from "../api/types";
import { categoryOptions } from "../constants/service-options";
import { createServiceSchema } from "../schemas/service";

type ServiceFormValues = z.infer<typeof createServiceSchema>;

interface ServiceFormProps {
	initialData: Service | null;
	pageTitle: string;
}

export default function ServiceForm({ initialData, pageTitle }: ServiceFormProps) {
	const router = useRouter();
	const isEdit = !!initialData;

	const createMutation = useMutation({
		...createServiceMutation,
		onSuccess: () => {
			toast.success("Service created successfully");
			router.navigate({ to: "/auth/dashboard/services" });
		},
		onError: () => {
			toast.error("Failed to create service");
		}
	});

	const updateMutation = useMutation({
		...updateServiceMutation,
		onSuccess: () => {
			toast.success("Service updated successfully");
			router.navigate({ to: "/auth/dashboard/services" });
		},
		onError: () => {
			toast.error("Failed to update service");
		}
	});

	const form = useAppForm({
		defaultValues: {
			serviceName: initialData?.serviceName ?? "",
			description: initialData?.description ?? "",
			price: initialData?.price ?? 0,
			category: initialData?.category ?? "CONSULTATION",
			duration: initialData?.duration ?? 30,
			isAvailable: initialData?.isAvailable ?? true,
			icon: initialData?.icon ?? "",
			color: initialData?.color ?? "#3b82f6"
		} as ServiceFormValues,
		validators: {
			onSubmit: createServiceSchema
		},
		onSubmit: ({ value }) => {
			const payload: ServiceMutationPayload = {
				serviceName: value.serviceName,
				description: value.description,
				price: value.price,
				category: value.category as ServiceCategory,
				duration: value.duration || 30,
				isAvailable: value.isAvailable,
				icon: value.icon || null,
				color: value.color || null
			};

			if (isEdit && initialData.id) {
				updateMutation.mutate({ id: initialData.id, values: payload });
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormTextField, FormSelectField, FormTextareaField, FormSwitchField } = useFormFields<ServiceFormValues>();

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Card className='mx-auto w-full max-w-2xl'>
			<CardHeader>
				<CardTitle className='text-left font-bold text-2xl'>{pageTitle}</CardTitle>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className='space-y-6'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<FormTextField
								label='Service Name'
								name='serviceName'
								placeholder='Enter service name'
								required
								validators={{
									onBlur: z.string().min(2, "Service name must be at least 2 characters")
								}}
							/>

							<FormSelectField
								label='Category'
								name='category'
								options={categoryOptions}
								placeholder='Select category'
								required
								validators={{
									onBlur: z.string().min(1, "Please select a category")
								}}
							/>

							<FormTextField
								label='Price ($)'
								min={0}
								name='price'
								placeholder='0.00'
								required
								step={0.01}
								type='number'
								validators={{
									onBlur: z.number().min(0, "Price must be non-negative")
								}}
							/>

							<FormTextField
								label='Duration (minutes)'
								min={5}
								name='duration'
								placeholder='30'
								step={5}
								type='number'
								validators={{
									onBlur: z.number().min(5, "Duration must be at least 5 minutes")
								}}
							/>

							<FormTextField
								label='Color'
								name='color'
								placeholder='#000000'
								type='color'
							/>

							<FormTextField
								label='Icon (emoji)'
								maxLength={2}
								name='icon'
								placeholder='🩺'
							/>
						</div>

						<FormTextareaField
							label='Description'
							name='description'
							placeholder='Describe the service'
							required
							rows={4}
							validators={{
								onBlur: z.string().min(10, "Description must be at least 10 characters")
							}}
						/>

						<FormSwitchField
							description='Enable to make this service available for booking'
							label='Available'
							name='isAvailable'
						/>

						<div className='flex justify-end gap-2'>
							<Button
								onClick={() => router.history.back()}
								type='button'
								variant='outline'
							>
								Back
							</Button>
							<form.SubmitButton disabled={isPending}>
								{isEdit ? "Update Service" : "Add Service"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
