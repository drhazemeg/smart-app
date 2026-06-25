import { Store } from "@tanstack/store";
import { useSyncExternalStore } from "react";
import { initialConversations } from "./data";
import type { Attachment, Conversation, Message } from "./types";

// Re-export types
export type { Attachment, Conversation, Message };

type ReplyCursorState = Record<string, number>;

export type ChatState = {
	conversations: Conversation[];
	selectedConversationId: string;
	draft: string;
	replyCursor: ReplyCursorState;
};

export type ChatActions = {
	selectConversation: (id: string) => void;
	setDraft: (text: string) => void;
	sendMessage: (text: string, attachments?: Attachment[]) => void;
	addIncomingMessage: (conversationId: string, message: Message) => void;
	advanceReplyCursor: (conversationId: string) => void;
	getActiveConversation: () => Conversation | undefined;
	markConversationRead: (conversationId: string) => void;
	addConversation: (conversation: Conversation) => void;
	deleteConversation: (conversationId: string) => void;
};

// Create the store
export const chatStore = new Store<ChatState>({
	conversations: initialConversations,
	selectedConversationId: initialConversations[0]?.id ?? "",
	draft: "",
	replyCursor: Object.fromEntries(initialConversations.map(c => [c.id, 0]))
});

// Create actions
export const chatActions: ChatActions = {
	selectConversation: id => {
		chatStore.setState(state => ({
			...state,
			selectedConversationId: id,
			conversations: state.conversations.map(c => (c.id === id ? { ...c, unread: 0 } : c))
		}));
	},

	setDraft: text => {
		chatStore.setState(state => ({
			...state,
			draft: text
		}));
	},

	sendMessage: (text, attachments) => {
		const timestamp = new Date().toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});

		const outgoing: Message = {
			id: `outgoing-${Date.now()}`,
			sender: "user",
			author: "You",
			text: text.trim(),
			timestamp,
			attachments: attachments?.length ? attachments : undefined
		};

		chatStore.setState(state => ({
			...state,
			draft: "",
			conversations: state.conversations.map(c =>
				c.id === state.selectedConversationId ? { ...c, messages: [...c.messages, outgoing], unread: 0 } : c
			)
		}));
	},

	addIncomingMessage: (conversationId, message) => {
		chatStore.setState(state => ({
			...state,
			conversations: state.conversations.map(c => {
				if (c.id !== conversationId) return c;
				const isActive = state.selectedConversationId === conversationId;
				return {
					...c,
					messages: [...c.messages, message],
					unread: isActive ? 0 : c.unread + 1
				};
			})
		}));
	},

	advanceReplyCursor: conversationId => {
		chatStore.setState(state => ({
			...state,
			replyCursor: {
				...state.replyCursor,
				[conversationId]: (state.replyCursor[conversationId] ?? 0) + 1
			}
		}));
	},

	getActiveConversation: () => {
		const state = chatStore.state;
		return state.conversations.find(c => c.id === state.selectedConversationId);
	},

	markConversationRead: conversationId => {
		chatStore.setState(state => ({
			...state,
			conversations: state.conversations.map(c => (c.id === conversationId ? { ...c, unread: 0 } : c))
		}));
	},

	addConversation: conversation => {
		chatStore.setState(state => ({
			...state,
			conversations: [...state.conversations, conversation]
		}));
	},

	deleteConversation: conversationId => {
		chatStore.setState(state => ({
			...state,
			conversations: state.conversations.filter(c => c.id !== conversationId),
			selectedConversationId:
				state.selectedConversationId === conversationId
					? (state.conversations.find(c => c.id !== conversationId)?.id ?? "")
					: state.selectedConversationId
		}));
	}
};

// ============================================================
// HOOKS - FIXED
// ============================================================

// Hook for using the store with a selector
export function useChatStore<T>(selector: (state: ChatState) => T): T {
	return useSyncExternalStore(
		// Subscribe function - returns an unsubscribe function
		callback => {
			// chatStore.subscribe returns a Subscription object with an unsubscribe method
			const subscription = chatStore.subscribe(() => {
				callback();
			});
			// Return the unsubscribe function
			return () => {
				subscription.unsubscribe();
			};
		},
		// Get snapshot - returns the selected state
		() => selector(chatStore.state),
		// Get server snapshot - for SSR compatibility
		() => selector(chatStore.state)
	);
}

// Convenience hook for getting all state
export function useChatState(): ChatState {
	return useSyncExternalStore(
		callback => {
			const subscription = chatStore.subscribe(() => {
				callback();
			});
			return () => {
				subscription.unsubscribe();
			};
		},
		() => chatStore.state,
		() => chatStore.state
	);
}

// Hook for getting actions - stable reference, no reactivity needed
export function useChatActions(): ChatActions {
	return chatActions;
}
