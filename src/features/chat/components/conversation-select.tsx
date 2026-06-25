import { Badge } from "@/components/ui/badge";
import type { Conversation } from "../utils/types";

interface ConversationSelectProps {
	conversations: Conversation[];
	selectedId: string;
	onSelect: (id: string) => void;
}

export function ConversationSelect({ conversations, selectedId, onSelect }: ConversationSelectProps) {
	return (
		<div className='flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/75 p-3 backdrop-blur sm:gap-4 sm:rounded-3xl sm:p-4 lg:hidden'>
			<div className='flex items-center justify-between gap-2 sm:gap-3'>
				<div>
					<p className='font-semibold text-foreground text-xs sm:text-sm'>Messenger</p>
					<p className='text-[0.65rem] text-muted-foreground sm:text-xs'>
						{conversations.length} active conversation
						{conversations.length === 1 ? "" : "s"}
					</p>
				</div>
				<Badge
					className='rounded-full border border-border/50 bg-primary/15 px-2 py-0.5 text-[0.65rem] text-primary uppercase tracking-[0.2em] hover:bg-primary/15 hover:text-primary sm:px-3 sm:py-1 sm:text-[0.7rem] sm:tracking-[0.24em]'
					variant='outline'
				>
					Live
				</Badge>
			</div>
			<div className='space-y-1.5 sm:space-y-2'>
				<label
					className='font-medium text-[0.65rem] text-muted-foreground sm:text-xs'
					htmlFor='messenger-conversation'
				>
					Conversation
				</label>
				<select
					className='w-full rounded-xl border border-border/40 bg-background/70 px-2.5 py-1.5 text-foreground text-xs focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm'
					id='messenger-conversation'
					onChange={e => onSelect(e.target.value)}
					value={selectedId}
				>
					{conversations.map(conversation => (
						<option
							key={conversation.id}
							value={conversation.id}
						>
							{conversation.name} - {conversation.title}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
