// src/routes/index.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import { Icons } from "@/components/ui/icons";

export const Route = createFileRoute("/")({
	component: Home
});

function Home() {
	return (
		<div className='min-h-screen bg-white text-slate-800'>
			{/* ─── Header ─── */}
			<header className='sticky top-0 z-50 border-slate-100 border-b bg-white/90 backdrop-blur-sm'>
				<div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
					<Link
						className='flex items-center gap-2.5'
						to='/'
					>
						<Icons.heart className='h-8 w-8 text-[#f07e9c]' />
						<span className='font-semibold text-[#1b4b6b] text-xl'>
							Bright Kids <span className='font-normal text-[#3eb6b4]'>Pediatric Care</span>
						</span>
					</Link>

					<nav className='hidden items-center gap-7 md:flex'>
						{[
							{ label: "Home", href: "#home" },
							{ label: "Our Services", href: "#services" },
							{ label: "About Us", href: "#about" },
							{ label: "Testimonials", href: "#testimonials" },
							{ label: "Contact", href: "#contact" }
						].map(link => (
							<a
								className='font-medium text-[#1b4b6b] text-sm transition-colors hover:text-[#3eb6b4]'
								href={link.href}
								key={link.href}
							>
								{link.label}
							</a>
						))}
					</nav>

					<button
						className='rounded-full bg-[#3eb6b4] px-5 py-2.5 font-medium text-sm text-white shadow-sm transition hover:bg-[#329e9c] active:scale-95'
						type='button'
					>
						Book Appointment
					</button>
				</div>
			</header>

			{/* ─── Hero ─── */}
			<section
				className='relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] via-[#d6f0f0] to-[#ccf2f4]'
				id='home'
			>
				<div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32'>
					{/* Text */}
					<div className='flex flex-col items-start'>
						<span className='mb-5 inline-block rounded-full bg-white/70 px-4 py-1.5 font-semibold text-[#1b4b6b] text-xs uppercase tracking-widest shadow-sm'>
							Trusted Pediatric Care
						</span>
						<h1 className='font-bold text-4xl text-[#1b4b6b] leading-tight lg:text-5xl xl:text-6xl'>
							Compassionate Care for Your Little Ones
						</h1>
						<p className='mt-6 max-w-lg text-[#1b4b6b]/80 text-lg leading-relaxed'>
							Expert pediatric and lactation services designed to support your family every step of the
							way.
						</p>
						<div className='mt-8 flex flex-wrap gap-3'>
							<button
								className='rounded-full bg-[#3eb6b4] px-7 py-3.5 font-medium text-base text-white shadow-md transition hover:bg-[#329e9c] active:scale-95'
								type='button'
							>
								Schedule a Visit
							</button>
							<button
								className='rounded-full border border-slate-200 bg-white px-7 py-3.5 font-medium text-[#1b4b6b] text-base shadow-sm transition hover:bg-slate-50'
								type='button'
							>
								Learn More
							</button>
						</div>
					</div>

					{/* Image */}
					<div className='flex justify-center lg:justify-end'>
						<div className='relative overflow-hidden rounded-[2.5rem] shadow-2xl'>
							<img
								alt='Pediatrician with family'
								className='h-[420px] w-full object-cover lg:h-[520px] lg:w-[480px]'
								src='https://cdn.screenshottocode.com/1bQMpNDd3iBtlqN2hNYtx.png'
							/>
						</div>
					</div>
				</div>

				{/* Wave divider */}
				<div className='pointer-events-none absolute bottom-0 left-0 w-full leading-none'>
					<svg
						className='block h-12 w-full md:h-16'
						preserveAspectRatio='none'
						viewBox='0 0 1440 80'
					>
						<title>Section divider</title>
						<path
							d='M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z'
							fill='#ffffff'
						/>
					</svg>
				</div>
			</section>

			{/* ─── Services ─── */}
			<section
				className='bg-white py-24'
				id='services'
			>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='mb-14 text-center'>
						<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>Our Services</h2>
						<p className='mt-3 text-[#1b4b6b]/70 text-lg'>
							Comprehensive care for every stage of childhood development.
						</p>
					</div>

					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{[
							{
								icon: <Icons.heart className='h-7 w-7' />,
								bg: "bg-[#fdf2f7]",
								color: "text-[#f07e9c]",
								title: "Well Child Exams",
								description:
									"Check-ups and preventative care to keep your child healthy and growing strong."
							},
							{
								icon: <Icons.baby className='h-7 w-7' />,
								bg: "bg-[#e0f4f4]",
								color: "text-[#3eb6b4]",
								title: "Lactation Support",
								description:
									"Breastfeeding guidance and practical support for new families from day one."
							},
							{
								icon: <Icons.ThermometerIcon className='h-7 w-7' />,
								bg: "bg-[#e6f7f7]",
								color: "text-[#3eb6b4]",
								title: "Sick Visits",
								description: "Personalized attention for childhood illness and urgent care needs."
							}
						].map(service => (
							<div
								className='rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm transition hover:shadow-md'
								key={service.title}
							>
								<div
									className={`mb-5 flex h-13 w-13 items-center justify-center rounded-xl ${service.bg} ${service.color}`}
								>
									{service.icon}
								</div>
								<h3 className='font-semibold text-[#1b4b6b] text-lg'>{service.title}</h3>
								<p className='mt-2.5 text-slate-500 text-sm leading-relaxed'>{service.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── About ─── */}
			<section
				className='bg-gradient-to-br from-[#f0fbfb] to-[#e3f2fd] py-24'
				id='about'
			>
				<div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2'>
					<div className='overflow-hidden rounded-[2rem] shadow-xl'>
						<img
							alt='Doctor with child'
							className='h-[380px] w-full object-cover'
							src='https://cdn.screenshottocode.com/_Un7ZIhG32s_hrXjI6rHz.png'
						/>
					</div>
					<div>
						<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>About Our Practice</h2>
						<p className='mt-5 text-[#1b4b6b]/75 text-base leading-relaxed'>
							At Bright Kids Pediatric Care, we believe every child deserves attentive, expert medical
							care delivered with warmth. Our team of board-certified pediatricians and lactation
							consultants partner with families to ensure every milestone is met with confidence.
						</p>
						<ul className='mt-7 space-y-3'>
							{[
								"Board-certified pediatricians",
								"Same-day sick visit availability",
								"Certified lactation consultants",
								"Welcoming, child-friendly environment"
							].map(item => (
								<li
									className='flex items-center gap-3'
									key={item}
								>
									<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3eb6b4]'>
										<Icons.check className='h-3 w-3 text-white' />
									</span>
									<span className='text-[#1b4b6b]/80 text-sm'>{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* ─── Testimonials ─── */}
			<section
				className='bg-white py-24'
				id='testimonials'
			>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='mb-14 text-center'>
						<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>What Families Say</h2>
						<p className='mt-3 text-[#1b4b6b]/70 text-lg'>
							Trusted by hundreds of families in our community.
						</p>
					</div>

					<div className='mx-auto max-w-2xl'>
						<div className='relative rounded-3xl bg-gradient-to-br from-[#fdf2f7] to-[#f0fbfb] p-10 shadow-sm'>
							<Icons.quote className='absolute top-6 left-8 h-10 w-10 rotate-180 text-[#f07e9c]/40' />
							<p className='relative z-10 font-medium text-[#1b4b6b] text-xl leading-relaxed'>
								Dr. Morgan is wonderful! She really listens and cares for our child like family. We feel
								so confident in her care.
							</p>
							<Icons.quote className='absolute right-8 bottom-6 h-10 w-10 text-[#f07e9c]/40' />
							<div className='mt-8 flex items-center gap-4'>
								<div className='h-10 w-10 rounded-full bg-[#fbd5e1]' />
								<div>
									<p className='font-semibold text-[#1b4b6b]'>Sarah T.</p>
									<p className='text-slate-500 text-sm'>Parent of two</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Footer / Contact ─── */}
			<footer
				className='bg-gradient-to-r from-[#e3f2fd] to-[#ccf2f4] py-20'
				id='contact'
			>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16'>
						{/* Brand */}
						<div>
							<div className='flex items-center gap-2.5'>
								<Icons.heart className='h-7 w-7 text-[#f07e9c]' />
								<span className='font-semibold text-[#1b4b6b] text-lg'>
									Bright Kids <span className='font-normal text-[#3eb6b4]'>Pediatric Care</span>
								</span>
							</div>
							<p className='mt-4 text-[#1b4b6b]/70 text-sm leading-relaxed'>
								Compassionate pediatric care for your family, every step of the way.
							</p>
						</div>

						{/* Contact info */}
						<div>
							<h3 className='mb-4 font-semibold text-[#1b4b6b] text-base'>Contact Us</h3>
							<ul className='space-y-3'>
								<li className='flex items-center gap-3'>
									<Icons.phone className='h-4 w-4 shrink-0 text-[#3eb6b4]' />
									<span className='text-[#1b4b6b]/80 text-sm'>(123) 456-7890</span>
								</li>
								<li className='flex items-center gap-3'>
									<Icons.mail className='h-4 w-4 shrink-0 text-[#3eb6b4]' />
									<span className='text-[#1b4b6b]/80 text-sm'>info@brightkidspediatrics.com</span>
								</li>
								<li className='flex items-center gap-3'>
									<Icons.MapPinIcon className='h-4 w-4 shrink-0 text-[#3eb6b4]' />
									<span className='text-[#1b4b6b]/80 text-sm'>1234 Elm Street, Hometown, USA</span>
								</li>
							</ul>
						</div>

						{/* CTA */}
						<div className='flex items-start lg:justify-end'>
							<div>
								<h3 className='mb-4 font-semibold text-[#1b4b6b] text-base'>Ready to Get Started?</h3>
								<button
									className='rounded-full bg-[#f07e9c] px-7 py-3.5 font-medium text-base text-white shadow-md transition hover:bg-[#e06a88] active:scale-95'
									type='button'
								>
									Request Appointment
								</button>
							</div>
						</div>
					</div>

					<div className='mt-14 border-[#b7d8e0]/50 border-t pt-8 text-center text-[#1b4b6b]/50 text-xs'>
						© {new Date().getFullYear()} Bright Kids Pediatric Care. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
