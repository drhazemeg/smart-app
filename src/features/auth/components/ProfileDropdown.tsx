// src/features/auth/components/ProfileDropdown.tsx

import { Link } from "@tanstack/react-router";
import { LogOut, Settings, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../hooks/use-auth";

export function ProfileDropdown() {
	const { user, signOut, isSigningOut } = useAuth();
	const { hasRole } = useAuth();

	if (!user) return null;

	const initials = user.name
		? user.name
				.split(" ")
				.map(n => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "U";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className='relative h-8 w-8 rounded-full'
					variant='ghost'
				>
					<Avatar className='h-8 w-8'>
						<AvatarImage
							alt={user.name || "User"}
							src={user.image || undefined}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-56'
				forceMount
			>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='font-medium text-sm leading-none'>{user.name}</p>
						<p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
						{user.role && <p className='text-muted-foreground text-xs leading-none'>Role: {user.role}</p>}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link to='/auth/dashboard/profile'>
							<User className='mr-2 h-4 w-4' />
							<span>Profile</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to='/auth/dashboard/settings'>
							<Settings className='mr-2 h-4 w-4' />
							<span>Settings</span>
						</Link>
					</DropdownMenuItem>
					{hasRole("admin") && (
						<DropdownMenuItem asChild>
							<Link to='/auth/dashboard/admin'>
								<Shield className='mr-2 h-4 w-4' />
								<span>Admin Panel</span>
							</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='text-red-600 focus:text-red-600'
					disabled={isSigningOut}
					onClick={() => signOut()}
				>
					<LogOut className='mr-2 h-4 w-4' />
					<span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
