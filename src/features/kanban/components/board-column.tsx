import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanColumn, KanbanColumnHandle } from "@/components/ui/kanban";
import type { Task } from "../utils/store";
import { TaskCard } from "./task-card";

const COLUMN_TITLES: Record<string, string> = {
	backlog: "Backlog",
	inProgress: "In Progress",
	review: "Review",
	done: "Done"
};

const COLUMN_COLORS: Record<string, string> = {
	backlog: "border-blue-200 dark:border-blue-800",
	inProgress: "border-amber-200 dark:border-amber-800",
	review: "border-purple-200 dark:border-purple-800",
	done: "border-emerald-200 dark:border-emerald-800"
};

interface TaskColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, "children"> {
	tasks: Task[];
	onTaskMove?: (taskId: string, fromColumn: string, toColumn: string) => void;
	onTaskClick?: (task: Task) => void;
}

export function TaskColumn({ value, tasks, onTaskMove, onTaskClick, ...props }: TaskColumnProps) {
	return (
		<KanbanColumn
			className={`w-[320px] shrink-0 ${COLUMN_COLORS[value] ?? ""}`}
			value={value}
			{...props}
		>
			<div className='flex items-center justify-between px-2 py-1.5'>
				<div className='flex items-center gap-2'>
					<span className='font-semibold text-sm'>{COLUMN_TITLES[value] ?? value}</span>
					<Badge
						className='pointer-events-none rounded-sm'
						variant='secondary'
					>
						{tasks.length}
					</Badge>
				</div>
				<KanbanColumnHandle asChild>
					<Button
						className='h-7 w-7'
						size='icon'
						variant='ghost'
					>
						<Icons.gripVertical className='h-4 w-4' />
					</Button>
				</KanbanColumnHandle>
			</div>
			<div className='flex min-h-[100px] flex-col gap-2 p-0.5'>
				{tasks.map(task => (
					<TaskCard
						asHandle
						key={task.id}
						onClick={() => onTaskClick?.(task)}
						task={task}
					/>
				))}
				{tasks.length === 0 && (
					<div className='flex items-center justify-center py-6 text-muted-foreground text-sm'>No tasks</div>
				)}
			</div>
		</KanbanColumn>
	);
}
