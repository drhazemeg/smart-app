"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ActivityIcon,
	AlertCircleIcon,
	BabyIcon,
	BellIcon,
	BrainIcon,
	CalendarDaysIcon,
	CheckCircleIcon,
	ChevronRightIcon,
	ClipboardListIcon,
	ClockIcon,
	CreditCardIcon,
	FileTextIcon,
	HeartPulseIcon,
	HelpCircleIcon,
	LogOutIcon,
	PillIcon,
	ScaleIcon,
	SettingsIcon,
	ShieldIcon,
	StethoscopeIcon,
	SyringeIcon,
	ThermometerIcon,
	UserIcon,
	UsersIcon
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Types
type UserRole =
	| "pediatrician"
	| "nurse"
	| "admin"
	| "receptionist"
	| "patient"
	| "specialist"
	| "nutritionist"
	| "psychologist";

type UserStatus = "online" | "offline" | "away" | "busy" | "in_consultation";

// Action data type
type ActionData = Record<string, unknown> | Notification | undefined;

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: UserRole;
	status: UserStatus;
	department?: string;
	specialization?: string;
	lastActive?: string;
	notifications?: number;
	permissions?: string[];
	// Pediatric-specific fields
	patientCount?: number;
	upcomingAppointments?: number;
	clinicRoom?: string;
	certifications?: string[];
	yearsOfExperience?: number;
	languages?: string[];
}

interface Notification {
	id: string;
	title: string;
	description: string;
	time: string;
	read: boolean;
	type: "appointment" | "message" | "alert" | "reminder" | "vaccination" | "growth_milestone";
	patientName?: string;
	patientAge?: string;
}

// Menu item type
interface MenuItem {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	action: string;
	badge?: string;
}

// Quick action type
interface QuickAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	action: string;
	color: string;
}

type Props = {
	trigger?: ReactNode;
	defaultOpen?: boolean;
	align?: "start" | "center" | "end";
	user?: Partial<User>;
	notifications?: Notification[];
	onLogout?: () => void;
	onAction?: (action: string, data?: ActionData) => void;
	className?: string;
	showNotifications?: boolean;
	showQuickActions?: boolean;
	clinicName?: string;
};

// Default user data - Pediatrician
const DEFAULT_USER: User = {
	id: "1",
	name: "Dr. Sarah Wilson",
	email: "sarah.wilson@pediatricclinic.com",
	role: "pediatrician",
	status: "online",
	department: "Pediatrics",
	specialization: "Child Development & Adolescent Medicine",
	lastActive: "2 min ago",
	notifications: 3,
	patientCount: 247,
	upcomingAppointments: 12,
	clinicRoom: "Room 204",
	certifications: ["Board Certified Pediatrician", "Developmental-Behavioral Pediatrics"],
	yearsOfExperience: 15,
	languages: ["English", "Spanish"],
	permissions: ["view_patients", "edit_records", "schedule_appointments", "prescribe_medication"]
};

// Default notifications - Pediatric-focused
const DEFAULT_NOTIFICATIONS: Notification[] = [
	{
		id: "1",
		title: "New Patient Appointment",
		description: "Emma Johnson scheduled for 2-year checkup tomorrow",
		time: "5 min ago",
		read: false,
		type: "appointment",
		patientName: "Emma Johnson",
		patientAge: "2 years"
	},
	{
		id: "2",
		title: "Vaccination Due",
		description: "Liam Smith needs MMR vaccine booster",
		time: "1 hour ago",
		read: false,
		type: "vaccination",
		patientName: "Liam Smith",
		patientAge: "4 years"
	},
	{
		id: "3",
		title: "Growth Milestone Alert",
		description: "Mia Garcia shows significant height percentile increase",
		time: "3 hours ago",
		read: true,
		type: "growth_milestone",
		patientName: "Mia Garcia",
		patientAge: "18 months"
	},
	{
		id: "4",
		title: "Lab Results Ready",
		description: "Blood work results for Noah Davis are available",
		time: "5 hours ago",
		read: true,
		type: "alert",
		patientName: "Noah Davis",
		patientAge: "6 years"
	}
];

// Role configuration - Pediatric focus
const ROLE_CONFIG: Record<
	UserRole,
	{ label: string; icon: React.ComponentType<{ className?: string }>; color: string; description: string }
> = {
	pediatrician: {
		label: "Pediatrician",
		icon: StethoscopeIcon,
		color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
		description: "Primary care for children"
	},
	nurse: {
		label: "Nurse",
		icon: ActivityIcon,
		color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
		description: "Patient care & vaccinations"
	},
	admin: {
		label: "Administrator",
		icon: ShieldIcon,
		color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
		description: "Clinic management"
	},
	receptionist: {
		label: "Receptionist",
		icon: BellIcon,
		color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
		description: "Patient scheduling"
	},
	patient: {
		label: "Patient",
		icon: BabyIcon,
		color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
		description: "Patient portal"
	},
	specialist: {
		label: "Specialist",
		icon: HeartPulseIcon,
		color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
		description: "Pediatric specialist"
	},
	nutritionist: {
		label: "Nutritionist",
		icon: ScaleIcon,
		color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
		description: "Pediatric nutrition"
	},
	psychologist: {
		label: "Psychologist",
		icon: BrainIcon,
		color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
		description: "Child psychology"
	}
};

// Status configuration - Pediatric context
const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; description: string }> = {
	online: {
		label: "Online",
		color: "bg-emerald-500",
		description: "Available for consultations"
	},
	offline: {
		label: "Offline",
		color: "bg-gray-400",
		description: "Currently offline"
	},
	away: {
		label: "Away",
		color: "bg-amber-500",
		description: "On break or in meetings"
	},
	busy: {
		label: "In Consultation",
		color: "bg-rose-500",
		description: "Currently with a patient"
	},
	in_consultation: {
		label: "With Patient",
		color: "bg-rose-500",
		description: "Active consultation"
	}
};

// Menu items based on role - Pediatric clinic
const getMenuItems = (role: UserRole): MenuItem[] => {
	const baseItems: MenuItem[] = [
		{ icon: UserIcon, label: "My Profile", action: "profile" },
		{ icon: SettingsIcon, label: "Settings", action: "settings" }
	];

	const roleSpecificItems: Record<UserRole, MenuItem[]> = {
		pediatrician: [
			{ icon: UsersIcon, label: "My Patients", action: "patients", badge: "247" },
			{ icon: CalendarDaysIcon, label: "Appointments", action: "appointments", badge: "12" },
			{ icon: FileTextIcon, label: "Medical Records", action: "records" },
			{ icon: SyringeIcon, label: "Vaccination Schedule", action: "vaccinations" },
			{ icon: ClipboardListIcon, label: "Growth Charts", action: "growth_charts" },
			{ icon: PillIcon, label: "Prescriptions", action: "prescriptions" }
		],
		nurse: [
			{ icon: ActivityIcon, label: "Patient Care", action: "care" },
			{ icon: CalendarDaysIcon, label: "Schedule", action: "schedule" },
			{ icon: SyringeIcon, label: "Vaccination Admin", action: "vaccinations" },
			{ icon: ThermometerIcon, label: "Vitals Check", action: "vitals" }
		],
		admin: [
			{ icon: UsersIcon, label: "Staff Management", action: "staff" },
			{ icon: CreditCardIcon, label: "Billing", action: "billing" },
			{ icon: ShieldIcon, label: "System Settings", action: "system" },
			{ icon: ClipboardListIcon, label: "Reports", action: "reports" }
		],
		receptionist: [
			{ icon: CalendarDaysIcon, label: "Appointments", action: "appointments" },
			{ icon: UsersIcon, label: "Patient Registration", action: "registration" },
			{ icon: BellIcon, label: "Check-ins", action: "checkins" }
		],
		patient: [
			{ icon: FileTextIcon, label: "My Records", action: "records" },
			{ icon: CalendarDaysIcon, label: "My Appointments", action: "appointments" },
			{ icon: CreditCardIcon, label: "Billing", action: "billing" },
			{ icon: BabyIcon, label: "Growth Tracker", action: "growth" }
		],
		specialist: [
			{ icon: UsersIcon, label: "Referrals", action: "referrals" },
			{ icon: CalendarDaysIcon, label: "Consultations", action: "consultations" },
			{ icon: FileTextIcon, label: "Reports", action: "reports" }
		],
		nutritionist: [
			{ icon: ScaleIcon, label: "Nutrition Plans", action: "plans" },
			{ icon: UsersIcon, label: "Patients", action: "patients" },
			{ icon: FileTextIcon, label: "Dietary Guidelines", action: "guidelines" }
		],
		psychologist: [
			{ icon: BrainIcon, label: "Sessions", action: "sessions" },
			{ icon: UsersIcon, label: "Patients", action: "patients" },
			{ icon: FileTextIcon, label: "Assessment Reports", action: "assessments" }
		]
	};

	const items = roleSpecificItems[role] || [];
	return [...baseItems, ...items];
};

// Quick actions for pediatric clinic
const getQuickActions = (role: UserRole): QuickAction[] => {
	const commonActions: QuickAction[] = [
		{ icon: CalendarDaysIcon, label: "New Appointment", action: "new_appointment", color: "text-blue-500" },
		{ icon: UsersIcon, label: "Find Patient", action: "find_patient", color: "text-emerald-500" }
	];

	const roleActions: Partial<Record<UserRole, QuickAction[]>> = {
		pediatrician: [
			...commonActions,
			{ icon: FileTextIcon, label: "Create Record", action: "create_record", color: "text-purple-500" },
			{ icon: SyringeIcon, label: "Vaccination", action: "vaccination", color: "text-rose-500" }
		],
		nurse: [
			...commonActions,
			{ icon: ThermometerIcon, label: "Log Vitals", action: "log_vitals", color: "text-amber-500" }
		],
		receptionist: [
			{ icon: BellIcon, label: "Check In", action: "check_in", color: "text-blue-500" },
			{ icon: UsersIcon, label: "Register Patient", action: "register", color: "text-emerald-500" }
		]
	};

	return roleActions[role] || commonActions;
};

const ProfileDropdown = ({
	trigger,
	defaultOpen,
	align = "end",
	user = DEFAULT_USER,
	notifications = DEFAULT_NOTIFICATIONS,
	onLogout,
	onAction,
	className,
	showNotifications = true,
	showQuickActions = true,
	clinicName = "Sunshine Pediatric Clinic"
}: Props) => {
	const [_isOpen, setIsOpen] = useState(defaultOpen || false);

	const currentUser = { ...DEFAULT_USER, ...user };
	const roleConfig = ROLE_CONFIG[currentUser.role] || ROLE_CONFIG.pediatrician;
	const statusConfig = STATUS_CONFIG[currentUser.status] || STATUS_CONFIG.offline;
	const menuItems = getMenuItems(currentUser.role);
	const quickActions = getQuickActions(currentUser.role);
	const unreadCount = notifications.filter(n => !n.read).length;

	// Animation variants
	const dropdownVariants = {
		hidden: {
			opacity: 0,
			scale: 0.95,
			y: -10,
			transition: { duration: 0.15 }
		},
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: {
				duration: 0.2,
				ease: [0.22, 1, 0.36, 1] as const // <-- Add 'as const' here
			}
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: -10,
			transition: { duration: 0.12 }
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: i * 0.03,
				duration: 0.15,
				ease: "easeOut" as const
			}
		})
	};

	const notificationVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: (i: number) => ({
			opacity: 1,
			height: "auto",
			transition: {
				delay: i * 0.05,
				duration: 0.2,
				ease: "easeOut" as const
			}
		})
	};

	const getNotificationIcon = (type: Notification["type"]) => {
		switch (type) {
			case "appointment":
				return <CalendarDaysIcon className='size-4 text-blue-500' />;
			case "message":
				return <BellIcon className='size-4 text-purple-500' />;
			case "alert":
				return <AlertCircleIcon className='size-4 text-amber-500' />;
			case "reminder":
				return <ClockIcon className='size-4 text-emerald-500' />;
			case "vaccination":
				return <SyringeIcon className='size-4 text-rose-500' />;
			case "growth_milestone":
				return <ScaleIcon className='size-4 text-teal-500' />;
			default:
				return <BellIcon className='size-4' />;
		}
	};

	const getNotificationTypeColor = (type: Notification["type"]) => {
		switch (type) {
			case "vaccination":
				return "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20";
			case "growth_milestone":
				return "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20";
			case "appointment":
				return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
			default:
				return "border-primary/5 bg-primary/5";
		}
	};

	return (
		<DropdownMenu
			defaultOpen={defaultOpen}
			onOpenChange={setIsOpen}
		>
			<DropdownMenuTrigger asChild>
				{trigger || (
					<button
						aria-label='User menu'
						className={cn(
							"relative flex items-center gap-3 rounded-full transition-all",
							"hover:ring-2 hover:ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary",
							className
						)}
						type='button'
					>
						<Avatar className='size-10 border-2 border-primary/10'>
							<AvatarImage
								alt={currentUser.name}
								src={currentUser.avatar}
							/>
							<AvatarFallback className='bg-linear-to-br from-primary/20 to-primary/5 font-medium text-sm'>
								{currentUser.name
									.split(" ")
									.map(n => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<span
							className={cn(
								"absolute right-0 bottom-0 block size-2.5 rounded-full border-2 border-background",
								statusConfig.color
							)}
						/>
						{unreadCount > 0 && showNotifications && (
							<span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 font-medium text-[10px] text-white ring-2 ring-background'>
								{unreadCount}
							</span>
						)}
					</button>
				)}
			</DropdownMenuTrigger>

			<AnimatePresence>
				<DropdownMenuContent
					align={align}
					className='min-w-[320px] max-w-[380px] overflow-hidden p-1'
					forceMount
				>
					<motion.div
						animate='visible'
						className='space-y-0.5'
						exit='exit'
						initial='hidden'
						variants={dropdownVariants}
					>
						{/* User Info */}
						<DropdownMenuLabel className='flex items-center gap-3 px-3 py-3 font-normal'>
							<div className='relative'>
								<Avatar className='size-14 border-2 border-primary/10'>
									<AvatarImage
										alt={currentUser.name}
										src={currentUser.avatar}
									/>
									<AvatarFallback className='bg-linear-to-br from-primary/20 to-primary/5 font-medium text-lg'>
										{currentUser.name
											.split(" ")
											.map(n => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<span
									className={cn(
										"absolute right-0 bottom-0 block size-3 rounded-full border-2 border-background",
										statusConfig.color
									)}
								/>
							</div>
							<div className='flex min-w-0 flex-1 flex-col items-start'>
								<div className='flex w-full items-center justify-between gap-2'>
									<span className='truncate font-semibold text-sm'>{currentUser.name}</span>
									<Badge className={cn("shrink-0 text-[10px] capitalize", roleConfig.color)}>
										{roleConfig.label}
									</Badge>
								</div>
								<span className='truncate text-muted-foreground text-xs'>{currentUser.email}</span>
								{currentUser.department && (
									<span className='truncate text-[10px] text-muted-foreground'>
										{currentUser.department} • {currentUser.specialization}
									</span>
								)}
								<div className='mt-1 flex flex-wrap items-center gap-2'>
									<span className='flex items-center gap-1 text-[10px]'>
										<span
											className={cn("inline-block h-1.5 w-1.5 rounded-full", statusConfig.color)}
										/>
										{statusConfig.label}
									</span>
									{currentUser.clinicRoom && (
										<>
											<span className='text-[10px] text-muted-foreground/50'>•</span>
											<span className='text-[10px] text-muted-foreground'>
												{currentUser.clinicRoom}
											</span>
										</>
									)}
									{currentUser.lastActive && (
										<>
											<span className='text-[10px] text-muted-foreground/50'>•</span>
											<span className='text-[10px] text-muted-foreground'>
												Last active: {currentUser.lastActive}
											</span>
										</>
									)}
								</div>
								{/* Pediatric stats */}
								{currentUser.role === "pediatrician" && (
									<div className='mt-1 flex flex-wrap gap-2'>
										<span className='text-[10px] text-muted-foreground'>
											Patients: {currentUser.patientCount}
										</span>
										<span className='text-[10px] text-muted-foreground'>•</span>
										<span className='text-[10px] text-muted-foreground'>
											Upcoming: {currentUser.upcomingAppointments}
										</span>
										{currentUser.yearsOfExperience && (
											<>
												<span className='text-[10px] text-muted-foreground'>•</span>
												<span className='text-[10px] text-muted-foreground'>
													{currentUser.yearsOfExperience} years exp.
												</span>
											</>
										)}
									</div>
								)}
								{/* Languages */}
								{currentUser.languages && currentUser.languages.length > 0 && (
									<div className='mt-1 flex flex-wrap gap-1'>
										{currentUser.languages.map(lang => (
											<Badge
												className='px-1.5 py-0 text-[8px]'
												key={lang}
												variant='outline'
											>
												{lang}
											</Badge>
										))}
									</div>
								)}
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						{/* Clinic Name */}
						<div className='px-3 py-1'>
							<span className='font-medium text-[10px] text-muted-foreground'>{clinicName}</span>
						</div>

						{/* Quick Actions */}
						{showQuickActions && (
							<>
								<div className='px-2 py-1'>
									<span className='font-medium text-muted-foreground text-xs'>Quick Actions</span>
									<div className='mt-1 grid grid-cols-2 gap-1'>
										{quickActions.map(action => {
											const Icon = action.icon;
											return (
												<button
													className='flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-secondary'
													key={action.action}
													onClick={() => onAction?.(action.action)}
													type='button'
												>
													<Icon className={cn("size-3.5", action.color)} />
													<span>{action.label}</span>
												</button>
											);
										})}
									</div>
								</div>
								<DropdownMenuSeparator />
							</>
						)}

						{/* Notifications */}
						{showNotifications && notifications.length > 0 && (
							<>
								<div className='px-2 py-1'>
									<div className='flex items-center justify-between'>
										<span className='font-medium text-muted-foreground text-xs'>Notifications</span>
										<button
											className='text-primary text-xs hover:underline'
											onClick={() => onAction?.("view_all_notifications")}
											type='button'
										>
											View all
										</button>
									</div>
									<div className='mt-1 max-h-[140px] space-y-1 overflow-y-auto'>
										<AnimatePresence>
											{notifications.slice(0, 3).map((notification, index) => (
												<motion.div
													animate='visible'
													className={cn(
														"flex items-start gap-2 rounded-md border p-2 transition-colors",
														"cursor-pointer hover:bg-secondary/50",
														!notification.read && "bg-primary/5",
														getNotificationTypeColor(notification.type)
													)}
													custom={index}
													exit='hidden'
													initial='hidden'
													key={notification.id}
													onClick={() =>
														onAction?.(`notification_${notification.id}`, notification)
													}
													variants={notificationVariants}
												>
													<div className='mt-0.5'>
														{getNotificationIcon(notification.type)}
													</div>
													<div className='min-w-0 flex-1'>
														<p className='truncate font-medium text-xs'>
															{notification.title}
															{!notification.read && (
																<span className='ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500' />
															)}
														</p>
														<p className='truncate text-[10px] text-muted-foreground'>
															{notification.description}
														</p>
														{notification.patientName && (
															<p className='text-[10px] text-primary'>
																{notification.patientName}
																{notification.patientAge &&
																	` • ${notification.patientAge}`}
															</p>
														)}
														<p className='text-[10px] text-muted-foreground/60'>
															{notification.time}
														</p>
													</div>
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								</div>
								<DropdownMenuSeparator />
							</>
						)}

						{/* Menu Items */}
						<DropdownMenuGroup>
							{menuItems.map((item, index) => {
								const Icon = item.icon;
								return (
									<motion.div
										animate='visible'
										custom={index}
										initial='hidden'
										key={item.label}
										variants={itemVariants}
									>
										<DropdownMenuItem
											className='gap-3 px-3 py-2.5 text-sm'
											onClick={() => onAction?.(item.action)}
										>
											<Icon className='size-4 text-muted-foreground' />
											<span>{item.label}</span>
											{item.badge && (
												<Badge
													className='ml-auto text-[10px]'
													variant='secondary'
												>
													{item.badge}
												</Badge>
											)}
											<ChevronRightIcon className='ml-auto size-3.5 text-muted-foreground/50' />
										</DropdownMenuItem>
									</motion.div>
								);
							})}
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						{/* Help & Support */}
						<DropdownMenuGroup>
							<motion.div
								animate='visible'
								custom={menuItems.length}
								initial='hidden'
								variants={itemVariants}
							>
								<DropdownMenuItem
									className='gap-3 px-3 py-2 text-sm'
									onClick={() => onAction?.("help")}
								>
									<HelpCircleIcon className='size-4 text-muted-foreground' />
									<span>Help & Support</span>
								</DropdownMenuItem>
							</motion.div>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						{/* Logout */}
						<motion.div
							animate='visible'
							custom={menuItems.length + 1}
							initial='hidden'
							variants={itemVariants}
						>
							<DropdownMenuItem
								className='gap-3 px-3 py-2.5 text-sm'
								onClick={onLogout}
								variant='destructive'
							>
								<LogOutIcon className='size-4' />
								<span>Logout</span>
								<span className='ml-auto text-[10px] text-muted-foreground'>
									{currentUser.email.split("@")[0]}
								</span>
							</DropdownMenuItem>
						</motion.div>

						{/* Footer */}
						<motion.div
							animate={{ opacity: 1 }}
							className='flex items-center justify-between border-t px-3 py-1.5'
							initial={{ opacity: 0 }}
							transition={{ delay: 0.25 }}
						>
							<span className='text-[10px] text-muted-foreground/60'>
								v2.1.0 • {currentUser.role}
								{currentUser.certifications &&
									currentUser.certifications.length > 0 &&
									` • ${currentUser.certifications[0]}`}
							</span>
							<span className='flex items-center gap-1 text-[10px] text-muted-foreground/60'>
								<CheckCircleIcon className='size-3 text-emerald-500' />
								HIPAA Compliant
							</span>
						</motion.div>
					</motion.div>
				</DropdownMenuContent>
			</AnimatePresence>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
