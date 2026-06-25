import { useRouter } from "@tanstack/react-router";
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from "kbar";
import { useMemo } from "react";
import { navGroups } from "@/config/nav-config";
import { useFilteredNavGroups } from "@/hooks/use-nav";
import RenderResults from "./render-result";
import useThemeSwitching from "./use-theme-switching";

export default function KBar({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const filteredGroups = useFilteredNavGroups(navGroups);

	// These action are for the navigation
	const actions = useMemo(() => {
		// Define navigateTo inside the useMemo callback to avoid dependency array issues
		const navigateTo = (url: string) => {
			router.navigate({ to: url });
		};

		const allItems = filteredGroups.flatMap(group => group.items);

		return allItems.flatMap(navItem => {
			// Only include base action if the navItem has a real URL and is not just a container
			const baseAction =
				navItem.url !== "#"
					? {
							id: `${navItem.title.toLowerCase()}Action`,
							name: navItem.title,
							shortcut: navItem.shortcut,
							keywords: navItem.title.toLowerCase(),
							section: "Navigation",
							subtitle: `Go to ${navItem.title}`,
							perform: () => navigateTo(navItem.url)
						}
					: null;

			// Map child items into actions
			const childActions =
				navItem.items?.map((childItem: { title: string; shortcut?: string[]; url: string }) => ({
					id: `${childItem.title.toLowerCase()}Action`,
					name: childItem.title,
					shortcut: childItem.shortcut ?? [],
					keywords: childItem.title.toLowerCase(),
					section: navItem.title,
					subtitle: `Go to ${childItem.title}`,
					perform: () => navigateTo(childItem.url)
				})) ?? [];

			// Return only valid actions (ignoring null base actions for containers)
			return baseAction ? [baseAction, ...childActions] : childActions; // Ensure childActions is always an array
		});
	}, [router, filteredGroups]);

	return (
		<KBarProvider actions={actions}>
			<KBarComponent>{children}</KBarComponent>
		</KBarProvider>
	);
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
	useThemeSwitching();

	return (
		<>
			<KBarPortal>
				<KBarPositioner className='fixed inset-0 z-99999 bg-background/80 p-0! backdrop-blur-sm'>
					<KBarAnimator className='relative mt-64! w-full max-w-150 -translate-y-12! overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg'>
						<div className='sticky top-0 z-10 border-border border-b bg-card'>
							<KBarSearch className='w-full border-none bg-card px-6 py-4 text-lg outline-hidden focus:outline-hidden focus:ring-0 focus:ring-offset-0' />
						</div>
						<div className='max-h-100'>
							<RenderResults />
						</div>
					</KBarAnimator>
				</KBarPositioner>
			</KBarPortal>
			{children}
		</>
	);
};
