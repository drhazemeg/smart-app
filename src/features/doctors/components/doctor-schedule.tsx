// products/doctors/components/doctor-schedule.tsx

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { WorkingDayCreateSchema } from "#/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Toggle } from "@/components/ui/toggle";
import { saveWorkingDaysMutation } from "../api/mutations";
import { workingDaysOptions } from "../api/queries";
import type { WeekDay, WorkingDay } from "../api/types";
import { weekdayOptions } from "../constants/doctor-options";

type ScheduleFormValues = {
	day: WeekDay | "";
	startTime: string;
	endTime: string;
	isActive?: boolean;
};

interface DoctorScheduleProps {
	doctorId: string;
}

export default function DoctorSchedule({ doctorId }: DoctorScheduleProps) {
	const { data: workingDaysData } = useSuspenseQuery(workingDaysOptions(doctorId));
	const [editingDay, setEditingDay] = useState<string | null>(null);

	const saveScheduleMutation = useMutation({
		...saveWorkingDaysMutation,
		onSuccess: () => {
			toast.success("Schedule saved successfully");
			setEditingDay(null);
		},
		onError: () => {
			toast.error("Failed to save schedule");
		}
	});

	const form = useAppForm({
		defaultValues: {
			day: "" as WeekDay | "",
			startTime: "09:00",
			endTime: "17:00",
			isActive: true
		} as ScheduleFormValues,
		validators: {
			onSubmit: WorkingDayCreateSchema
		},
		onSubmit: ({ value }) => {
			const existingDays = workingDaysData || [];
			const newDays = [...existingDays];

			const existingIndex = newDays.findIndex(d => d.day === value.day);
			if (existingIndex >= 0) {
				newDays[existingIndex] = {
					...newDays[existingIndex],
					...value
				} as WorkingDay;
			} else {
				newDays.push({
					...value,
					doctorId,
					id: crypto.randomUUID(),
					isActive: value.isActive ?? true
				} as WorkingDay);
			}

			saveScheduleMutation.mutate({
				doctorId,
				workingDays: newDays
			});
		}
	});

	const { FormSelectField, FormTextField, FormSwitchField } = useFormFields<ScheduleFormValues>();

	const toggleDay = (day: string) => {
		const existingDays = workingDaysData || [];
		const newDays = existingDays.map(d => (d.day === day ? { ...d, isActive: !d.isActive } : d));

		saveScheduleMutation.mutate({
			doctorId,
			workingDays: newDays
		});
	};

	const deleteDay = (day: string) => {
		const existingDays = workingDaysData || [];
		const newDays = existingDays.filter(d => d.day !== day);

		saveScheduleMutation.mutate({
			doctorId,
			workingDays: newDays
		});
	};

	return (
		<Card className='mx-auto w-full max-w-4xl'>
			<CardHeader>
				<CardTitle className='text-left font-bold text-2xl'>Working Hours Schedule</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-6'>
					{/* Add/Edit Day Form */}
					<form.AppForm>
						<form.Form className='grid grid-cols-1 gap-4 md:grid-cols-4'>
							<FormSelectField
								label='Day'
								listeners={{
									onChange: ({ value }) => {
										const existing = workingDaysData?.find(d => d.day === value);
										if (existing) {
											form.setFieldValue("startTime", existing.startTime);
											form.setFieldValue("endTime", existing.endTime);
											form.setFieldValue("isActive", existing.isActive);
										}
									}
								}}
								name='day'
								options={weekdayOptions}
								placeholder='Select day'
								required
							/>

							<FormTextField
								label='Start Time'
								name='startTime'
								required
								type='time'
							/>

							<FormTextField
								label='End Time'
								name='endTime'
								required
								type='time'
							/>

							<div className='flex items-end gap-2'>
								<FormSwitchField
									label='Active'
									name='isActive'
								/>
								<form.SubmitButton className='ml-auto'>
									{editingDay ? "Update" : "Add"}
								</form.SubmitButton>
								{editingDay && (
									<Button
										onClick={() => setEditingDay(null)}
										type='button'
										variant='outline'
									>
										Cancel
									</Button>
								)}
							</div>
						</form.Form>
					</form.AppForm>

					{/* Existing Schedule Table */}
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Day</TableHead>
									<TableHead>Start Time</TableHead>
									<TableHead>End Time</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className='text-right'>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{workingDaysData && workingDaysData.length > 0 ? (
									workingDaysData
										.sort((a, b) => {
											const order = [
												"MONDAY",
												"TUESDAY",
												"WEDNESDAY",
												"THURSDAY",
												"FRIDAY",
												"SATURDAY",
												"SUNDAY"
											];
											return order.indexOf(a.day) - order.indexOf(b.day);
										})
										.map(day => (
											<TableRow key={day.id}>
												<TableCell>
													{weekdayOptions.find(o => o.value === day.day)?.label || day.day}
												</TableCell>
												<TableCell>{day.startTime}</TableCell>
												<TableCell>{day.endTime}</TableCell>
												<TableCell>
													<span
														className={
															day.isActive ? "text-green-600" : "text-muted-foreground"
														}
													>
														{day.isActive ? "Active" : "Inactive"}
													</span>
												</TableCell>
												<TableCell className='text-right'>
													<div className='flex justify-end gap-2'>
														<Toggle
															onPressedChange={() => toggleDay(day.day)}
															pressed={day.isActive}
															size='sm'
														>
															{day.isActive ? "On" : "Off"}
														</Toggle>
														<Button
															onClick={() => {
																setEditingDay(day.day);
																form.setFieldValue("day", day.day);
																form.setFieldValue("startTime", day.startTime);
																form.setFieldValue("endTime", day.endTime);
																form.setFieldValue("isActive", day.isActive);
															}}
															size='sm'
															variant='ghost'
														>
															Edit
														</Button>
														<Button
															className='text-destructive'
															onClick={() => deleteDay(day.day)}
															size='sm'
															variant='ghost'
														>
															Remove
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
								) : (
									<TableRow>
										<TableCell
											className='text-center text-muted-foreground'
											colSpan={5}
										>
											No working days configured. Add a day above.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
