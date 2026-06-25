// src/routes/services.tsx
import { Icons } from "@/components/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
	component: Services
});

function Services() {
	const services = [
		{
			icon: <Icons.heart className='h-7 w-7' />,
			title: "Well Child Exams",
			description:
				"Comprehensive check-ups, developmental screenings, and preventative care from infancy through adolescence. We track growth, milestones, and provide guidance on nutrition and safety."
		},
		{
			icon: <Icons.baby className='h-7 w-7' />,
			title: "Lactation Support",
			description:
				"Breastfeeding guidance, education, and practical support for new families. Our certified lactation consultants help with latch, positioning, milk supply, and other breastfeeding concerns."
		},
		{
			icon: <Icons.ThermometerIcon className='h-7 w-7' />,
			title: "Sick Visits",
			description:
				"Personalized attention for childhood illnesses such as ear infections, fevers, rashes, and respiratory issues. We offer same-day appointments for urgent care needs."
		},
		{
			icon: <Icons.syringe className='h-7 w-7' />,
			title: "Immunizations",
			description:
				"We follow the recommended immunization schedule to protect your child from vaccine-preventable diseases. We provide thorough education on the benefits and safety of vaccines."
		},
		{
			icon: <Icons.activity className='h-7 w-7' />,
			title: "Developmental Assessments",
			description:
				"We monitor your child's physical, cognitive, social, and emotional development. Early identification of developmental delays allows for timely intervention and support."
		},
		{
			icon: <Icons.phone className='h-7 w-7' />,
			title: "Telehealth Consultations",
			description:
				"Access expert pediatric advice from the comfort of your home. Virtual visits are ideal for minor concerns, follow-ups, and consultations."
		}
	];

	return (
		<div className='min-h-screen bg-white text-slate-800'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] via-[#d6f0f0] to-[#ccf2f4] py-20 md:py-28'>
				<div className='mx-auto max-w-7xl px-6 text-center'>
					<h1 className='font-bold text-4xl text-[#1b4b6b] md:text-5xl lg:text-6xl'>
						Our <span className='text-[#3eb6b4]'>Services</span>
					</h1>
					<p className='mx-auto mt-4 max-w-2xl text-lg text-[#1b4b6b]/80 md:text-xl'>
						Comprehensive pediatric care designed to support your family.
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

			{/* Services List */}
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
						{services.map(service => (
							<div
								key={service.title}
								className='rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm transition hover:shadow-md'
							>
								<div className='mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e0f4f4] text-[#3eb6b4]'>
									{service.icon}
								</div>
								<h3 className='mb-2 font-semibold text-[#1b4b6b] text-xl'>{service.title}</h3>
								<p className='text-slate-500 text-sm leading-relaxed'>{service.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className='bg-[#f0fbfb] py-20'>
				<div className='mx-auto max-w-3xl px-6 text-center'>
					<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>Ready to Schedule a Visit?</h2>
					<p className='mt-4 text-[#1b4b6b]/75 text-lg'>
						Our team is here to support your child's health journey.
					</p>
					<button
						type='button'
						className='mt-8 rounded-full bg-[#3eb6b4] px-8 py-3.5 font-medium text-base text-white shadow-md transition hover:bg-[#329e9c] active:scale-95'
					>
						Book an Appointment
					</button>
				</div>
			</section>
		</div>
	);
}
