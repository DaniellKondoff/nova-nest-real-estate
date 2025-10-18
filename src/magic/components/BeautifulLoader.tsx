import React from "react";

interface BeautifulLoaderProps {
	label?: string;
	fullscreen?: boolean;
}

export default function BeautifulLoader(props: BeautifulLoaderProps): React.ReactElement {
	const { label = "Зареждане...", fullscreen = false } = props;

	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={label}
			className={
				fullscreen
					? "min-h-[60vh] grid place-items-center"
					: "flex items-center justify-center"
			}
		>
			<div className="relative flex flex-col items-center gap-6">
				{/* Glow */}
				<div className="pointer-events-none absolute -inset-6 rounded-full bg-[#d4af37]/20 blur-2xl" />

				{/* Spinner */}
				<div className="relative h-16 w-16">
					{/* Base ring */}
					<div className="absolute inset-0 rounded-full border-4 border-[#1a2642]/10" />
					{/* Animated arc */}
					<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#d4af37] animate-spin [animation-duration:900ms]" />
					{/* Inner soft core */}
					<div className="absolute inset-2 rounded-full bg-white/70 backdrop-blur-sm" />
				</div>

				{/* Label */}
				<div className="text-sm text-[#1a2642]/70">
					{label}
				</div>
			</div>
		</div>
	);
}


