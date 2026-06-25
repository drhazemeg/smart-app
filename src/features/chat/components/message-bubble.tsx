import { motion, useReducedMotion } from "framer-motion";
import { Icons } from "@/components/icons";
import { FilePreview } from "@/components/ui/file-preview";
import { cn } from "@/lib/utils";
import type { Message } from "../utils/types";

interface MessageBubbleProps {
	message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const shouldReduceMotion = useReducedMotion();
	const isUser = message.sender === "user";

	return (
		<motion.div
			animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
			aria-label={`${message.author} at ${message.timestamp}`}
			className='flex flex-col gap-1'
			exit={{ opacity: 0, y: 0 }}
			initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
			role='group'
			transition={{ duration: 0.28, ease: "easeOut" }}
		>
			<div
				className={cn(
					"relative max-w-[85%] rounded-xl border px-3 py-2 text-xs leading-relaxed sm:max-w-[82%] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm",
					isUser
						? "ml-auto border-primary/40 bg-primary text-primary-foreground"
						: "border-transparent bg-muted"
				)}
			>
				<p
					className={cn(
						"font-medium sm:text-sm",
						isUser ? "text-primary-foreground/80" : "text-foreground/80"
					)}
				>
					{message.author}
				</p>
				{message.text && (
					<p
						className={cn(
							"mt-1 text-[0.875rem] sm:text-[0.95rem]",
							isUser ? "text-primary-foreground/90" : "text-foreground/90"
						)}
					>
						{message.text}
					</p>
				)}
				{message.attachments && message.attachments.length > 0 && (
					<FilePreview
						className='mt-1 p-0'
						files={message.attachments.map(a => ({
							id: a.id,
							name: a.name,
							type: a.type
						}))}
						variant={isUser ? "inverted" : "default"}
					/>
				)}
				<div className='mt-2 flex items-center justify-end gap-1.5 text-[0.65rem] sm:mt-3 sm:gap-2 sm:text-[0.7rem]'>
					<span className={cn("text-muted-foreground", isUser && "text-primary-foreground/80")}>
						{message.timestamp}
					</span>
					{isUser && (
						<Icons.checks
							aria-hidden='true'
							className='h-3 w-3 text-primary-foreground/80 sm:h-3.5 sm:w-3.5'
						/>
					)}
				</div>
			</div>
		</motion.div>
	);
}
