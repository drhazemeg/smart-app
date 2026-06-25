import type { ActionId, ActionImpl } from "kbar";
import * as React from "react";

const ResultItem = React.forwardRef(
	(
		{
			action,
			active,
			currentRootActionId
		}: {
			action: ActionImpl;
			active: boolean;
			currentRootActionId: ActionId;
		},
		ref: React.Ref<HTMLDivElement>
	) => {
		const ancestors = React.useMemo(() => {
			if (!currentRootActionId) return action.ancestors;
			const index = action.ancestors.findIndex(ancestor => ancestor.id === currentRootActionId);
			return action.ancestors.slice(index + 1);
		}, [action.ancestors, currentRootActionId]);

		return (
			<div
				className={"relative z-10 flex cursor-pointer items-center justify-between px-4 py-3"}
				ref={ref}
			>
				{active && (
					<div
						className='absolute inset-0 z-[-1]! border-primary border-l-4 bg-accent/50'
						id='kbar-result-item'
					/>
				)}
				<div className='relative z-10 flex items-center gap-2'>
					{action.icon}
					<div className='flex flex-col'>
						<div>
							{ancestors.length > 0 &&
								ancestors.map(ancestor => (
									<React.Fragment key={ancestor.id}>
										<span className='mr-2 text-muted-foreground'>{ancestor.name}</span>
										<span className='mr-2'>&rsaquo;</span>
									</React.Fragment>
								))}
							<span>{action.name}</span>
						</div>
						{action.subtitle && <span className='text-muted-foreground text-sm'>{action.subtitle}</span>}
					</div>
				</div>
				{action.shortcut?.length ? (
					<div className='relative z-10 grid grid-flow-col gap-1'>
						{action.shortcut.map((sc, i) => (
							<kbd
								className='flex h-5 items-center gap-1 rounded-md border bg-muted px-1.5 font-medium text-[10px]'
								key={sc + i}
							>
								{sc}
							</kbd>
						))}
					</div>
				) : null}
			</div>
		);
	}
);

ResultItem.displayName = "KBarResultItem";

export default ResultItem;
