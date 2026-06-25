import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function CtaGithub() {
	return (
		<Button
			asChild
			className='group hidden sm:flex'
			size='sm'
			variant='ghost'
		>
			<a
				className='transition-colors duration-300 hover:text-[#24292e] dark:text-foreground dark:hover:text-yellow-400'
				href='https://github.com/Kiranism/next-shadcn-dashboard-starter'
				rel='noopener noreferrer'
				target='_blank'
			>
				<Icons.github className='transition-transform duration-300 group-hover:animate-bounce' />
			</a>
		</Button>
	);
}
