// src/components/dashboard/HeroSection.tsx

import { Link } from "@tanstack/react-router";
import { Calendar, Stethoscope, UserPlus } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
	isLoggedIn: boolean;
}

// Hero section configuration
const HERO_CONFIG = {
	clinicName: "LittleHearts Pediatric Clinic",
	title: "Compassionate Care for",
	titleHighlight: "Every Child",
	subtitle:
		"Providing comprehensive pediatric care from birth to adolescence. Expert doctors, modern facilities, and a caring environment for your child's health."
} as const;

// Stats configuration
const STATS = [
	{ icon: "👶", value: "5000+", label: "Happy Children" },
	{ icon: "👨‍⚕️", value: "15+", label: "Specialists" },
	{ icon: "🕐", value: "24/7", label: "Emergency Care" },
	{ icon: "📈", value: "98%", label: "Satisfaction Rate" }
] as const;

export const HeroSection = memo(function HeroSection({ isLoggedIn }: HeroSectionProps) {
	return (
		<section className='relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-white shadow-xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
			{/* Background decorations */}
			<BackgroundDecorations />

			<div className='relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
				{/* Left content */}
				<HeroContent isLoggedIn={isLoggedIn} />

				{/* Right content - Stats */}
				<StatsCards />
			</div>
		</section>
	);
});

// ============================================================
// Sub-components
// ============================================================

/**
 * Background decorative elements
 */
const BackgroundDecorations = memo(function BackgroundDecorations() {
	return (
		<>
			<div className='absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl' />
			<div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl' />
		</>
	);
});

/**
 * Hero main content with clinic info and CTA buttons
 */
const HeroContent = memo(function HeroContent({ isLoggedIn }: HeroSectionProps) {
	const { clinicName, title, titleHighlight, subtitle } = HERO_CONFIG;

	return (
		<div className='max-w-2xl space-y-5'>
			{/* Clinic badge */}
			<ClinicBadge name={clinicName} />

			{/* Title */}
			<h1 className='font-bold text-4xl leading-tight lg:text-5xl'>
				{title}
				<br />
				<span className='text-primary-foreground'>{titleHighlight}</span>
			</h1>

			{/* Subtitle */}
			<p className='text-lg text-slate-300'>{subtitle}</p>

			{/* CTA Buttons */}
			<CTAButtons isLoggedIn={isLoggedIn} />
		</div>
	);
});

/**
 * Clinic badge with icon
 */
const ClinicBadge = memo(function ClinicBadge({ name }: { name: string }) {
	return (
		<div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm'>
			<div className='rounded-full bg-white/20 p-1.5'>
				<Stethoscope className='h-5 w-5' />
			</div>
			<span className='font-medium text-sm text-white/90'>{name}</span>
		</div>
	);
});

/**
 * Call to Action buttons
 */
const CTAButtons = memo(function CTAButtons({ isLoggedIn }: HeroSectionProps) {
	return (
		<div className='flex flex-wrap gap-3 pt-2'>
			{isLoggedIn ? (
				<Link to='/auth/dashboard/appointments/new'>
					<Button
						className='bg-white text-slate-900 hover:bg-slate-100'
						size='lg'
					>
						<Calendar className='mr-2 h-5 w-5' />
						Book Appointment
					</Button>
				</Link>
			) : (
				<Link
					params={{ path: "sign-in" }}
					to='/auth/$path'
				>
					<Button
						className='bg-white text-slate-900 hover:bg-slate-100'
						size='lg'
					>
						<UserPlus className='mr-2 h-5 w-5' />
						Register Your Child
					</Button>
				</Link>
			)}
			<Link to='/auth/dashboard/services'>
				<Button
					className='border-white text-white hover:bg-white/20'
					size='lg'
					variant='outline'
				>
					Our Services
				</Button>
			</Link>
		</div>
	);
});

/**
 * Stats cards grid
 */
const StatsCards = memo(function StatsCards() {
	return (
		<div className='grid min-w-50 grid-cols-2 gap-3'>
			{STATS.map((stat, index) => (
				<StatCard
					key={index}
					{...stat}
				/>
			))}
		</div>
	);
});

/**
 * Individual stat card
 */
const StatCard = memo(function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
	return (
		<div className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm transition-transform hover:scale-105'>
			<div className='text-2xl'>{icon}</div>
			<p className='mt-2 font-bold text-2xl'>{value}</p>
			<p className='text-slate-300 text-xs'>{label}</p>
		</div>
	);
});
