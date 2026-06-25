// src/providers/Providers.tsx
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { Link, useRouter } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { initializeStores } from "#/lib/store-persistence";
import { MetaTheme } from "@/components/meta-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/features/auth/client";
import { QueryProvider } from "./QueryProvider";

interface ProvidersProps {
	children: React.ReactNode;
	showQueryDevTools?: boolean;
}

export function Providers({ children, showQueryDevTools }: ProvidersProps) {
	const { navigate } = useRouter();
	useEffect(() => {
		const cleanup = initializeStores();
		return cleanup;
	}, []);
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			disableTransitionOnChange
			enableSystem
		>
			<QueryProvider showDevTools={showQueryDevTools}>
				<TooltipProvider>
					<AuthUIProvider
						authClient={authClient}
						Link={({ href, ...props }) => (
							<Link
								to={href}
								{...props}
							/>
						)}
						navigate={href => navigate({ href })}
						replace={href => navigate({ href, replace: true })}
					>
						{children}

						{/* Global Toast Notifications */}
						<Toaster
							className='font-sans'
							closeButton
							expand
							position='bottom-right'
							richColors
							theme='system'
							toastOptions={{
								className: "font-sans",
								duration: 4000
							}}
						/>

						<MetaTheme />
					</AuthUIProvider>
				</TooltipProvider>
			</QueryProvider>
		</ThemeProvider>
	);
}
