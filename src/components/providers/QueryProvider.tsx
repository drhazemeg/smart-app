// src/providers/QueryProvider.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";

interface QueryProviderProps {
	children: ReactNode;
	showDevTools?: boolean;
}

// Get the singleton query client instance
const queryClient = getQueryClient();

export function QueryProvider({ children, showDevTools = process.env.NODE_ENV === "development" }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{showDevTools && (
				<ReactQueryDevtools
					buttonPosition='bottom-right'
					initialIsOpen={false}
					position='bottom'
				/>
			)}
		</QueryClientProvider>
	);
}
