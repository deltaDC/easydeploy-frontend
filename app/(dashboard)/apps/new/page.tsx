"use client";

import { Suspense } from "react";
import NewAppWithRepoSelection from "@/components/github/NewAppWithRepoSelection";

function NewAppContent() {
	return <NewAppWithRepoSelection />;
}

export default function NewAppPage() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>}>
			<NewAppContent />
		</Suspense>
	);
}
