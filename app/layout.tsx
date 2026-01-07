import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";

const inter = Inter({ 
	subsets: ["latin", "vietnamese"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "EasyDeploy",
	description: "Triển khai ứng dụng web từ GitHub hoặc Docker một cách dễ dàng",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning className={inter.variable}>
			<body className={`min-h-svh antialiased ${inter.className}`} suppressHydrationWarning>
				<AuthProvider>
					{children}
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
