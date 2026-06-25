import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatActions } from "../utils/store";
import type { Conversation } from "../utils/types";

const statusDotColor = {
	online: "bg-green-500",
	offline: "bg-red-500",
	away: "bg-amber-500"
} as const;

interface ConversationListProps {
	conversations: Conversation[];
	selectedId: string;
	onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
	const [search, setSearch] = useState("");
	// Use useChatActions for actions
	const { markConversationRead } = useChatActions();

	const filtered = useMemo(() => {
		if (!search.trim()) return conversations;
		const q = search.toLowerCase();
		return conversations.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
	}, [conversations, search]);

	const handleSelect = (id: string) => {
		markConversationRead(id);
		onSelect(id);
	};

	return (
		<div className='hidden h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/40 bg-background/75 p-3 backdrop-blur lg:col-start-1 lg:col-end-2 lg:flex lg:rounded-3xl lg:p-4'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<p className='font-semibold text-foreground text-sm'>Messenger</p>
					<p className='text-muted-foreground text-xs'>
						{conversations.length} active conversation
						{conversations.length === 1 ? "" : "s"}
					</p>
				</div>
				<Badge
					className='rounded-full border border-border/50 bg-primary/15 px-3 py-1 text-[0.7rem] text-primary uppercase tracking-[0.24em] hover:bg-primary/15 hover:text-primary'
					variant='outline'
				>
					Live
				</Badge>
			</div>

			<label
				className='sr-only'
				htmlFor='messenger-search'
			>
				Search conversations
			</label>
			<div className='relative'>
				<Icons.search
					aria-hidden='true'
					className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70'
				/>
				<Input
					className='w-full rounded-2xl border-border/40 bg-background/60 pl-10 text-foreground text-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/40'
					id='messenger-search'
					onChange={e => setSearch(e.target.value)}
					placeholder='Search conversations'
					type='search'
					value={search}
				/>
			</div>

			<div
				aria-label='Conversation list'
				className='flex-1 space-y-2 overflow-y-auto pr-1'
				role='list'
			>
				{filtered.length === 0 ? (
					<p className='py-8 text-center text-muted-foreground text-xs'>No conversations found</p>
				) : null}
				{filtered.map(conversation => {
					const isActive = conversation.id === selectedId;
					const lastMessage = conversation.messages[conversation.messages.length - 1];
					return (
						<motion.button
							aria-current={isActive ? "true" : undefined}
							className={cn(
								"group relative flex w-full items-start gap-3 rounded-2xl border border-transparent p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
								isActive
									? "border-primary/40 bg-primary/10"
									: "bg-background/70 hover:border-border/40 hover:bg-muted/40"
							)}
							key={conversation.id}
							onClick={() => handleSelect(conversation.id)}
							role='listitem'
							type='button'
						>
							<div className='relative shrink-0'>
								<Avatar className='h-10 w-10 rounded-2xl border border-border/40 bg-background/80 text-foreground'>
									<AvatarImage
										alt={conversation.name}
										src={conversation.avatar}
									/>
									<AvatarFallback className='rounded-2xl bg-primary/15 font-medium text-primary text-sm'>
										{conversation.initials}
									</AvatarFallback>
								</Avatar>
								<span
									className={cn(
										"absolute right-0 bottom-0 inline-flex h-3 w-3 rounded-full border-2 border-background",
										statusDotColor[conversation.status]
									)}
								/>
							</div>
							<div className='min-w-0 flex-1 space-y-1'>
								<div className='flex items-start justify-between gap-2'>
									<div className='min-w-0 flex-1'>
										<p className='truncate font-semibold text-foreground text-sm'>
											{conversation.name}
										</p>
										<p className='truncate text-muted-foreground text-xs'>{conversation.title}</p>
									</div>
									{lastMessage && (
										<span className='shrink-0 text-[0.65rem] text-muted-foreground'>
											{lastMessage.timestamp}
										</span>
									)}
								</div>
								{lastMessage ? (
									<p className='line-clamp-2 text-muted-foreground text-xs'>
										{lastMessage.author}: {lastMessage.text}
									</p>
								) : (
									<p className='text-muted-foreground text-xs'>No messages yet</p>
								)}
							</div>
							{conversation.unread > 0 && (
								<span className='ml-2 inline-flex min-h-[1.5rem] min-w-[1.5rem] items-center justify-center rounded-full bg-primary font-semibold text-[0.7rem] text-primary-foreground shadow-lg'>
									{conversation.unread}
								</span>
							)}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}
