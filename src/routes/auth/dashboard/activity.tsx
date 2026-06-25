import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/dashboard/activity")({
	component: ActivityPage
});

function ActivityPage() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold text-3xl tracking-tight'>Activity</h1>
				<p className='mt-2 text-gray-600'>View your recent activity and logs</p>
			</div>

			<div className='grid gap-6'>
				<div className='rounded-lg border p-6'>
					<h2 className='mb-4 font-semibold text-xl'>Recent Activity</h2>
					<div className='space-y-4'>
						<div className='flex items-center justify-between border-b py-3 last:border-b-0'>
							<div>
								<p className='font-medium'>Activity Item</p>
								<p className='text-gray-600 text-sm'>No recent activity</p>
							</div>
							<span className='text-gray-500 text-xs'>Just now</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
