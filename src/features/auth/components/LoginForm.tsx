// src/features/auth/components/LoginForm.tsx

import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/components/ui/tanstack-form";
import { useAuth } from "../hooks/use-auth";
import { type LoginInput, loginSchema } from "../schema";

export function LoginForm() {
	const { signIn, isSigningIn } = useAuth();

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false
		} as LoginInput,
		validators: {
			onSubmit: loginSchema
		},
		onSubmit: ({ value }) => {
			signIn(value);
		}
	});

	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<CardTitle>Welcome Back</CardTitle>
				<CardDescription>Sign in to your account to continue</CardDescription>
			</CardHeader>
			<form.AppForm>
				<form.Form className='space-y-4'>
					<CardContent className='space-y-4 px-0'>
						<form.AppField name='email'>
							{field => (
								<field.FieldSet>
									<field.Field>
										<field.FieldLabel>Email</field.FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your email'
											type='email'
											value={field.state.value}
										/>
									</field.Field>
									<field.FieldError />
								</field.FieldSet>
							)}
						</form.AppField>

						<form.AppField name='password'>
							{field => (
								<field.FieldSet>
									<field.Field>
										<div className='flex items-center justify-between'>
											<field.FieldLabel>Password</field.FieldLabel>
											<Link
												className='text-primary text-sm hover:underline'
												to='/auth/forgot-password'
											>
												Forgot password?
											</Link>
										</div>
										<Input
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your password'
											type='password'
											value={field.state.value}
										/>
									</field.Field>
									<field.FieldError />
								</field.FieldSet>
							)}
						</form.AppField>

						<form.AppField name='rememberMe'>
							{field => (
								<field.FieldSet>
									<field.Field orientation='horizontal'>
										<input
											checked={Boolean(field.state.value)}
											className='h-4 w-4 rounded border-gray-300'
											id={field.name}
											onChange={e => field.handleChange(e.target.checked)}
											type='checkbox'
										/>
										<field.FieldContent>
											<field.FieldLabel className='text-sm'>Remember me</field.FieldLabel>
										</field.FieldContent>
									</field.Field>
								</field.FieldSet>
							)}
						</form.AppField>
					</CardContent>
					<CardFooter className='flex flex-col space-y-4 px-0'>
						<form.SubmitButton
							className='w-full'
							disabled={isSigningIn}
						>
							{isSigningIn ? "Signing in..." : "Sign in"}
						</form.SubmitButton>
						<p className='text-muted-foreground text-sm'>
							Don't have an account?{" "}
							<Link
								className='text-primary hover:underline'
								params={{ path: "login" }}
								to='/auth/$path'
							>
								Sign up
							</Link>
						</p>
					</CardFooter>
				</form.Form>
			</form.AppForm>
		</Card>
	);
}
