import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { v4 as uuid } from "uuid";

export type Priority = "low" | "medium" | "high";

export type Task = {
	id: string;
	title: string;
	priority: Priority;
	description?: string;
	assignee?: string;
	dueDate?: string;
};

export type KanbanState = {
	columns: Record<string, Task[]>;
};

export type KanbanActions = {
	setColumns: (columns: Record<string, Task[]>) => void;
	addTask: (title: string, description?: string) => void;
	moveTask: (taskId: string, sourceColumn: string, destinationColumn: string, newIndex?: number) => void;
	updateTask: (taskId: string, updates: Partial<Task>) => void;
	deleteTask: (taskId: string, column: string) => void;
	reorderTasks: (column: string, startIndex: number, endIndex: number) => void;
};

const initialColumns: Record<string, Task[]> = {
	backlog: [
		{
			id: "1",
			title: "Complete patient intake form redesign",
			priority: "high",
			assignee: "Dr. Sarah Chen",
			dueDate: "2026-04-08"
		},
		{
			id: "2",
			title: "Integrate growth chart API",
			priority: "medium",
			assignee: "Marcus Rivera",
			dueDate: "2026-04-12"
		},
		{
			id: "3",
			title: "Update vaccination schedule data",
			priority: "low",
			assignee: "Priya Sharma",
			dueDate: "2026-04-15"
		},
		{
			id: "9",
			title: "Audit patient data access logs",
			priority: "medium",
			assignee: "Jordan Kim",
			dueDate: "2026-04-10"
		}
	],
	inProgress: [
		{
			id: "4",
			title: "Implement growth chart visualization",
			priority: "high",
			assignee: "Dr. Alex Turner",
			dueDate: "2026-04-03"
		},
		{
			id: "5",
			title: "Build telehealth appointment flow",
			priority: "medium",
			assignee: "Emily Nakamura",
			dueDate: "2026-04-06"
		},
		{
			id: "10",
			title: "Fix timezone handling in appointment scheduler",
			priority: "high",
			assignee: "Dr. Sarah Chen",
			dueDate: "2026-04-04"
		}
	],
	review: [
		{
			id: "11",
			title: "Patient portal login improvements",
			priority: "medium",
			assignee: "Marcus Rivera",
			dueDate: "2026-04-02"
		}
	],
	done: [
		{
			id: "6",
			title: "SSO integration with clinic auth",
			priority: "high",
			assignee: "Jordan Kim",
			dueDate: "2026-03-22"
		},
		{
			id: "7",
			title: "Dashboard analytics charts",
			priority: "medium",
			assignee: "Marcus Rivera",
			dueDate: "2026-03-20"
		},
		{
			id: "8",
			title: "Webhook retry mechanism for lab results",
			priority: "low",
			assignee: "Alex Turner",
			dueDate: "2026-03-18"
		}
	]
};

// Create the store
export const kanbanStore = new Store<KanbanState>({
	columns: initialColumns
});

// Create actions
export const kanbanActions: KanbanActions = {
	setColumns: columns => {
		kanbanStore.setState(() => ({ columns }));
	},

	addTask: (title, description) => {
		kanbanStore.setState(state => ({
			columns: {
				...state.columns,
				backlog: [
					{
						id: uuid(),
						title,
						description,
						priority: "medium" as Priority,
						assignee: undefined,
						dueDate: undefined
					},
					...(state.columns.backlog ?? [])
				]
			}
		}));
	},

	moveTask: (taskId, sourceColumn, destinationColumn, newIndex) => {
		kanbanStore.setState(state => {
			const sourceTasks = [...(state.columns[sourceColumn] ?? [])];
			const taskIndex = sourceTasks.findIndex(t => t.id === taskId);

			if (taskIndex === -1) return state;

			const [movedTask] = sourceTasks.splice(taskIndex, 1);

			const destTasks = [...(state.columns[destinationColumn] ?? [])];

			if (newIndex !== undefined) {
				destTasks.splice(newIndex, 0, movedTask);
			} else {
				destTasks.push(movedTask);
			}

			return {
				columns: {
					...state.columns,
					[sourceColumn]: sourceTasks,
					[destinationColumn]: destTasks
				}
			};
		});
	},

	updateTask: (taskId, updates) => {
		kanbanStore.setState(state => {
			const newColumns = { ...state.columns };

			for (const [column, tasks] of Object.entries(newColumns)) {
				const taskIndex = tasks.findIndex(t => t.id === taskId);
				if (taskIndex !== -1) {
					newColumns[column] = tasks.map((t, i) => (i === taskIndex ? { ...t, ...updates } : t));
					break;
				}
			}

			return { columns: newColumns };
		});
	},

	deleteTask: (taskId, column) => {
		kanbanStore.setState(state => ({
			columns: {
				...state.columns,
				[column]: (state.columns[column] ?? []).filter(t => t.id !== taskId)
			}
		}));
	},

	reorderTasks: (column, startIndex, endIndex) => {
		kanbanStore.setState(state => {
			const tasks = [...(state.columns[column] ?? [])];
			const [removed] = tasks.splice(startIndex, 1);
			tasks.splice(endIndex, 0, removed);

			return {
				columns: {
					...state.columns,
					[column]: tasks
				}
			};
		});
	}
};

// Hook for using the store in components
export function useKanbanStore<T>(selector: (state: KanbanState) => T): T {
	return useSelector(kanbanStore, selector);
}

// Convenience hook for getting all state
export function useKanbanState() {
	return useSelector(kanbanStore);
}
