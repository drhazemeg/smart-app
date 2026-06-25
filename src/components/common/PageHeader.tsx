// src/components/common/PageHeader.tsx
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	action?: React.ReactNode;
	className?: string;
	subtitle?: string;
	title: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0",
				className
			)}
		>
			<div>
				<h1 className='font-bold text-2xl tracking-tight'>{title}</h1>
				{subtitle && <p className='text-muted-foreground'>{subtitle}</p>}
			</div>
			{action && <div className='flex items-center gap-2'>{action}</div>}
		</div>
	);
}
