import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: ({ error }: { error: Error }) => (
			<div className='flex min-h-100 flex-col items-center justify-center p-4'>
				<div className='max-w-md text-center'>
					<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100'>
						<span className='text-3xl'>⚠️</span>
					</div>
					<h2 className='mb-2 font-bold font-serif text-2xl text-rose-500'>Something went wrong</h2>
					<p className='mb-4 text-sea-ink-soft text-sm'>{error.message || "An unexpected error occurred"}</p>
				</div>
			</div>
		),
		defaultNotFoundComponent: () => <div>Not Found</div>,
		defaultPendingComponent: () => (
			<div className='flex min-h-100 items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<div className='h-8 w-8 animate-spin rounded-full border-4 border-lagoon border-t-transparent' />
					<p className='text-sea-ink-soft text-sm'>Loading...</p>
				</div>
			</div>
		)
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
