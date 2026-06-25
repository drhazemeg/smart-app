import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentStatsProps {
	stats: {
		counts: {
			PENDING: number;
			CONFIRMED: number;
			COMPLETED: number;
			CANCELLED: number;
			NO_SHOW: number;
		};
		totalAppointments: number;
		totalRevenue: number;
	};
}

export function AppointmentStats({ stats }: AppointmentStatsProps) {
	const statCards = [
		{
			title: "Total Appointments",
			value: stats.totalAppointments,
			icon: Icons.calendar,
			color: "text-blue-500"
		},
		{
			title: "Pending",
			value: stats.counts.PENDING,
			icon: Icons.clock,
			color: "text-yellow-500"
		},
		{
			title: "Confirmed",
			value: stats.counts.CONFIRMED,
			icon: Icons.check,
			color: "text-green-500"
		},
		{
			title: "Completed",
			value: stats.counts.COMPLETED,
			icon: Icons.circleCheck,
			color: "text-emerald-500"
		},
		{
			title: "Revenue",
			value: `$${stats.totalRevenue.toLocaleString()}`,
			icon: Icons.creditCard,
			color: "text-purple-500"
		}
	];

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
			{statCards.map(stat => (
				<Card key={stat.title}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>
						<stat.icon className={`h-4 w-4 ${stat.color}`} />
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>{stat.value}</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
