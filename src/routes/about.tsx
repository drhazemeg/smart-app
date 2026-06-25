// src/routes/about.tsx
import { Icons } from "@/components/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	component: About
});

function About() {
	return (
		<div className='min-h-screen bg-white text-slate-800'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] via-[#d6f0f0] to-[#ccf2f4] py-20 md:py-28'>
				<div className='mx-auto max-w-7xl px-6 text-center'>
					<h1 className='font-bold text-4xl text-[#1b4b6b] md:text-5xl lg:text-6xl'>
						About <span className='text-[#3eb6b4]'>Bright Kids</span>
					</h1>
					<p className='mx-auto mt-4 max-w-2xl text-[#1b4b6b]/80 text-lg md:text-xl'>
						Compassionate, expert pediatric care for every stage of childhood.
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

			{/* Our Story */}
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
						<div>
							<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>Our Story</h2>
							<p className='mt-4 text-[#1b4b6b]/75 text-base leading-relaxed'>
								Bright Kids Pediatric Care was founded with a simple mission: to provide exceptional,
								compassionate healthcare for children in a warm and welcoming environment. Our team of
								board-certified pediatricians and specialists is dedicated to supporting families
								through every stage of childhood development.
							</p>
							<p className='mt-4 text-[#1b4b6b]/75 text-base leading-relaxed'>
								We believe that a child's health journey is a partnership between the family and their
								healthcare provider. We take the time to listen, educate, and empower families to make
								informed decisions about their child's well-being.
							</p>
						</div>
						<div className='overflow-hidden rounded-[2rem] shadow-xl'>
							<img
								alt='Team of doctors and children'
								className='h-[380px] w-full object-cover'
								src='https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Values */}
			<section className='bg-[#f0fbfb] py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<h2 className='mb-12 text-center font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>
						Our Mission &amp; Values
					</h2>
					<div className='grid gap-8 md:grid-cols-3'>
						{[
							{
								icon: <Icons.heart className='h-7 w-7' />,
								title: "Compassion",
								description: "We treat every child and family with empathy, dignity, and genuine care."
							},
							{
								icon: <Icons.badgeCheck className='h-7 w-7' />,
								title: "Excellence",
								description:
									"We are committed to the highest standards of medical care and continuous learning."
							},
							{
								icon: <Icons.users className='h-7 w-7' />,
								title: "Partnership",
								description:
									"We work collaboratively with families to achieve the best health outcomes."
							}
						].map(item => (
							<div
								className='rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition hover:shadow-md'
								key={item.title}
							>
								<div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e0f4f4] text-[#3eb6b4]'>
									{item.icon}
								</div>
								<h3 className='mb-2 font-semibold text-[#1b4b6b] text-xl'>{item.title}</h3>
								<p className='text-slate-500 text-sm leading-relaxed'>{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Meet the Team */}
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='mb-12 text-center'>
						<h2 className='font-bold text-3xl text-[#1b4b6b] lg:text-4xl'>Meet Our Team</h2>
						<p className='mt-3 text-[#1b4b6b]/70 text-lg'>
							Dedicated professionals committed to your child's health.
						</p>
					</div>
					<div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
						{[
							{
								name: "Dr. Jane Morgan",
								role: "Board-Certified Pediatrician",
								img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
							},
							{
								name: "Dr. Alex Rivera",
								role: "Pediatric Specialist",
								img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
							},
							{
								name: "Nurse Emily Chen",
								role: "Lactation Consultant",
								img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
							},
							{
								name: "Dr. Michael Okafor",
								role: "Developmental Pediatrician",
								img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
							}
						].map(member => (
							<div
								className='text-center'
								key={member.name}
							>
								<img
									alt={member.name}
									className='mx-auto h-40 w-40 rounded-full object-cover shadow-md'
									src={member.img}
								/>
								<h3 className='mt-4 font-semibold text-[#1b4b6b]'>{member.name}</h3>
								<p className='text-slate-500 text-sm'>{member.role}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
