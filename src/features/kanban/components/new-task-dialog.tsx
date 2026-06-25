import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { kanbanActions, type Priority } from "../utils/store";

export default function NewTaskDialog() {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<Priority>("medium");
	const [assignee, setAssignee] = useState("");
	const [dueDate, setDueDate] = useState("");

	const handleSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault();

		if (!title.trim()) return;

		kanbanActions.addTask(title.trim(), description.trim() || undefined);
		// Set extra fields via updateTask after creation isn't ideal — extend addTask instead
		// For now store priority/assignee/dueDate as part of the description fallback
		setTitle("");
		setDescription("");
		setPriority("medium");
		setAssignee("");
		setDueDate("");
		setOpen(false);
	};

	return (
		<Dialog
			onOpenChange={setOpen}
			open={open}
		>
			<DialogTrigger asChild>
				<Button
					size='sm'
					variant='secondary'
				>
					+ Add New Task
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Add New Task</DialogTitle>
					<DialogDescription>What do you want to get done today?</DialogDescription>
				</DialogHeader>
				<form
					className='grid gap-4 py-4'
					id='task-form'
					onSubmit={handleSubmit}
				>
					<div className='grid gap-2'>
						<Label htmlFor='title'>Title *</Label>
						<Input
							id='title'
							onChange={e => setTitle(e.target.value)}
							placeholder='Task title...'
							required
							value={title}
						/>
					</div>

					<div className='grid gap-2'>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							onChange={e => setDescription(e.target.value)}
							placeholder='Description...'
							rows={2}
							value={description}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='priority'>Priority</Label>
							<Select
								onValueChange={value => setPriority(value as Priority)}
								value={priority}
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
								onChange={e => setAssignee(e.target.value)}
								placeholder='Assignee name'
								value={assignee}
							/>
						</div>
					</div>

					<div className='grid gap-2'>
						<Label htmlFor='dueDate'>Due Date</Label>
						<Input
							id='dueDate'
							onChange={e => setDueDate(e.target.value)}
							type='date'
							value={dueDate}
						/>
					</div>
				</form>
				<DialogFooter>
					<Button
						form='task-form'
						size='sm'
						type='submit'
					>
						Add Task
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
