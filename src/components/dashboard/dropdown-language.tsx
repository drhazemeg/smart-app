"use client";

import type { Variants } from "framer-motion"; // 1. Import the type
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, GlobeIcon, LanguagesIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

type Props = {
	trigger?: ReactNode;
	defaultOpen?: boolean;
	align?: "start" | "center" | "end";
	onLanguageChange?: (language: Language, direction: Direction) => void;
	defaultLanguage?: Language;
	className?: string;
};

const LANGUAGE_CONFIG = {
	en: {
		label: "English",
		nativeLabel: "English",
		flag: "🇺🇸",
		direction: "ltr" as Direction,
		locale: "en-US"
	},
	ar: {
		label: "Arabic",
		nativeLabel: "العربية",
		flag: "🇸🇦",
		direction: "rtl" as Direction,
		locale: "ar-SA"
	}
};

const LanguageDropdown = ({
	trigger,
	defaultOpen,
	align = "end",
	onLanguageChange,
	defaultLanguage = "en",
	className
}: Props) => {
	const [language, setLanguage] = useState<Language>(defaultLanguage);
	const [direction, setDirection] = useState<Direction>("ltr");

	// Handle language change
	const handleLanguageChange = (value: string) => {
		const newLanguage = value as Language;
		if (newLanguage === language) return;

		const newDirection = LANGUAGE_CONFIG[newLanguage].direction;

		setDirection(newDirection);
		setLanguage(newLanguage);

		// Apply RTL/LTR to document
		document.documentElement.dir = newDirection;
		document.documentElement.lang = newLanguage;
		document.documentElement.setAttribute("dir", newDirection);
		document.documentElement.setAttribute("lang", newLanguage);

		// Update body class for RTL support
		if (newDirection === "rtl") {
			document.body.classList.add("rtl");
			document.body.classList.remove("ltr");
		} else {
			document.body.classList.add("ltr");
			document.body.classList.remove("rtl");
		}

		// Callback with new language and direction
		onLanguageChange?.(newLanguage, newDirection);

		// Save preference
		try {
			localStorage.setItem("preferred-language", newLanguage);
			localStorage.setItem("preferred-direction", newDirection);
		} catch (_error) {
			// Ignore localStorage errors
		}
	};

	// Load saved preference on mount
	useEffect(() => {
		try {
			const savedLanguage = localStorage.getItem("preferred-language") as Language | null;
			const savedDirection = localStorage.getItem("preferred-direction") as Direction | null;

			if (savedLanguage && LANGUAGE_CONFIG[savedLanguage]) {
				setLanguage(savedLanguage);
				setDirection(savedDirection || LANGUAGE_CONFIG[savedLanguage].direction);
			}
		} catch (_error) {
			// Ignore localStorage errors
		}
	}, []);

	const currentConfig = LANGUAGE_CONFIG[language];
	const currentLabel = currentConfig.label;
	const currentFlag = currentConfig.flag;

	const dropdownVariants: Variants = {
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
				ease: [0.22, 1, 0.36, 1] // TypeScript can now validate this correctly against the Variants signature
			}
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: -10,
			transition: { duration: 0.12 }
		}
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, x: -10 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: i * 0.04,
				duration: 0.15,
				ease: "easeOut"
			}
		})
	};

	return (
		<DropdownMenu defaultOpen={defaultOpen}>
			<DropdownMenuTrigger asChild>
				{trigger || (
					<button
						aria-label='Change language'
						className={cn(
							"flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-all",
							"hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
							"border border-transparent hover:border-primary/20",
							className
						)}
						type='button'
					>
						<GlobeIcon className='size-4' />
						<span className='hidden sm:inline'>{currentLabel}</span>
						<span className='text-sm'>{currentFlag}</span>
					</button>
				)}
			</DropdownMenuTrigger>

			<AnimatePresence>
				<DropdownMenuContent
					align={align}
					className='min-w-[200px] overflow-hidden p-1.5'
					forceMount
				>
					<motion.div
						animate='visible'
						className='space-y-0.5'
						exit='exit'
						initial='hidden'
						variants={dropdownVariants}
					>
						{/* Header */}
						<div className='flex items-center gap-2 border-b px-2 py-1.5'>
							<LanguagesIcon className='size-3.5 text-muted-foreground' />
							<span className='font-medium text-muted-foreground text-xs'>Select Language</span>
						</div>

						<DropdownMenuRadioGroup
							onValueChange={handleLanguageChange}
							value={language}
						>
							{Object.entries(LANGUAGE_CONFIG).map(([key, config], index) => {
								const isSelected = key === language;
								const lang = key as Language;

								return (
									<motion.div
										animate='visible'
										custom={index}
										initial='hidden'
										key={key}
										variants={itemVariants}
									>
										<DropdownMenuRadioItem
											className={cn(
												"group relative flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5",
												"transition-all duration-200",
												"hover:bg-primary/10 hover:text-primary",
												isSelected && "bg-primary/10 font-medium text-primary"
											)}
											value={lang}
										>
											<div className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-lg transition-all group-hover:scale-110'>
												{config.flag}
											</div>
											<div className='flex flex-1 flex-col'>
												<span className='text-sm'>{config.label}</span>
												<span className='text-muted-foreground text-xs'>
													{config.nativeLabel}
												</span>
											</div>
											{isSelected && (
												<motion.div
													animate={{ scale: 1 }}
													className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
													initial={{ scale: 0 }}
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 20
													}}
												>
													<CheckIcon className='size-3' />
												</motion.div>
											)}
										</DropdownMenuRadioItem>
									</motion.div>
								);
							})}
						</DropdownMenuRadioGroup>

						{/* Footer with direction indicator */}
						<motion.div
							animate={{ opacity: 1 }}
							className='mt-1 flex items-center justify-between border-t px-2 pt-1.5'
							initial={{ opacity: 0 }}
							transition={{ delay: 0.2 }}
						>
							<span className='text-[10px] text-muted-foreground'>
								Direction: {direction.toUpperCase()}
							</span>
							<span className='flex items-center gap-1 text-[10px] text-muted-foreground'>
								<span
									className={cn(
										"inline-block h-1.5 w-1.5 rounded-full",
										direction === "rtl" ? "bg-blue-500" : "bg-emerald-500"
									)}
								/>
								{direction === "rtl" ? "RTL" : "LTR"}
							</span>
						</motion.div>
					</motion.div>
				</DropdownMenuContent>
			</AnimatePresence>
		</DropdownMenu>
	);
};

export default LanguageDropdown;

// Custom hook for language management
export const useLanguage = () => {
	const [language, setLanguage] = useState<Language>("en");
	const [direction, setDirection] = useState<Direction>("ltr");

	const changeLanguage = useCallback((lang: Language) => {
		const config = LANGUAGE_CONFIG[lang];
		setLanguage(lang);
		setDirection(config.direction);

		// Apply to document
		document.documentElement.dir = config.direction;
		document.documentElement.lang = lang;
		document.documentElement.setAttribute("dir", config.direction);
		document.documentElement.setAttribute("lang", lang);

		// Update body
		document.body.classList.remove("rtl", "ltr");
		document.body.classList.add(config.direction);

		// Save preference
		try {
			localStorage.setItem("preferred-language", lang);
			localStorage.setItem("preferred-direction", config.direction);
		} catch (_error) {
			// Ignore
		}
	}, []);

	// Load saved preference
	useEffect(() => {
		try {
			const savedLanguage = localStorage.getItem("preferred-language") as Language | null;
			if (savedLanguage && LANGUAGE_CONFIG[savedLanguage]) {
				changeLanguage(savedLanguage);
			}
		} catch (_error) {
			// Ignore
		}
	}, [changeLanguage]);

	return {
		language,
		direction,
		changeLanguage,
		config: LANGUAGE_CONFIG[language],
		isRTL: direction === "rtl",
		isLTR: direction === "ltr"
	};
};
