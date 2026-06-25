// src/routes/__root.tsx

import { TooltipProvider } from "@/components/ui/tooltip";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

// Track SSR performance
const SSR_START = Date.now();

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Smart Clinic Starter" },
			{ name: "theme-color", content: "var(--bg-background)" }
		],
		links: [{ rel: "stylesheet", href: appCss }]
	}),
	// The component shouldn't accept children props directly
	// Use Outlet for nested routes
	shellComponent: RootDocument
});

function RootDocument({ children }: { children: React.ReactNode }) {
	// Log SSR performance in development
	useEffect(() => {
		if (import.meta.env.DEV) {
			const loadTime = Date.now() - SSR_START;
			console.log(`[Performance] SSR completed in ${loadTime}ms`);
		}
	}, []);

	return (
		<html lang='en'>
			<head>
				<HeadContent />
			</head>
			<body>
				<ErrorBoundary fallback={<GlobalErrorFallback />}>
					<Suspense fallback={<GlobalLoadingFallback />}>
						<TooltipProvider>
							{children}
							{import.meta.env.DEV && <DevTools />}
						</TooltipProvider>
					</Suspense>
				</ErrorBoundary>
				<Scripts />
			</body>
		</html>
	);
}

// Dev Tools Component (only loads in development)
function DevTools() {
	return (
		<TanStackDevtools
			config={{ position: "bottom-right" }}
			plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }, TanStackQueryDevtools]}
		/>
	);
}

// Error Fallback Component
function GlobalErrorFallback() {
	return (
		<div className='flex min-h-screen items-center justify-center p-4'>
			<div className='max-w-md rounded-lg bg-white p-6 text-center shadow-lg'>
				<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
					<span className='text-2xl'>⚠️</span>
				</div>
				<h1 className='font-semibold text-gray-900 text-xl'>Something went wrong</h1>
				<p className='mt-2 text-gray-600 text-sm'>
					We're sorry, but an unexpected error occurred. Please try refreshing the page.
				</p>
				<button
					className='mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700'
					onClick={() => {
						if (typeof window !== "undefined") {
							window.location.reload();
						}
					}}
					type='button'
				>
					Refresh Page
				</button>
			</div>
		</div>
	);
}

// Loading Fallback Component
function GlobalLoadingFallback() {
	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='text-center'>
				<div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600' />
				<p className='mt-4 text-gray-600 text-sm'>Loading...</p>
			</div>
		</div>
	);
}
