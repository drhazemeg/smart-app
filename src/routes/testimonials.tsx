// src/routes/testimonials.tsx
import { Icons } from "@/components/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/testimonials")({
	component: Testimonials
});

function Testimonials() {
	const testimonials = [
		{
			quote: "Dr. Morgan is wonderful! She really listens and cares for our child like family. We feel so confident in her care.",
			name: "Sarah T.",
			role: "Parent of two"
		},
		{
			quote: "The lactation support at Bright Kids was life-saving. I was struggling with breastfeeding, and their consultant was patient, knowledgeable, and so supportive.",
			name: "Emily R.",
			role: "New mother"
		},
		{
			quote: "We've been bringing our children here for years. The doctors are exceptional and the staff always makes us feel welcome. Highly recommend!",
			name: "James P.",
			role: "Parent of three"
		},
		{
			quote: "The telehealth service is a game-changer! We've had a few virtual visits for minor concerns, and it's so convenient and easy.",
			name: "Lena K.",
			role: "Parent of two"
		},
		{
			quote: "They truly understand children. My daughter is usually nervous about doctors, but she loves coming here. The environment is so warm and friendly.",
			name: "David M.",
			role: "Parent of one"
		}
	];

	return (
		<div className='min-h-screen bg-white text-slate-800'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] via-[#d6f0f0] to-[#ccf2f4] py-20 md:py-28'>
				<div className='mx-auto max-w-7xl px-6 text-center'>
					<h1 className='font-bold text-4xl text-[#1b4b6b] md:text-5xl lg:text-6xl'>
						Family <span className='text-[#3eb6b4]'>Testimonials</span>
					</h1>
					<p className='mx-auto mt-4 max-w-2xl text-[#1b4b6b]/80 text-lg md:text-xl'>
						Hear from the families who have trusted us with their child's care.
					</p>
				</div>
				<div className='pointer-events-none absolute bottom-0 left-0 w-full leading-none'>
					<svg
						className='block h-12 w-full md:h-16'
						preserveAspectRatio='none'
						viewBox='0 0 1440 80'
					>
						<title>Divider</title>
						<path
							d='M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z'
							fill='#ffffff'
						/>
					</svg>
				</div>
			</section>

			{/* Testimonials Grid */}
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
						{testimonials.map((testimonial, index) => (
							<div
								className='relative rounded-2xl bg-[#fdf2f7] p-8 shadow-sm transition hover:shadow-md'
								key={index}
							>
								<Icons.quote className='absolute top-6 right-6 h-8 w-8 rotate-180 text-[#f07e9c]/40' />
								<p className='relative z-10 font-medium text-[#1b4b6b] text-base leading-relaxed'>
									{testimonial.quote}
								</p>
								<div className='mt-6 flex items-center gap-4'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#fbd5e1] font-semibold text-[#1b4b6b]'>
										{testimonial.name
											.split(" ")
											.map(n => n[0])
											.join("")}
									</div>
									<div>
										<p className='font-semibold text-[#1b4b6b]'>{testimonial.name}</p>
										<p className='text-slate-500 text-sm'>{testimonial.role}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
