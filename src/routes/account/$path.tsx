// src/routes/account/$path.tsx

import { AccountView } from "@daveyplate/better-auth-ui";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Award,
	Bell,
	Briefcase,
	Calendar,
	ClipboardCheck,
	Clock,
	CreditCard,
	FileText,
	GraduationCap,
	LogOut,
	Settings,
	Shield,
	Stethoscope,
	Syringe,
	User,
	Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/features/auth/client";
import type { AuthClientUser } from "@/features/auth/types";
import { cn } from "@/lib/utils";

// Define valid account view paths
const VALID_PATHS = [
	"profile",
	"security",
	"notifications",
	"billing",
	"practice",
	"patients",
	"schedule",
	"records",
	"settings"
] as const;

type ValidPath = (typeof VALID_PATHS)[number];

// Doctor-specific navigation items
const NAV_ITEMS: Array<{
	path: ValidPath;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string | number;
}> = [
	{ path: "profile", label: "Profile", icon: User },
	{ path: "practice", label: "Practice", icon: Briefcase },
	{ path: "patients", label: "Patients", icon: Users, badge: "12" },
	{ path: "schedule", label: "Schedule", icon: Calendar, badge: "5" },
	{ path: "records", label: "Medical Records", icon: FileText },
	{ path: "security", label: "Security", icon: Shield },
	{ path: "notifications", label: "Notifications", icon: Bell, badge: "3" },
	{ path: "billing", label: "Billing", icon: CreditCard },
	{ path: "settings", label: "Settings", icon: Settings }
];

// Account view configurations
const ACCOUNT_VIEW_CONFIGS: Record<
	ValidPath,
	{
		title: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
	}
> = {
	profile: {
		title: "Doctor Profile",
		description: "Manage your professional information and credentials",
		icon: User
	},
	practice: {
		title: "Practice Information",
		description: "Manage your practice details and specialties",
		icon: Briefcase
	},
	patients: {
		title: "My Patients",
		description: "View and manage your patient roster",
		icon: Users
	},
	schedule: {
		title: "Schedule",
		description: "Manage your appointments and availability",
		icon: Calendar
	},
	records: {
		title: "Medical Records",
		description: "Access and manage patient medical records",
		icon: FileText
	},
	security: {
		title: "Security",
		description: "Manage your password and security settings",
		icon: Shield
	},
	notifications: {
		title: "Notifications",
		description: "Configure your notification preferences",
		icon: Bell
	},
	billing: {
		title: "Billing",
		description: "Manage your billing and payment information",
		icon: CreditCard
	},
	settings: {
		title: "Settings",
		description: "Configure your account preferences",
		icon: Settings
	}
};

// Define the DoctorProfile type matching what we're using
interface DoctorProfile {
	specialization: string;
	licenseNumber: string;
	yearsOfExperience: number;
	hospitalAffiliation: string;
	clinicAddress: string;
	phone: string;
	email: string;
	education: Array<{ degree: string; institution: string; year: number }>;
	certifications: string[];
	languages: string[];
	patientCount: number;
	weeklyAppointments: number;
	averageRating: number;
	totalReviews: number;
	specialty?: string; // Added as optional for compatibility
}

export const Route = createFileRoute("/account/$path")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const { path } = params;

		// Validate path and redirect if invalid
		if (!VALID_PATHS.includes(path as ValidPath)) {
			throw new Error("Invalid account view");
		}

		return { path: path as ValidPath };
	},
	notFoundComponent: () => (
		<div className='flex min-h-100 flex-col items-center justify-center'>
			<div className='text-center'>
				<Stethoscope className='mx-auto h-12 w-12 text-sea-ink-soft' />
				<h2 className='mt-4 font-bold font-serif text-2xl text-sea-ink'>Page Not Found</h2>
				<p className='mt-2 text-sea-ink-soft'>The account page you're looking for doesn't exist.</p>
				<Link
					className='mt-4 inline-block'
					params={{ path: "profile" }}
					to='/account/$path'
				>
					<Button className='bg-lagoon hover:bg-lagoon-deep'>Go to Profile</Button>
				</Link>
			</div>
		</div>
	),
	pendingComponent: () => <DoctorAccountSkeleton />,
	errorComponent: ({ error }) => (
		<div className='flex min-h-100 flex-col items-center justify-center'>
			<div className='text-center'>
				<div className='mx-auto rounded-full bg-rose-100 p-3'>
					<Shield className='h-8 w-8 text-rose-500' />
				</div>
				<h2 className='mt-4 font-bold font-serif text-2xl text-rose-500'>Error Loading Account</h2>
				<p className='mt-2 text-sea-ink-soft'>{error.message}</p>
				<Link
					className='mt-4 inline-block'
					params={{ path: "profile" }}
					to='/account/$path'
				>
					<Button variant='outline'>Return to Profile</Button>
				</Link>
			</div>
		</div>
	)
});

function RouteComponent() {
	const { path } = Route.useParams() as { path: ValidPath };
	const { data: user, isLoading } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const { data } = await authClient.getSession();
			return data?.user;
		}
	});

	const { data: doctorProfile } = useQuery<DoctorProfile>({
		queryKey: ["doctor-profile"],
		queryFn: async () => {
			// Fetch doctor-specific profile data
			return {
				specialization: "Pediatric Cardiology",
				licenseNumber: "MD-12345",
				yearsOfExperience: 12,
				hospitalAffiliation: "Children's Medical Center",
				clinicAddress: "123 Pediatric Way, Medical District",
				phone: "+1 (555) 234-5678",
				email: "dr.smith@pediatricclinic.com",
				education: [
					{ degree: "MD", institution: "Harvard Medical School", year: 2012 },
					{ degree: "Residency", institution: "Boston Children's Hospital", year: 2015 },
					{ degree: "Fellowship", institution: "Stanford Children's Health", year: 2018 }
				],
				certifications: [
					"Board Certified in Pediatrics",
					"Pediatric Advanced Life Support",
					"Neonatal Resuscitation Program"
				],
				languages: ["English", "Spanish", "Medical Spanish"],
				patientCount: 1250,
				weeklyAppointments: 32,
				averageRating: 4.8,
				totalReviews: 156,
				specialty: "Pediatric Cardiology" // Added for compatibility
			};
		}
	});

	const currentView = ACCOUNT_VIEW_CONFIGS[path];

	return (
		<div className='container mx-auto space-y-6 px-4 py-6 md:px-6 md:py-8'>
			{/* Breadcrumb */}
			<nav
				aria-label='Breadcrumb'
				className='flex items-center gap-2 text-sea-ink-soft text-sm'
			>
				<Link
					className='transition-colors hover:text-sea-ink'
					to='/auth/dashboard'
				>
					Dashboard
				</Link>
				<span>/</span>
				<Link
					className='transition-colors hover:text-sea-ink'
					params={{ path: "profile" }}
					to='/account/$path'
				>
					Account
				</Link>
				<span>/</span>
				<span className='font-medium text-sea-ink'>{currentView?.title || path}</span>
			</nav>

			<div className='grid gap-6 lg:grid-cols-4'>
				{/* Sidebar */}
				<aside
					aria-label='Account navigation'
					className='lg:col-span-1'
				>
					<div className='sticky top-20 space-y-4'>
						{/* Doctor Profile Card */}
						<Card className='overflow-hidden border-lagoon/20'>
							<CardContent className='p-4'>
								<div className='flex flex-col items-center text-center'>
									<div className='relative'>
										<Avatar className='h-20 w-20 border-2 border-lagoon/20'>
											<AvatarImage
												alt={user?.name || "Doctor"}
												src={user?.image || undefined}
											/>
											<AvatarFallback className='bg-lagoon/10 font-medium text-2xl text-lagoon-deep'>
												{user?.name
													?.split(" ")
													.map((n: string) => n[0])
													.join("")
													.toUpperCase() || "DR"}
											</AvatarFallback>
										</Avatar>
										<Badge className='absolute -right-1 -bottom-1 bg-lagoon text-white'>
											<Stethoscope className='mr-1 h-3 w-3' />
											MD
										</Badge>
									</div>

									{isLoading ? (
										<div className='mt-3 space-y-1'>
											<Skeleton className='h-4 w-24' />
											<Skeleton className='h-3 w-32' />
										</div>
									) : (
										<>
											<h3 className='mt-3 font-semibold text-sea-ink'>
												{user?.name || "Dr. Sarah Smith"}
											</h3>
											<p className='text-sea-ink-soft text-sm'>
												{doctorProfile?.specialization || "Pediatrician"}
											</p>
											<div className='mt-2 flex items-center gap-1'>
												<span className='flex items-center gap-1'>
													<span className='text-yellow-500'>★</span>
													<span className='font-medium text-sm'>
														{doctorProfile?.averageRating || 4.8}
													</span>
												</span>
												<span className='text-sea-ink-soft text-xs'>
													({doctorProfile?.totalReviews || 0} reviews)
												</span>
											</div>
											<Badge
												className='mt-2 border-lagoon/20 bg-lagoon/5 text-lagoon-deep'
												variant='outline'
											>
												<Clock className='mr-1 h-3 w-3' />
												{doctorProfile?.yearsOfExperience || 0}+ Years Experience
											</Badge>
										</>
									)}
								</div>

								<Separator className='my-3' />

								{/* Quick Stats */}
								<div className='grid grid-cols-2 gap-2'>
									<div className='rounded-lg bg-sand/30 p-2 text-center'>
										<p className='font-bold text-lagoon-deep text-xl'>
											{doctorProfile?.patientCount || 0}
										</p>
										<p className='text-[10px] text-sea-ink-soft'>Patients</p>
									</div>
									<div className='rounded-lg bg-sand/30 p-2 text-center'>
										<p className='font-bold text-lagoon-deep text-xl'>
											{doctorProfile?.weeklyAppointments || 0}
										</p>
										<p className='text-[10px] text-sea-ink-soft'>This Week</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Navigation */}
						<nav
							aria-label='Account settings'
							className='space-y-1'
						>
							{NAV_ITEMS.map(item => {
								const Icon = item.icon;
								const isActive = path === item.path;

								return (
									<Link
										className={cn(
											"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
											isActive
												? "bg-lagoon/10 font-medium text-lagoon-deep"
												: "text-sea-ink-soft hover:bg-sand/50 hover:text-sea-ink"
										)}
										key={item.path}
										params={{ path: item.path }}
										to='/account/$path'
									>
										<Icon className='h-4 w-4 shrink-0' />
										<span className='flex-1 text-left'>{item.label}</span>
										{item.badge && (
											<Badge
												className='ml-auto h-5 px-1.5 text-[10px]'
												variant='secondary'
											>
												{item.badge}
											</Badge>
										)}
									</Link>
								);
							})}

							<Separator className='my-3' />

							{/* Logout Button */}
							<button
								className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-rose-500 text-sm transition-colors hover:bg-rose-50 hover:text-rose-600'
								onClick={async () => {
									await authClient.signOut();
								}}
								type='button'
							>
								<LogOut className='h-4 w-4 shrink-0' />
								<span>Logout</span>
							</button>
						</nav>
					</div>
				</aside>

				{/* Main Content */}
				<main
					aria-label='Account content'
					className='lg:col-span-3'
				>
					<div className='space-y-6'>
						{/* Page Header */}
						<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
							<div>
								<h1 className='flex items-center gap-2 font-bold font-serif text-2xl text-sea-ink md:text-3xl'>
									{currentView && <currentView.icon className='h-6 w-6 text-lagoon-deep' />}
									{currentView?.title || "Account"}
								</h1>
								<p className='mt-1 text-sea-ink-soft text-sm'>
									{currentView?.description || "Manage your doctor account settings"}
								</p>
							</div>
							<Link to='/auth/dashboard'>
								<Button
									className='shrink-0 gap-2'
									size='sm'
									variant='outline'
								>
									<ArrowLeft className='h-4 w-4' />
									Back to Dashboard
								</Button>
							</Link>
						</div>

						{/* Account Content */}
						<div className='rounded-xl border border-lagoon/10 bg-white/50 p-4 backdrop-blur-sm md:p-6'>
							{path === "profile" && (
								<DoctorProfileView
									doctorProfile={doctorProfile}
									user={user}
								/>
							)}
							{path === "practice" && <PracticeView doctorProfile={doctorProfile} />}
							{path === "patients" && <PatientsView />}
							{path === "schedule" && <ScheduleView />}
							{path === "records" && <RecordsView />}
							{path === "security" && <SecurityView />}
							{path === "notifications" && <NotificationsView />}
							{path === "billing" && <BillingView />}
							{path === "settings" && <SettingsView />}
						</div>

						{/* Quick Actions */}
						<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
							<Card className='cursor-pointer border-lagoon/20 transition-all hover:border-lagoon-deep/40 hover:shadow-md'>
								<CardContent className='flex items-center gap-3 p-3'>
									<Users className='h-5 w-5 text-lagoon-deep' />
									<div>
										<p className='font-medium text-sm'>Patient List</p>
										<p className='text-sea-ink-soft text-xs'>View all patients</p>
									</div>
								</CardContent>
							</Card>
							<Card className='cursor-pointer border-lagoon/20 transition-all hover:border-lagoon-deep/40 hover:shadow-md'>
								<CardContent className='flex items-center gap-3 p-3'>
									<Calendar className='h-5 w-5 text-lagoon-deep' />
									<div>
										<p className='font-medium text-sm'>Schedule</p>
										<p className='text-sea-ink-soft text-xs'>Manage appointments</p>
									</div>
								</CardContent>
							</Card>
							<Card className='cursor-pointer border-lagoon/20 transition-all hover:border-lagoon-deep/40 hover:shadow-md'>
								<CardContent className='flex items-center gap-3 p-3'>
									<ClipboardCheck className='h-5 w-5 text-lagoon-deep' />
									<div>
										<p className='font-medium text-sm'>SOAP Notes</p>
										<p className='text-sea-ink-soft text-xs'>Document encounters</p>
									</div>
								</CardContent>
							</Card>
							<Card className='cursor-pointer border-lagoon/20 transition-all hover:border-lagoon-deep/40 hover:shadow-md'>
								<CardContent className='flex items-center gap-3 p-3'>
									<Syringe className='h-5 w-5 text-lagoon-deep' />
									<div>
										<p className='font-medium text-sm'>Immunizations</p>
										<p className='text-sea-ink-soft text-xs'>Track vaccinations</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

// Doctor Profile View Component
function DoctorProfileView({ user, doctorProfile }: { user?: AuthClientUser; doctorProfile?: DoctorProfile }) {
	return (
		<div className='space-y-6'>
			<div className='grid gap-6 md:grid-cols-2'>
				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<User className='h-5 w-5 text-lagoon-deep' />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>Full Name</span>
							<span className='font-medium'>{user?.name || "Dr. Sarah Smith"}</span>
						</div>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>Email</span>
							<span className='font-medium'>{user?.email || "dr.smith@pediatricclinic.com"}</span>
						</div>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>Phone</span>
							<span className='font-medium'>{doctorProfile?.phone || "+1 (555) 234-5678"}</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sea-ink-soft'>Specialization</span>
							<Badge
								className='border-lagoon/20 bg-lagoon/5 text-lagoon-deep'
								variant='outline'
							>
								{doctorProfile?.specialty || doctorProfile?.specialization || "Pediatric Cardiology"}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Professional Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Stethoscope className='h-5 w-5 text-lagoon-deep' />
							Professional Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>License Number</span>
							<span className='font-medium'>{doctorProfile?.licenseNumber || "MD-12345"}</span>
						</div>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>Experience</span>
							<span className='font-medium'>{doctorProfile?.yearsOfExperience || 12} Years</span>
						</div>
						<div className='flex justify-between border-b pb-2'>
							<span className='text-sea-ink-soft'>Hospital</span>
							<span className='font-medium'>
								{doctorProfile?.hospitalAffiliation || "Children's Medical Center"}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sea-ink-soft'>Languages</span>
							<div className='flex flex-wrap gap-1'>
								{Array.isArray(doctorProfile?.languages) &&
									doctorProfile.languages.map((lang: string) => (
										<Badge
											className='text-xs'
											key={lang}
											variant='secondary'
										>
											{lang}
										</Badge>
									))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Education & Certifications */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<GraduationCap className='h-5 w-5 text-lagoon-deep' />
						Education & Certifications
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<h4 className='mb-2 font-medium text-sm'>Education</h4>
						{Array.isArray(doctorProfile?.education) &&
							doctorProfile.education.map(
								(edu: { degree: string; institution: string; year: number }, index: number) => (
									<div
										className='mb-2 flex items-center justify-between rounded-lg bg-sand/30 p-2'
										key={index}
									>
										<div>
											<p className='font-medium'>{edu.degree}</p>
											<p className='text-sea-ink-soft text-sm'>{edu.institution}</p>
										</div>
										<Badge variant='outline'>{edu.year}</Badge>
									</div>
								)
							)}
					</div>
					<Separator />
					<div>
						<h4 className='mb-2 font-medium text-sm'>Certifications</h4>
						<div className='flex flex-wrap gap-2'>
							{Array.isArray(doctorProfile?.certifications) &&
								doctorProfile.certifications.map((cert: string) => (
									<Badge
										className='bg-lagoon/10 text-lagoon-deep'
										key={cert}
									>
										<Award className='mr-1 h-3 w-3' />
										{cert}
									</Badge>
								))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Practice View Component
function PracticeView({ doctorProfile }: { doctorProfile?: DoctorProfile }) {
	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Briefcase className='h-5 w-5 text-lagoon-deep' />
						Practice Details
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-2'>
						<div className='rounded-lg bg-sand/30 p-3'>
							<p className='text-sea-ink-soft text-sm'>Clinic Name</p>
							<p className='font-medium'>LittleHearts Pediatric Clinic</p>
						</div>
						<div className='rounded-lg bg-sand/30 p-3'>
							<p className='text-sea-ink-soft text-sm'>Clinic Type</p>
							<p className='font-medium'>Specialized Pediatric Care</p>
						</div>
						<div className='rounded-lg bg-sand/30 p-3 md:col-span-2'>
							<p className='text-sea-ink-soft text-sm'>Address</p>
							<p className='font-medium'>
								{doctorProfile?.clinicAddress || "123 Pediatric Way, Medical District"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Patients View Component
function PatientsView() {
	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='font-medium text-lg'>Patient Roster</h2>
				<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
					<Users className='h-4 w-4' />
					View All Patients
				</Button>
			</div>
			<div className='space-y-2'>
				{[1, 2, 3].map(i => (
					<div
						className='flex items-center justify-between rounded-lg border p-3 hover:bg-sand/30'
						key={i}
					>
						<div className='flex items-center gap-3'>
							<Avatar>
								<AvatarFallback className='bg-lagoon/10 text-lagoon-deep'>
									{["EJ", "LS", "MG"][i - 1]}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='font-medium'>{["Emma Johnson", "Liam Smith", "Mia Garcia"][i - 1]}</p>
								<p className='text-sea-ink-soft text-sm'>Age: {["2y", "4y", "1y"][i - 1]}</p>
							</div>
						</div>
						<Badge
							className='border-lagoon/20'
							variant='outline'
						>
							Last Visit: {["2024-01-15", "2024-01-14", "2024-01-13"][i - 1]}
						</Badge>
					</div>
				))}
			</div>
		</div>
	);
}

// Schedule View Component
function ScheduleView() {
	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='font-medium text-lg'>Weekly Schedule</h2>
				<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
					<Calendar className='h-4 w-4' />
					Manage Schedule
				</Button>
			</div>
			<div className='space-y-3'>
				{["Monday", "Tuesday", "Wednesday"].map(day => (
					<div
						className='rounded-lg border p-3'
						key={day}
					>
						<div className='flex items-center justify-between'>
							<h4 className='font-medium'>{day}</h4>
							<Badge>8 Appointments</Badge>
						</div>
						<div className='mt-2 space-y-1 text-sea-ink-soft text-sm'>
							<p>9:00 AM - 12:00 PM (Morning Clinic)</p>
							<p>1:00 PM - 5:00 PM (Afternoon Clinic)</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Placeholder views for other sections
function RecordsView() {
	return <div className='p-4 text-center text-sea-ink-soft'>Medical Records Management</div>;
}

function SecurityView() {
	return <AccountView path='security' />;
}

function NotificationsView() {
	return <AccountView path='notifications' />;
}

function BillingView() {
	return <AccountView path='billing' />;
}

function SettingsView() {
	return <AccountView path='settings' />;
}

// Doctor Account Skeleton Component
function DoctorAccountSkeleton() {
	return (
		<div className='container mx-auto space-y-6 px-4 py-6 md:px-6 md:py-8'>
			<div className='grid gap-6 lg:grid-cols-4'>
				<aside className='lg:col-span-1'>
					<div className='sticky top-20'>
						<Card className='mb-4'>
							<CardContent className='p-4'>
								<div className='flex flex-col items-center text-center'>
									<Skeleton className='h-20 w-20 rounded-full' />
									<Skeleton className='mt-2 h-4 w-24' />
									<Skeleton className='mt-1 h-3 w-32' />
									<div className='mt-2 flex gap-1'>
										<Skeleton className='h-4 w-12' />
										<Skeleton className='h-4 w-16' />
									</div>
								</div>
							</CardContent>
						</Card>
						<div className='space-y-2'>
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton
									className='h-10 w-full'
									key={i}
								/>
							))}
						</div>
					</div>
				</aside>
				<main className='lg:col-span-3'>
					<div className='space-y-4'>
						<Skeleton className='h-8 w-48' />
						<Skeleton className='h-4 w-72' />
						<Card className='p-6'>
							<div className='space-y-4'>
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-12 w-full' />
							</div>
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}
