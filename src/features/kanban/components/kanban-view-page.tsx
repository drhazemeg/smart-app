import PageContainer from "@/components/layout/page-container";
import { KanbanBoard } from "./kanban-board";
import NewTaskDialog from "./new-task-dialog";

export default function KanbanViewPage() {
	return (
		<PageContainer
			pageDescription='Manage pediatric clinic tasks with drag and drop'
			pageHeaderAction={<NewTaskDialog />}
			pageTitle='Task Board'
		>
			<KanbanBoard />
		</PageContainer>
	);
}
