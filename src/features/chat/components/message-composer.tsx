import { useRef } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import { Textarea } from "@/components/ui/textarea";
import type { Attachment } from "../utils/types";

interface MessageComposerProps {
	draft: string;
	onDraftChange: (text: string) => void;
	onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
	contactName: string;
	quickReplies: string[];
	attachments: Attachment[];
	onAddAttachments: (files: FileList) => void;
	onRemoveAttachment: (id: string) => void;
}

export function MessageComposer({
	draft,
	onDraftChange,
	onSubmit,
	contactName,
	quickReplies,
	attachments,
	onAddAttachments,
	onRemoveAttachment
}: MessageComposerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<form
			aria-label='Reply composer'
			className='space-y-2 sm:space-y-3'
			onSubmit={onSubmit}
		>
			<label
				className='sr-only'
				htmlFor='messenger-editor'
			>
				Write a message
			</label>
			<div className='flex items-end gap-2 rounded-2xl border border-border/40 bg-background/80 p-3 backdrop-blur sm:gap-3 sm:rounded-3xl sm:p-4'>
				<div className='min-w-0 flex-1'>
					{attachments.length > 0 && (
						<FilePreview
							className='mb-1 p-0'
							files={attachments.map(a => ({
								id: a.id,
								name: a.name,
								type: a.type
							}))}
							onRemove={onRemoveAttachment}
						/>
					)}
					<Textarea
						aria-label={`Message ${contactName}`}
						className='min-h-[3rem] w-full resize-none border-none bg-transparent text-foreground text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-0 sm:min-h-[4rem] sm:text-sm'
						id='messenger-editor'
						onChange={e => onDraftChange(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								if (draft.trim() || attachments.length > 0) {
									const form = e.currentTarget.closest("form");
									form?.requestSubmit();
								}
							}
						}}
						placeholder={`Message ${contactName} (Enter to send, Shift+Enter for newline)`}
						rows={2}
						value={draft}
					/>
					<div className='mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2'>
						{quickReplies.map(reply => (
							<button
								className='rounded-full border border-border/50 bg-background/70 px-2.5 py-0.5 text-[0.65rem] text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3 sm:py-1 sm:text-xs'
								key={reply}
								onClick={() => onDraftChange(reply)}
								type='button'
							>
								{reply}
							</button>
						))}
					</div>
				</div>
				<div className='flex shrink-0 flex-col items-end gap-1.5 sm:w-24 sm:gap-2'>
					<input
						className='hidden'
						multiple
						onChange={e => {
							if (e.target.files?.length) {
								onAddAttachments(e.target.files);
							}
							e.target.value = "";
						}}
						ref={fileInputRef}
						type='file'
					/>
					<Button
						aria-label='Attach a file'
						className='size-8 rounded-full border border-border/40 bg-background/70 text-muted-foreground transition hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-10'
						onClick={() => fileInputRef.current?.click()}
						size='icon'
						type='button'
						variant='ghost'
					>
						<Icons.paperclip className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
					</Button>
					<Button
						aria-label='Send message'
						className='size-8 rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 sm:size-10'
						disabled={!draft.trim() && attachments.length === 0}
						size='icon'
						type='submit'
					>
						<Icons.send
							aria-hidden='true'
							className='h-3.5 w-3.5 sm:h-4 sm:w-4'
						/>
					</Button>
				</div>
			</div>
		</form>
	);
}
