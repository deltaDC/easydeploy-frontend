import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "EasyDeploy",
	description: "Deploy web apps from GitHub or Docker with ease",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<body className="min-h-svh antialiased" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
