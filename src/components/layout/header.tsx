import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { Breadcrumbs } from "../breadcrumbs";
import SearchInput from "../search-input";
import { ThemeModeToggle } from "../themes/theme-mode-toggle";
import { ThemeSelector } from "../themes/theme-selector";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import CtaGithub from "./cta-github";

export default function Header() {
	return (
		<header className='sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 rounded-t-xl border-b bg-background/60 px-4 backdrop-blur-md'>
			<div className='flex items-center gap-2'>
				<SidebarTrigger className='-ml-1' />
				<Separator
					className='mr-2 h-4'
					orientation='vertical'
				/>
				<Breadcrumbs />
			</div>

			<div className='flex items-center gap-2'>
				<CtaGithub />
				<div className='hidden md:flex'>
					<SearchInput />
				</div>
				<ThemeModeToggle />
				<div className='hidden sm:block'>
					<ThemeSelector />
				</div>
				<NotificationCenter />
			</div>
		</header>
	);
}
