import { useCallback, useRef, useState } from "react";
import { Kanban, KanbanBoard as KanbanBoardPrimitive, KanbanOverlay } from "@/components/ui/kanban";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { createRestrictToContainer } from "../utils/restrict-to-container";
import { kanbanActions, type Task, useKanbanStore } from "../utils/store";
import { TaskColumn } from "./board-column";
import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";

export function KanbanBoard() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);

	const columns = useKanbanStore(state => state.columns);

	// eslint-disable-next-line react-hooks/exhaustive-deps -- factory function, stable after mount
	const restrictToBoard = useCallback(
		createRestrictToContainer(() => containerRef.current),
		[]
	);

	const handleTaskClick = (task: Task) => {
		setSelectedTask(task);
		setDetailDialogOpen(true);
	};

	const handleTaskMove = (taskId: string, fromColumn: string, toColumn: string) => {
		kanbanActions.moveTask(taskId, fromColumn, toColumn);
	};

	const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
		kanbanActions.updateTask(taskId, updates);
	};

	const handleTaskDelete = (taskId: string, column: string) => {
		kanbanActions.deleteTask(taskId, column);
	};

	return (
		<div
			className='relative'
			ref={containerRef}
		>
			<Kanban
				autoScroll={false}
				getItemValue={item => item.id}
				modifiers={[restrictToBoard]}
				onValueChange={kanbanActions.setColumns}
				value={columns}
			>
				<ScrollArea className='w-full rounded-md pb-4'>
					<KanbanBoardPrimitive className='flex items-start gap-3 p-1'>
						{Object.entries(columns).map(([columnValue, tasks]) => (
							<TaskColumn
								key={columnValue}
								onTaskClick={handleTaskClick}
								onTaskMove={handleTaskMove}
								tasks={tasks}
								value={columnValue}
							/>
						))}
					</KanbanBoardPrimitive>
					<ScrollBar orientation='horizontal' />
				</ScrollArea>

				<KanbanOverlay>
					{({ value, variant }) => {
						if (variant === "column") {
							const tasks = columns[value] ?? [];
							return (
								<TaskColumn
									onTaskClick={handleTaskClick}
									onTaskMove={handleTaskMove}
									tasks={tasks}
									value={value}
								/>
							);
						}

						const task = (Object.values(columns).flat() as Task[]).find(task => task.id === value);

						if (!task) return null;
						return (
							<TaskCard
								onClick={() => handleTaskClick(task)}
								task={task}
							/>
						);
					}}
				</KanbanOverlay>
			</Kanban>

			{/* Task Detail Dialog */}
			<TaskDetailDialog
				columns={columns}
				onDelete={handleTaskDelete}
				onOpenChange={setDetailDialogOpen}
				onUpdate={handleTaskUpdate}
				open={detailDialogOpen}
				task={selectedTask}
			/>
		</div>
	);
}
