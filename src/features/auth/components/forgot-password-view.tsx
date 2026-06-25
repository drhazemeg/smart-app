// src/features/auth/components/forgot-password-view.tsx

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/client";

export default function ForgotPasswordViewPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const { data, error } = await authClient.requestPasswordReset({
				email,
				redirectTo: `${window.location.origin}/auth/reset-password`
			});

			if (error) {
				toast.error(error.message || "Failed to send reset email");
				return;
			}

			if (data) setIsSubmitted(true);
			toast.success("Password reset email sent! Check your inbox.");
		} catch (error) {
			console.error("Forgot password error:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Reset password</CardTitle>
				<CardDescription>
					Enter your email address and we'll send you a link to reset your password
				</CardDescription>
			</CardHeader>

			{!isSubmitted ? (
				<form onSubmit={handleSubmit}>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								onChange={e => setEmail(e.target.value)}
								placeholder='parent@example.com'
								required
								type='email'
								value={email}
							/>
						</div>
					</CardContent>

					<CardFooter className='flex flex-col gap-4'>
						<Button
							className='w-full'
							disabled={isLoading}
							type='submit'
						>
							{isLoading ? "Sending..." : "Send reset link"}
						</Button>

						<button
							className='text-center text-sm text-teal-600 hover:underline'
							onClick={() => navigate({ to: "/auth/$path", params: { path: "sign-in" } })}
							type='button'
						>
							Back to sign in
						</button>
					</CardFooter>
				</form>
			) : (
				<CardContent className='space-y-4 text-center'>
					<div className='rounded-full bg-green-100 p-3 text-green-600'>
						<svg
							className='mx-auto h-6 w-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<title>Email Sent</title>
							<path
								d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
							/>
						</svg>
					</div>
					<h3 className='font-semibold text-lg'>Check your email</h3>
					<p className='text-gray-600 text-sm'>
						We've sent a password reset link to {email}. Please check your inbox.
					</p>
					<Button
						className='mt-4'
						onClick={() => navigate({ to: "/auth/$path", params: { path: "sign-in" } })}
						variant='outline'
					>
						Return to sign in
					</Button>
				</CardContent>
			)}
		</Card>
	);
}
