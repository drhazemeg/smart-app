import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Priority, Task } from "../utils/store";

interface TaskDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: Task | null;
	onUpdate: (taskId: string, updates: Partial<Task>) => void;
	onDelete: (taskId: string, column: string) => void;
	columns: Record<string, Task[]>;
}

export function TaskDetailDialog({ open, onOpenChange, task, onUpdate, onDelete, columns }: TaskDetailDialogProps) {
	const [editedTask, setEditedTask] = useState<Task | null>(null);

	// Find which column the task is in
	const findTaskColumn = (taskId: string): string | null => {
		for (const [column, tasks] of Object.entries(columns)) {
			if (tasks.some(t => t.id === taskId)) {
				return column;
			}
		}
		return null;
	};

	// Reset edited task when dialog opens with new task
	useEffect(() => {
		if (task) {
			setEditedTask({ ...task });
		}
	}, [task]);

	if (!task || !editedTask) return null;

	const taskColumn = findTaskColumn(task.id);

	const handleSave = () => {
		onUpdate(task.id, editedTask);
		onOpenChange(false);
	};

	const handleDelete = () => {
		if (taskColumn) {
			onDelete(task.id, taskColumn);
			onOpenChange(false);
		}
	};

	const priorityColors: Record<Priority, string> = {
		low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
	};

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						Task Details
						<Badge className={priorityColors[editedTask.priority]}>{editedTask.priority}</Badge>
					</DialogTitle>
					<DialogDescription>View and edit task details</DialogDescription>
				</DialogHeader>

				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='title'>Title</Label>
						<Input
							id='title'
							onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
							placeholder='Task title'
							value={editedTask.title}
						/>
					</div>

					<div className='grid gap-2'>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
							placeholder='Task description'
							rows={3}
							value={editedTask.description || ""}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='priority'>Priority</Label>
							<Select
								onValueChange={value => setEditedTask({ ...editedTask, priority: value as Priority })}
								value={editedTask.priority}
							>
								<SelectTrigger id='priority'>
									<SelectValue placeholder='Select priority' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='low'>Low</SelectItem>
									<SelectItem value='medium'>Medium</SelectItem>
									<SelectItem value='high'>High</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='assignee'>Assignee</Label>
							<Input
								id='assignee'
								onChange={e => setEditedTask({ ...editedTask, assignee: e.target.value })}
								placeholder='Assignee name'
								value={editedTask.assignee || ""}
							/>
						</div>
					</div>

					<div className='grid gap-2'>
						<Label htmlFor='dueDate'>Due Date</Label>
						<Input
							id='dueDate'
							onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })}
							type='date'
							value={editedTask.dueDate || ""}
						/>
					</div>

					{taskColumn && (
						<div className='flex items-center gap-2 text-muted-foreground text-sm'>
							<span>Column:</span>
							<Badge
								className='capitalize'
								variant='outline'
							>
								{taskColumn}
							</Badge>
						</div>
					)}
				</div>

				<DialogFooter className='flex justify-between'>
					<Button
						className='gap-2'
						onClick={handleDelete}
						size='sm'
						variant='destructive'
					>
						<Trash2 className='h-4 w-4' />
						Delete
					</Button>
					<div className='flex gap-2'>
						<Button
							onClick={() => onOpenChange(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button onClick={handleSave}>Save Changes</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
