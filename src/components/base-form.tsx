// src/components/base-form.tsx
// Simple wrapper around useAppForm for common form patterns.

import type { ReactNode } from "react";
import { useAppForm } from "./ui/tanstack-form";

// biome-ignore lint/suspicious/noExplicitAny: intentionally generic form wrapper
type AnySchema = any;

export type AppFormInstance = ReturnType<typeof useAppForm>;

export interface BaseFormProps {
	// biome-ignore lint/suspicious/noExplicitAny: generic default values
	defaultValues: Record<string, any>;
	schema?: AnySchema;
	// biome-ignore lint/suspicious/noExplicitAny: generic submit handler
	onSubmit: (data: any) => void | Promise<void>;
	children: (form: AppFormInstance) => ReactNode;
}

export function BaseForm({ defaultValues, schema, onSubmit, children }: BaseFormProps) {
	const form = useAppForm({
		defaultValues,
		validators: schema ? { onSubmit: schema } : undefined,
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		}
	});

	return <form.AppForm>{children(form as AppFormInstance)}</form.AppForm>;
}

export type ObjectFormProps = BaseFormProps;

export function ObjectForm(props: ObjectFormProps) {
	return <BaseForm {...props} />;
}
