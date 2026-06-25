// src/routes/dashboard/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertCircle, Baby, ClipboardCheck, Clock, DollarSign, HeartPulse, Syringe } from "lucide-react";
import TransactionDatatable from "@/components/dashboard/datatable-transaction";
import GrowthMetricsCare from "@/components/dashboard/growth-metrics";
import { examplePatientData } from "@/components/dashboard/patient-growth-data";
import StatisticsCard from "@/components/dashboard/statistics-card-01";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClinicalDashboard } from "@/features/dashboard/components/ClinicalDashboard";

// Types
interface PediatricTransaction {
	amount: number;
	date: string;
	id: string;
	insuranceClaim?: boolean;
	parentName: string;
	patientId: string;
	patientName: string;
	paymentMethod: "visa" | "mastercard";
	service: string;
	status: "paid" | "pending" | "processing" | "failed";
}

interface PediatricStat {
	changePercentage: string;
	icon: React.ReactNode;
	title: string;
	trend: "up" | "down";
	value: number | string;
}

// Mock pediatric transaction data
const pediatricTransactions: PediatricTransaction[] = [
	{
		id: "1",
		patientId: "P-2024-001",
		patientName: "Emma Johnson",
		parentName: "Sarah Johnson",
		service: "Well-Child Visit",
		amount: 250.0,
		date: "2024-01-15",
		status: "paid",
		paymentMethod: "visa",
		insuranceClaim: true
	},
	{
		id: "2",
		patientId: "P-2024-002",
		patientName: "Liam Smith",
		parentName: "Michael Smith",
		service: "Childhood Vaccination",
		amount: 185.5,
		date: "2024-01-16",
		status: "pending",
		paymentMethod: "mastercard",
		insuranceClaim: true
	},
	{
		id: "3",
		patientId: "P-2024-003",
		patientName: "Mia Garcia",
		parentName: "Maria Garcia",
		service: "Developmental Screening",
		amount: 320.75,
		date: "2024-01-17",
		status: "paid",
		paymentMethod: "visa",
		insuranceClaim: false
	},
	{
		id: "4",
		patientId: "P-2024-004",
		patientName: "Noah Davis",
		parentName: "John Davis",
		service: "Emergency Pediatric Care",
		amount: 889.0,
		date: "2024-01-18",
		status: "pending",
		paymentMethod: "visa",
		insuranceClaim: true
	},
	{
		id: "5",
		patientId: "P-2024-005",
		patientName: "Olivia Wilson",
		parentName: "David Wilson",
		service: "Child Psychotherapy",
		amount: 723.16,
		date: "2024-01-19",
		status: "paid",
		paymentMethod: "mastercard",
		insuranceClaim: false
	},
	{
		id: "6",
		patientId: "P-2024-006",
		patientName: "Ethan Brown",
		parentName: "Jennifer Brown",
		service: "Allergy Testing",
		amount: 612.0,
		date: "2024-01-20",
		status: "failed",
		paymentMethod: "mastercard",
		insuranceClaim: true
	},
	{
		id: "7",
		patientId: "P-2024-007",
		patientName: "Sophia Taylor",
		parentName: "Robert Taylor",
		service: "Pediatric Cardiology",
		amount: 445.25,
		date: "2024-01-21",
		status: "paid",
		paymentMethod: "visa",
		insuranceClaim: true
	},
	{
		id: "8",
		patientId: "P-2024-008",
		patientName: "Mason Martinez",
		parentName: "Lisa Martinez",
		service: "Newborn Checkup",
		amount: 297.8,
		date: "2024-01-22",
		status: "processing",
		paymentMethod: "mastercard",
		insuranceClaim: false
	},
	{
		id: "9",
		patientId: "P-2024-009",
		patientName: "Isabella Thompson",
		parentName: "Karen Thompson",
		service: "Immunization Schedule",
		amount: 756.9,
		date: "2024-01-23",
		status: "paid",
		paymentMethod: "visa",
		insuranceClaim: true
	},
	{
		id: "10",
		patientId: "P-2024-010",
		patientName: "Alexander Johnson",
		parentName: "Amanda Johnson",
		service: "Wellness Checkup",
		amount: 189.5,
		date: "2024-01-24",
		status: "pending",
		paymentMethod: "mastercard",
		insuranceClaim: false
	}
];

// Pediatric statistics data
const pediatricStats: PediatricStat[] = [
	{
		title: "Total Children",
		value: 0,
		icon: <Baby className='h-4 w-4' />,
		changePercentage: "+12%",
		trend: "up"
	},
	{
		title: "Monthly Revenue",
		value: 0,
		icon: <DollarSign className='h-4 w-4' />,
		changePercentage: "+8%",
		trend: "up"
	},
	{
		title: "Pending Payments",
		value: 0,
		icon: <Clock className='h-4 w-4' />,
		changePercentage: "-5%",
		trend: "down"
	},
	{
		title: "Insurance Claims",
		value: 0,
		icon: <ClipboardCheck className='h-4 w-4' />,
		changePercentage: "+15%",
		trend: "up"
	}
];

// Vaccination coverage data
const vaccinationCoverage = [
	{ vaccine: "MMR", coverage: 92 },
	{ vaccine: "DTaP", coverage: 88 },
	{ vaccine: "Polio", coverage: 85 },
	{ vaccine: "Hib", coverage: 79 },
	{ vaccine: "Hepatitis B", coverage: 90 },
	{ vaccine: "Varicella", coverage: 76 }
];

export const Route = createFileRoute("/auth/dashboard/")({
	component: RouteComponent
});

function RouteComponent() {
	// Calculate pediatric statistics
	const totalChildren = pediatricTransactions.length;
	const totalRevenue = pediatricTransactions.reduce((sum, t) => sum + t.amount, 0);
	const pendingPayments = pediatricTransactions.filter(t => t.status === "pending").length;
	const insuranceClaims = pediatricTransactions.filter(t => t.insuranceClaim).length;
	const completedVisits = pediatricTransactions.filter(t => t.status === "paid").length;
	const processingVisits = pediatricTransactions.filter(t => t.status === "processing").length;

	// Fix: Use examplePatientData directly for GrowthMetricsCare
	// The GrowthMetricsCare component expects a patient object with specific fields
	const patientForGrowthMetrics = {
		...examplePatientData,
		name: examplePatientData.patientName,
		id: examplePatientData.patientId
	};

	// Update statistics with calculated values
	const statsWithValues = pediatricStats.map((stat, index) => {
		if (index === 0) {
			return { ...stat, value: totalChildren };
		}
		if (index === 1) {
			return { ...stat, value: `$${totalRevenue.toFixed(2)}` };
		}
		if (index === 2) {
			return { ...stat, value: pendingPayments };
		}
		if (index === 3) {
			return { ...stat, value: insuranceClaims };
		}
		return stat;
	});

	// Prepare data for transaction table
	const tableData = pediatricTransactions.map(t => ({
		...t,
		name: t.patientName,
		email: `${t.parentName} (Parent)`,
		paidBy: t.paymentMethod,
		avatar: `https://ui-avatars.com/api/?name=${t.patientName.replace(" ", "+")}&size=32&background=4FB8B2&color=fff`,
		avatarFallback: t.patientName
			.split(" ")
			.map(n => n[0])
			.join("")
	}));

	// Helper function to get progress class
	const getProgressClass = (coverage: number) => {
		if (coverage >= 90) {
			return "bg-emerald-200";
		}
		if (coverage >= 75) {
			return "bg-amber-200";
		}
		return "bg-rose-200";
	};

	return (
		<div className='space-y-6 p-4 md:p-6'>
			{/* Page Header */}
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Pediatric Dashboard</h1>
					<p className='text-sea-ink-soft text-sm'>
						Welcome back! Here's what's happening at your pediatric clinic today.
					</p>
				</div>
				<div className='flex gap-3'>
					<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
						<Baby className='h-4 w-4' />
						New Patient
					</Button>
					<Button
						className='gap-2'
						variant='outline'
					>
						<Syringe className='h-4 w-4' />
						Schedule Vaccination
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{statsWithValues.map(stat => (
					<StatisticsCard
						changePercentage={stat.changePercentage}
						className={`${stat.trend === "up" ? "border-lagoon/20" : "border-rose-500/20"}`}
						icon={stat.icon}
						key={stat.title}
						title={stat.title}
						value={String(stat.value)}
					/>
				))}
			</div>

			{/* Clinical Dashboard Section */}
			<ClinicalDashboard
				dueImmunizations={[]}
				recentEncounters={[]}
				recentPatients={{ patients: [], total: 0 }}
				upcomingAppointments={[]}
			/>

			{/* Growth Monitoring Section */}
			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					<GrowthMetricsCare
						className='h-full'
						patient={patientForGrowthMetrics}
					/>
				</div>
				<div className='space-y-6'>
					{/* Vaccination Coverage */}
					<Card className='border-lagoon/20'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Syringe className='h-5 w-5 text-lagoon' />
								Vaccination Coverage
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{vaccinationCoverage.map(item => (
								<div
									className='space-y-1'
									key={item.vaccine}
								>
									<div className='flex justify-between text-sm'>
										<span className='font-medium'>{item.vaccine}</span>
										<span className='text-sea-ink-soft'>{item.coverage}%</span>
									</div>
									<Progress
										className={`h-2 ${getProgressClass(item.coverage)}`}
										value={item.coverage}
									/>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card className='border-lagoon/20'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Activity className='h-5 w-5 text-lagoon' />
								Today's Overview
							</CardTitle>
						</CardHeader>
						<CardContent className='grid grid-cols-2 gap-3'>
							<div className='rounded-lg bg-sand/30 p-3 text-center'>
								<p className='font-bold text-2xl text-lagoon-deep'>{completedVisits}</p>
								<p className='text-sea-ink-soft text-xs'>Completed Visits</p>
							</div>
							<div className='rounded-lg bg-sand/30 p-3 text-center'>
								<p className='font-bold text-2xl text-amber-500'>{processingVisits}</p>
								<p className='text-sea-ink-soft text-xs'>In Progress</p>
							</div>
							<div className='rounded-lg bg-sand/30 p-3 text-center'>
								<p className='font-bold text-2xl text-rose-500'>{pendingPayments}</p>
								<p className='text-sea-ink-soft text-xs'>Pending Payments</p>
							</div>
							<div className='rounded-lg bg-sand/30 p-3 text-center'>
								<p className='font-bold text-2xl text-emerald-500'>{insuranceClaims}</p>
								<p className='text-sea-ink-soft text-xs'>Insurance Claims</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Recent Transactions Table */}
			<Card className='overflow-hidden border-lagoon/20'>
				<CardHeader className='border-b bg-sand/30'>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<ClipboardCheck className='h-5 w-5 text-lagoon' />
							Recent Patient Transactions
						</CardTitle>
						<div className='flex gap-2'>
							<Badge
								className='bg-white/50'
								variant='outline'
							>
								{totalChildren} Patients
							</Badge>
							<Badge
								className='bg-white/50'
								variant='outline'
							>
								${totalRevenue.toFixed(0)} Revenue
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent className='p-0'>
					<TransactionDatatable data={tableData} />
				</CardContent>
			</Card>

			{/* Growth Alerts Section */}
			<div className='grid gap-4 sm:grid-cols-2'>
				<Card className='border-amber-200 bg-amber-50/30'>
					<CardHeader className='pb-3'>
						<CardTitle className='flex items-center gap-2 text-amber-700 text-sm'>
							<AlertCircle className='h-4 w-4' />
							Growth Monitoring Alerts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<div className='flex items-center justify-between rounded-lg bg-white p-2 shadow-sm'>
								<div>
									<p className='font-medium text-sm'>Emma Johnson</p>
									<p className='text-amber-600 text-xs'>Weight below 5th percentile</p>
								</div>
								<Button
									className='h-7 text-xs'
									size='sm'
									variant='outline'
								>
									Review
								</Button>
							</div>
							<div className='flex items-center justify-between rounded-lg bg-white p-2 shadow-sm'>
								<div>
									<p className='font-medium text-sm'>Liam Smith</p>
									<p className='text-amber-600 text-xs'>Height below 10th percentile</p>
								</div>
								<Button
									className='h-7 text-xs'
									size='sm'
									variant='outline'
								>
									Review
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='border-emerald-200 bg-emerald-50/30'>
					<CardHeader className='pb-3'>
						<CardTitle className='flex items-center gap-2 text-emerald-700 text-sm'>
							<HeartPulse className='h-4 w-4' />
							Healthy Growth Milestones
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<div className='flex items-center justify-between rounded-lg bg-white p-2 shadow-sm'>
								<div>
									<p className='font-medium text-sm'>Sophia Taylor</p>
									<p className='text-emerald-600 text-xs'>On track for all milestones</p>
								</div>
								<Badge className='bg-emerald-500 text-white'>Excellent</Badge>
							</div>
							<div className='flex items-center justify-between rounded-lg bg-white p-2 shadow-sm'>
								<div>
									<p className='font-medium text-sm'>Mia Garcia</p>
									<p className='text-emerald-600 text-xs'>Above average growth</p>
								</div>
								<Badge className='bg-emerald-500 text-white'>Good</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
