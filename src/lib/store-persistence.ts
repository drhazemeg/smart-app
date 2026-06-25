import { chatStore } from "@/features/chat/utils/store";
import { kanbanStore } from "@/features/kanban/utils/store";

// ============================================================
// Persistence Keys
// ============================================================

const STORAGE_KEYS = {
	CHAT: "pediatric-chat-store",
	KANBAN: "pediatric-kanban-store"
};

// ============================================================
// Chat Persistence
// ============================================================

export const chatPersistence = {
	save: () => {
		try {
			const state = chatStore.state;
			localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(state));
		} catch (error) {
			console.error("Failed to save chat state:", error);
		}
	},

	load: () => {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.CHAT);
			if (data) {
				const parsed = JSON.parse(data);
				chatStore.setState(parsed);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Failed to load chat state:", error);
			return false;
		}
	},

	clear: () => {
		try {
			localStorage.removeItem(STORAGE_KEYS.CHAT);
		} catch (error) {
			console.error("Failed to clear chat state:", error);
		}
	},

	autoSave: (debounceMs = 1000) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const unsubscribe = chatStore.subscribe(() => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				chatPersistence.save();
			}, debounceMs);
		});
		return unsubscribe;
	},

	initialize: () => {
		chatPersistence.load();
		return chatPersistence.autoSave();
	}
};

// ============================================================
// Kanban Persistence
// ============================================================

export const kanbanPersistence = {
	save: () => {
		try {
			const state = kanbanStore.state;
			localStorage.setItem(STORAGE_KEYS.KANBAN, JSON.stringify(state));
		} catch (error) {
			console.error("Failed to save kanban state:", error);
		}
	},

	load: () => {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.KANBAN);
			if (data) {
				const parsed = JSON.parse(data);
				kanbanStore.setState(parsed);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Failed to load kanban state:", error);
			return false;
		}
	},

	clear: () => {
		try {
			localStorage.removeItem(STORAGE_KEYS.KANBAN);
		} catch (error) {
			console.error("Failed to clear kanban state:", error);
		}
	},

	autoSave: (debounceMs = 1000) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const unsubscribe = kanbanStore.subscribe(() => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				kanbanPersistence.save();
			}, debounceMs);
		});
		return unsubscribe;
	},

	initialize: () => {
		kanbanPersistence.load();
		return kanbanPersistence.autoSave();
	}
};

// ============================================================
// Combined Initialization
// ============================================================

export function initializeStores() {
	const chatUnsubscribe = chatPersistence.initialize();
	const kanbanUnsubscribe = kanbanPersistence.initialize();

	return () => {
		chatUnsubscribe?.unsubscribe();
		kanbanUnsubscribe?.unsubscribe();
	};
}
