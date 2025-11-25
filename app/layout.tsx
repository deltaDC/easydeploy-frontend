import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
	title: "EasyDeploy",
	description: "Deploy web apps from GitHub or Docker with ease",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<body className="min-h-svh antialiased" suppressHydrationWarning>
				<AuthProvider>
					{children}
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
