import { Badge } from "@/components/ui/badge";
import { KanbanItem } from "@/components/ui/kanban";
import { cn } from "@/lib/utils";
import type { Priority, Task } from "../utils/store";

interface TaskCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, "value"> {
	task: Task;
	onClick?: () => void;
}

const priorityColors: Record<Priority, string> = {
	low: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
	medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
	high: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
};

const priorityBadgeVariants: Record<Priority, "default" | "secondary" | "destructive"> = {
	low: "secondary",
	medium: "default",
	high: "destructive"
};

export function TaskCard({ task, onClick, className, ...props }: TaskCardProps) {
	return (
		<KanbanItem
			asChild
			className={cn("cursor-grab active:cursor-grabbing", className)}
			key={task.id}
			value={task.id}
			{...props}
		>
			<div
				className={cn(
					"rounded-md border p-3 shadow-xs transition-all hover:shadow-md",
					priorityColors[task.priority]
				)}
				onClick={onClick}
				onKeyDown={e => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick?.();
					}
				}}
				role='button'
				tabIndex={0}
			>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between gap-2'>
						<span className='line-clamp-1 font-medium text-sm'>{task.title}</span>
						<Badge
							className='pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize'
							variant={priorityBadgeVariants[task.priority]}
						>
							{task.priority}
						</Badge>
					</div>
					<div className='flex items-center justify-between text-muted-foreground text-xs'>
						{task.assignee && (
							<div className='flex items-center gap-1'>
								<div className='size-2 rounded-full bg-primary/40' />
								<span className='line-clamp-1'>{task.assignee}</span>
							</div>
						)}
						{task.dueDate && (
							<time className='text-[10px] tabular-nums'>
								{new Date(task.dueDate).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric"
								})}
							</time>
						)}
					</div>
				</div>
			</div>
		</KanbanItem>
	);
}
