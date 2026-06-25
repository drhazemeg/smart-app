// components/ui/fields/color-field.tsx

import { useSelector } from "@tanstack/react-store";
import { useState } from "react";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { createFormField, FormField, FormFieldError, FormFieldSet, useFieldContext } from "../form-context";

// ============================================================
// Types
// ============================================================

interface ColorFieldProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur"> {
	label: string;
	description?: string;
	required?: boolean;
	showPreview?: boolean;
	previewSize?: "sm" | "md" | "lg";
	presetColors?: string[];
	showPresets?: boolean;
}

// ============================================================
// Constants
// ============================================================

const PRESET_COLORS = [
	"#3b82f6", // Blue
	"#22c55e", // Green
	"#8b5cf6", // Purple
	"#f59e0b", // Amber
	"#ef4444", // Red
	"#ec4899", // Pink
	"#06b6d4", // Cyan
	"#f97316", // Orange
	"#14b8a6", // Teal
	"#6366f1", // Indigo
	"#a855f7", // Violet
	"#f43f5e", // Rose
	"#0ea5e9", // Sky
	"#84cc16", // Lime
	"#d946ef", // Fuchsia
	"#8b5cf6" // Violet
];

const PREVIEW_SIZE_CLASSES = {
	sm: "h-6 w-6",
	md: "h-8 w-8",
	lg: "h-10 w-10"
};

// ============================================================
// Sub-Components
// ============================================================

const ColorPreview = ({ color, size = "md" }: { color: string; size?: "sm" | "md" | "lg" }) => (
	<div
		className={cn("shrink-0 rounded-md border border-input shadow-sm transition-all", PREVIEW_SIZE_CLASSES[size])}
		style={{ backgroundColor: color || "#ffffff" }}
	/>
);

const ColorPreset = ({ color, isSelected, onClick }: { color: string; isSelected: boolean; onClick: () => void }) => (
	<button
		className={cn(
			"h-6 w-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
			isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"
		)}
		onClick={onClick}
		style={{ backgroundColor: color }}
		type='button'
	/>
);

// ============================================================
// Main Component
// ============================================================

export function ColorField({
	label,
	description,
	required,
	className,
	showPreview = true,
	previewSize = "md",
	presetColors = PRESET_COLORS,
	showPresets = true,
	...inputProps
}: ColorFieldProps) {
	const field = useFieldContext();
	const isTouched = useSelector(field.store, s => s.meta.isTouched);
	const isValid = useSelector(field.store, s => s.meta.isValid);
	const isValidating = useSelector(field.store, s => s.meta.isValidating);
	const value = useSelector(field.store, s => s.value) as string;

	const [_isPresetsOpen, _setIsPresetsOpen] = useState(false);

	const handleChange = (newValue: string) => {
		field.handleChange(newValue);
		field.handleBlur();
	};

	const isValidHexColor = (color: string) => {
		return /^#[0-9A-F]{6}$/i.test(color);
	};

	const displayColor = value && isValidHexColor(value) ? value : "#ffffff";

	return (
		<FormFieldSet>
			<FormField>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && " *"}
				</FieldLabel>

				<div className='space-y-3'>
					{/* Color Input with Preview */}
					<div className='relative flex items-center gap-3'>
						{showPreview && (
							<ColorPreview
								color={displayColor}
								size={previewSize}
							/>
						)}

						<div className='relative flex-1'>
							<Input
								aria-invalid={isTouched && !isValid}
								className={cn("font-mono", className, showPreview && "pl-10")}
								id={field.name}
								onBlur={field.handleBlur}
								onChange={e => {
									const value = e.target.value;
									// Auto-add # if missing and valid hex
									if (/^[0-9A-F]{6}$/i.test(value)) {
										handleChange(`#${value.toUpperCase()}`);
									} else if (/^#[0-9A-F]{6}$/i.test(value)) {
										handleChange(value.toUpperCase());
									} else {
										handleChange(value);
									}
								}}
								placeholder='#000000'
								type='text'
								value={value ?? ""}
								{...inputProps}
							/>

							{/* Color Picker Input (native) */}
							<input
								className='absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2 cursor-pointer rounded border-0 p-0 opacity-0'
								onChange={e => handleChange(e.target.value)}
								type='color'
								value={displayColor}
							/>

							{/* Native color picker icon overlay */}
							<div
								className='absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2 cursor-pointer rounded border border-input bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-800'
								onClick={() => {
									const input = document.querySelector(
										`input[type="color"][id="${field.name}-picker"]`
									);
									if (input) {
										(input as HTMLInputElement).click();
									}
								}}
								style={{ backgroundColor: displayColor }}
							/>

							{isValidating && (
								<div className='absolute top-1/2 right-3 -translate-y-1/2'>
									<Spinner className='h-4 w-4' />
								</div>
							)}
						</div>
					</div>

					{/* Preset Colors */}
					{showPresets && presetColors.length > 0 && (
						<div className='flex flex-wrap items-center gap-1.5 pt-1'>
							<span className='text-muted-foreground text-xs'>Presets:</span>
							{presetColors.map(color => (
								<ColorPreset
									color={color}
									isSelected={value === color}
									key={color}
									onClick={() => handleChange(color)}
								/>
							))}
						</div>
					)}

					{description && <FieldDescription>{description}</FieldDescription>}
				</div>
			</FormField>
			<FormFieldError />
		</FormFieldSet>
	);
}

// ============================================================
// Exports
// ============================================================

export const FormColorField = createFormField(ColorField);
export default FormColorField;
