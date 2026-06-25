import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const registrationSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["male", "female"])
});

// Validator functions
const validateFirstName = (value: string) => {
	try {
		registrationSchema.shape.firstName.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message;
		}
		return "Invalid first name";
	}
};

const validateLastName = (value: string) => {
	try {
		registrationSchema.shape.lastName.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message;
		}
		return "Invalid last name";
	}
};

const validateDateOfBirth = (value: string) => {
	try {
		registrationSchema.shape.dateOfBirth.parse(value);

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

const validateGender = (value: "male" | "female") => {
	try {
		registrationSchema.shape.gender.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message;
		}
		return "Invalid gender";
	}
};

export function GrowthRegistrationForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			dateOfBirth: new Date().toISOString().split("T")[0],
			gender: "male" as "male" | "female"
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/growth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						firstName: value.firstName,
						lastName: value.lastName,
						dateOfBirth: new Date(value.dateOfBirth).toISOString(),
						gender: value.gender
					})
				});

				if (!response.ok) {
					const data = await response.json();
					setError(data.error || "Registration failed");
					return;
				}

				const data = await response.json();
				if (data.success && data.data) {
					// Redirect to patient timeline - check your router config for the correct path
					await router.navigate({
						to: "/auth/dashboard/growth/$patientId",
						params: { patientId: data.data.id }
					});
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		}
	});

	return (
		<div className='mx-auto w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm'>
			<h2 className='mb-6 font-semibold text-2xl text-stone-900'>Register Child</h2>

			<form
				className='space-y-4'
				onSubmit={e => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				{/* First Name Field */}
				<form.Field
					name='firstName'
					validators={{
						onChange: ({ value }) => validateFirstName(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='firstName'
							>
								First Name
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='firstName'
								name='firstName'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								placeholder="Enter child's first name"
								type='text'
								value={field.state.value}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Last Name Field */}
				<form.Field
					name='lastName'
					validators={{
						onChange: ({ value }) => validateLastName(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='lastName'
							>
								Last Name
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='lastName'
								name='lastName'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								placeholder="Enter child's last name"
								type='text'
								value={field.state.value}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Date of Birth Field */}
				<form.Field
					name='dateOfBirth'
					validators={{
						onChange: ({ value }) => validateDateOfBirth(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<label
								className='block font-medium text-sm text-stone-700'
								htmlFor='dob'
							>
								Date of Birth
							</label>
							<input
								className='w-full rounded-md border border-stone-300 px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-400'
								disabled={isLoading}
								id='dob'
								name='dateOfBirth'
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								type='date'
								value={field.state.value}
							/>
							{field.state.meta.errors && field.state.meta.errors.length > 0 && (
								<p className='text-red-600 text-sm'>{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Gender Field */}
				<form.Field
					name='gender'
					validators={{
						onChange: ({ value }) => validateGender(value)
					}}
				>
					{field => (
						<div className='space-y-2'>
							<div className='block font-medium text-sm text-stone-700'>Gender</div>{" "}
							<div className='flex gap-4'>
								<label className='flex cursor-pointer items-center gap-2'>
									<input
										checked={field.state.value === "male"}
										className='h-4 w-4'
										disabled={isLoading}
										name='gender'
										onChange={() => field.handleChange("male")}
										type='radio'
										value='male'
									/>
									<span className='text-sm text-stone-700'>Male</span>
								</label>
								<label className='flex cursor-pointer items-center gap-2'>
									<input
										checked={field.state.value === "female"}
										className='h-4 w-4'
										disabled={isLoading}
										name='gender'
										onChange={() => field.handleChange("female")}
										type='radio'
										value='female'
									/>
									<span className='text-sm text-stone-700'>Female</span>
								</label>
							</div>
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

				{/* Submit Button */}
				<button
					className='w-full rounded-md bg-stone-700 px-4 py-2 font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400'
					disabled={isLoading}
					type='submit'
				>
					{isLoading ? "Registering..." : "Register Child"}
				</button>
			</form>
		</div>
	);
}
