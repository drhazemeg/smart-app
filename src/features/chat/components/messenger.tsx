import { useReducedMotion } from "framer-motion";
import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { chatActions, chatStore } from "../utils/store";
import type { Attachment, Message } from "../utils/types";
import { ChatArea } from "./chat-area";
import { ConversationList } from "./conversation-list";
import { ConversationSelect } from "./conversation-select";

export function Messenger() {
	const state = chatStore.state;
	const { conversations, selectedConversationId, draft, replyCursor } = state;

	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const shouldReduceMotion = useReducedMotion();
	const replyTimeoutRef = useRef<number | null>(null);
	const selectedRef = useRef(selectedConversationId);

	useEffect(() => {
		selectedRef.current = selectedConversationId;
		setAttachments([]);
	}, [selectedConversationId]);

	useEffect(() => {
		return () => {
			if (replyTimeoutRef.current) {
				window.clearTimeout(replyTimeoutRef.current);
			}
		};
	}, []);

	const handleAddAttachments = useCallback((files: FileList) => {
		const newAttachments: Attachment[] = Array.from(files).map(file => ({
			id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			name: file.name,
			size: file.size,
			type: file.type
		}));
		setAttachments(prev => [...prev, ...newAttachments]);
	}, []);

	const handleRemoveAttachment = useCallback((id: string) => {
		setAttachments(prev => prev.filter(a => a.id !== id));
	}, []);

	const handleSubmit = useCallback(
		(e: SyntheticEvent) => {
			e.preventDefault();
			const active = chatActions.getActiveConversation();
			if ((!draft.trim() && attachments.length === 0) || !active) return;

			const conversationId = active.id;
			chatActions.sendMessage(draft, attachments.length > 0 ? attachments : undefined);
			setAttachments([]);

			const autoReplies = active.autoReplies;
			if (!autoReplies.length) return;

			const cursor = replyCursor[conversationId] ?? 0;
			const nextReply = autoReplies[cursor % autoReplies.length];
			const delay = shouldReduceMotion ? 0 : 900;

			replyTimeoutRef.current = window.setTimeout(() => {
				const timestamp = new Date().toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit"
				});
				const incoming: Message = {
					id: `incoming-${Date.now()}`,
					sender: "contact",
					author: active.name,
					text: nextReply,
					timestamp
				};

				chatActions.addIncomingMessage(conversationId, incoming);
				chatActions.advanceReplyCursor(conversationId);
			}, delay);
		},
		[draft, attachments, replyCursor, shouldReduceMotion]
	);

	const activeConversation = chatActions.getActiveConversation();
	if (!activeConversation) return null;

	return (
		<div className='relative grid h-[calc(100dvh-5.5rem)] w-full grid-rows-[auto,1fr] gap-3 overflow-hidden rounded-2xl border border-border/50 bg-background/70 p-3 backdrop-blur-xl sm:gap-4 sm:p-4 lg:grid-rows-[1fr] lg:gap-4 lg:rounded-3xl lg:p-5 lg:[grid-template-columns:30%_1fr]'>
			<ConversationSelect
				conversations={conversations}
				onSelect={chatActions.selectConversation}
				selectedId={selectedConversationId}
			/>
			<ConversationList
				conversations={conversations}
				onSelect={chatActions.selectConversation}
				selectedId={selectedConversationId}
			/>
			<ChatArea
				attachments={attachments}
				conversation={activeConversation}
				draft={draft}
				onAddAttachments={handleAddAttachments}
				onDraftChange={chatActions.setDraft}
				onRemoveAttachment={handleRemoveAttachment}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
