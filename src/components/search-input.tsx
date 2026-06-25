import { useKBar } from "kbar";
import { Icons } from "@/components/icons";
import { Button } from "./ui/button";

export default function SearchInput() {
	const { query } = useKBar();
	return (
		<div className='w-full space-y-2'>
			<Button
				className='relative h-9 w-full justify-start rounded-[0.5rem] bg-background font-normal text-muted-foreground text-sm shadow-none sm:pr-12 md:w-40 lg:w-64'
				onClick={query.toggle}
				variant='outline'
			>
				<Icons.search className='mr-2 h-4 w-4' />
				Search...
				<kbd className='pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex'>
					<span className='text-xs'>⌘</span>K
				</kbd>
			</Button>
		</div>
	);
}
