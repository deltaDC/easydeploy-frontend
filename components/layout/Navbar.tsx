"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Github, Menu, X, Database, LayoutDashboard, Server } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navLinks = isAuthenticated ? [
		{ href: isAdmin() ? "/admin" : "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/apps", label: "Apps", icon: Server },
		{ href: "/databases", label: "Databases", icon: Database },
		{ href: "/import", label: "Import", icon: Github },
	] : [
		{ href: "/apps", label: "Dashboard", icon: LayoutDashboard },
	];

	return (
		<div className="border-b border-white/10 bg-black/20 backdrop-blur">
			<div className="container-page flex h-14 items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-2">
					<span className="inline-block h-6 w-6 rounded bg-emerald-500" />
					<Link href="/" className="text-sm font-semibold">EasyDeploy</Link>
				</div>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-3 text-sm">
					{isAuthenticated ? (
						<>
							{navLinks.map((link) => {
								const Icon = link.icon;
								return (
									<Link
										key={link.href}
										href={link.href}
										className="hover:text-white flex items-center gap-1.5 transition-colors"
									>
										<Icon className="h-4 w-4" />
										<span>{link.label}</span>
									</Link>
								);
							})}
							<div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
								<User className="h-4 w-4" />
								<span className="text-xs text-gray-400 hidden lg:inline">{user?.email}</span>
							</div>
							<Button 
								variant="outline" 
								size="sm"
								onClick={logout}
								className="border-white/20 hover:bg-white/5"
							>
								<LogOut className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">Đăng xuất</span>
							</Button>
						</>
					) : (
						<>
							<Link href="/apps" className="hover:text-white">Dashboard</Link>
							<Link href="/login" className="rounded border border-white/20 px-3 py-1 hover:bg-white/5">Đăng nhập</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Button */}
				{isAuthenticated && (
					<div className="md:hidden">
						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-white hover:bg-white/10"
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black/95 border-white/10">
								<SheetHeader>
									<SheetTitle className="text-white">Menu</SheetTitle>
								</SheetHeader>
								<div className="mt-6 flex flex-col gap-4">
									{navLinks.map((link) => {
										const Icon = link.icon;
										return (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => setMobileMenuOpen(false)}
												className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white"
											>
												<Icon className="h-5 w-5" />
												<span className="text-sm font-medium">{link.label}</span>
											</Link>
										);
									})}
									<div className="border-t border-white/10 pt-4 mt-4">
										<div className="flex items-center gap-3 px-4 py-3 text-white">
											<User className="h-5 w-5" />
											<span className="text-sm text-gray-400">{user?.email}</span>
										</div>
										<Button
											variant="outline"
											onClick={() => {
												logout();
												setMobileMenuOpen(false);
											}}
											className="w-full mt-2 border-white/20 hover:bg-white/10 text-white"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Đăng xuất
										</Button>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				)}
			</div>
		</div>
	);
}
