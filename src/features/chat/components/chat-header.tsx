import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Conversation } from "../utils/types";

const statusDotColor = {
	online: "bg-green-500",
	offline: "bg-red-500",
	away: "bg-amber-500"
} as const;

const departmentColors: Record<string, string> = {
	Pediatrics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	Nursing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
	Administration: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	Lab: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
};

interface ChatHeaderProps {
	conversation: Conversation;
	onClose?: () => void;
	onStartCall?: () => void;
}

export function ChatHeader({ conversation, onClose, onStartCall }: ChatHeaderProps) {
	return (
		<header className='flex flex-wrap items-center justify-between gap-3 sm:gap-4'>
			<div className='flex items-center gap-2 sm:gap-3'>
				<div className='relative'>
					<Avatar className='h-10 w-10 rounded-2xl border border-border/40 bg-card/80 text-foreground sm:h-12 sm:w-12 sm:rounded-3xl'>
						<AvatarImage
							alt={conversation.name}
							src={conversation.avatar}
						/>
						<AvatarFallback className='rounded-2xl bg-primary/20 font-semibold text-primary text-sm sm:rounded-3xl sm:text-base'>
							{conversation.initials}
						</AvatarFallback>
					</Avatar>
					<span
						className={cn(
							"absolute right-0 bottom-0 inline-flex h-3 w-3 rounded-full border-2 border-background sm:h-3.5 sm:w-3.5",
							statusDotColor[conversation.status]
						)}
						role='status'
						title={conversation.status === "online" ? "Online" : "Offline"}
					>
						<span className='sr-only'>{conversation.status === "online" ? "Online" : "Offline"}</span>
					</span>
				</div>
				<div>
					<div className='flex items-center gap-2'>
						<p className='font-semibold text-foreground text-sm sm:text-base'>{conversation.name}</p>
						{conversation.department && (
							<Badge
								className={cn(
									"font-medium text-[10px]",
									departmentColors[conversation.department] ||
										"bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
								)}
								variant='outline'
							>
								{conversation.department}
							</Badge>
						)}
					</div>
					<p className='text-muted-foreground text-xs sm:text-sm'>{conversation.title}</p>
				</div>
			</div>

			<div className='flex items-center gap-1.5 sm:gap-2'>
				<Button
					aria-label='Start audio call'
					className='size-8 rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-10'
					onClick={onStartCall}
					size='icon'
					type='button'
					variant='ghost'
				>
					<Icons.phone className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
				</Button>
				<Button
					aria-label='Start video call'
					className='size-8 rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-10'
					size='icon'
					type='button'
					variant='ghost'
				>
					{/** biome-ignore lint/a11y/useMediaCaption: <This button triggers a call> */}
					<Icons.video className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
				</Button>
				<Button
					aria-label='Open conversation menu'
					className='size-8 rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-10'
					size='icon'
					type='button'
					variant='ghost'
				>
					<Icons.ellipsis className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
				</Button>
				{onClose && (
					<Button
						aria-label='Close chat'
						className='size-8 rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-10 lg:hidden'
						onClick={onClose}
						size='icon'
						type='button'
						variant='ghost'
					>
						<Icons.close className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
					</Button>
				)}
			</div>
		</header>
	);
}
