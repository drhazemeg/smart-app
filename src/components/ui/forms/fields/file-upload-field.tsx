import { useSelector } from "@tanstack/react-store";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { FileUploader } from "@/components/ui/file-uploader";
import {
	createFormField,
	FormField,
	FormFieldError,
	FormFieldSet,
	useFieldContext
} from "@/components/ui/form-context";

interface FileUploadFieldProps {
	description?: string;
	label: string;
	maxFiles?: number;
	maxSize?: number;
	required?: boolean;
}

export function FileUploadField({ label, description, required, maxSize, maxFiles }: FileUploadFieldProps) {
	const field = useFieldContext();
	const value = useSelector(field.store, s => s.value) as File[] | undefined;

	return (
		<FormFieldSet>
			<FormField>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && " *"}
				</FieldLabel>
				<FileUploader
					maxFiles={maxFiles}
					maxSize={maxSize}
					onBlur={field.handleBlur}
					onValueChange={field.handleChange}
					value={value}
				/>
				{description && <FieldDescription>{description}</FieldDescription>}
			</FormField>
			<FormFieldError />
		</FormFieldSet>
	);
}

export const FormFileUploadField = createFormField(FileUploadField);
