import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Attachment, Conversation } from "../utils/types";
import { ChatHeader } from "./chat-header";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

interface ChatAreaProps {
	conversation: Conversation;
	draft: string;
	onDraftChange: (text: string) => void;
	// Change React.FormEvent to React.SyntheticEvent
	onSubmit: (e: React.SyntheticEvent) => void;
	attachments: Attachment[];
	onAddAttachments: (files: FileList) => void;
	onRemoveAttachment: (id: string) => void;
}

export function ChatArea({
	conversation,
	draft,
	onDraftChange,
	onSubmit,
	attachments,
	onAddAttachments,
	onRemoveAttachment
}: ChatAreaProps) {
	const shouldReduceMotion = useReducedMotion();
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);
	const liveRegionRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!messagesContainerRef.current) return;
		const container = messagesContainerRef.current;
		const behavior = shouldReduceMotion ? "auto" : "smooth";

		const scrollToBottom = () => {
			container.scrollTo({ top: container.scrollHeight, behavior });
		};

		if (behavior === "smooth") {
			requestAnimationFrame(scrollToBottom);
		} else {
			scrollToBottom();
		}
		// Only depend on conversation.id and messages length, not the entire messages array
	}, [shouldReduceMotion]);

	useEffect(() => {
		if (!liveRegionRef.current) return;
		const lastMessage = conversation.messages[conversation.messages.length - 1];
		if (!lastMessage) return;
		liveRegionRef.current.textContent = `${lastMessage.author} at ${lastMessage.timestamp}: ${lastMessage.text}`;
	}, [conversation.messages]);

	return (
		<>
			<AnimatePresence
				initial={false}
				mode='wait'
			>
				<motion.div
					animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
					className='flex min-h-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/40 bg-background/80 p-3 backdrop-blur sm:gap-4 sm:p-4 lg:col-start-2 lg:col-end-3 lg:rounded-3xl'
					exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
					key={conversation.id}
					transition={{ duration: 0.32, ease: "easeOut" }}
				>
					<ChatHeader conversation={conversation} />

					<div
						aria-live='off'
						className='relative min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 sm:space-y-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar]:w-2'
						ref={messagesContainerRef}
						role='log'
					>
						<AnimatePresence initial={false}>
							{conversation.messages.map(message => (
								<MessageBubble
									key={message.id}
									message={message}
								/>
							))}
						</AnimatePresence>
					</div>

					<MessageComposer
						attachments={attachments}
						contactName={conversation.name}
						draft={draft}
						onAddAttachments={onAddAttachments}
						onDraftChange={onDraftChange}
						onRemoveAttachment={onRemoveAttachment}
						onSubmit={onSubmit}
						quickReplies={conversation.quickReplies}
					/>
				</motion.div>
			</AnimatePresence>
			<div
				aria-atomic='true'
				aria-live='polite'
				className='sr-only'
				ref={liveRegionRef}
			/>
		</>
	);
}
