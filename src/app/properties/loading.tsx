import React from "react";
import BeautifulLoader from "@/magic/components/BeautifulLoader";

export default function Loading(): React.ReactElement {
	return (
		<main className="bg-white">
			<section className="px-4 py-16">
				<div className="max-w-7xl mx-auto">
					<BeautifulLoader fullscreen label="Зареждане на имоти..." />
				</div>
			</section>
		</main>
	);
}


