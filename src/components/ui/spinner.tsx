import { Loader2 } from "lucide-react";
import { cn } from "#/lib/utils.ts";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
	return (
		<Loader2
			aria-label='Loading'
			className={cn("size-4 animate-spin", className)}
			data-slot='spinner'
			role='status'
			strokeWidth={2}
			{...props}
		/>
	);
}

export { Spinner };
