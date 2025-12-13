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
		{ href: isAdmin() ? "/admin" : "/", label: "Bảng điều khiển", icon: LayoutDashboard },
		{ href: "/apps", label: "Ứng dụng", icon: Server },
		{ href: "/databases", label: "Cơ sở dữ liệu", icon: Database },
		{ href: "/import", label: "Nhập liệu", icon: Github },
	] : [
		{ href: "/apps", label: "Bảng điều khiển", icon: LayoutDashboard },
	];

	return (
		<nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all duration-300 shadow-elevation-1">
			<div className="container-page flex h-16 items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 group">
					<div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
						<span className="text-primary-foreground font-bold text-sm">ED</span>
					</div>
					<span className="text-lg font-semibold transition-colors group-hover:text-primary">EasyDeploy</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-1 text-sm">
					{isAuthenticated ? (
						<>
							{navLinks.map((link) => {
								const Icon = link.icon;
								return (
									<Link
										key={link.href}
										href={link.href}
										className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground"
									>
										<Icon className="h-4 w-4" />
										<span>{link.label}</span>
									</Link>
								);
							})}
							<div className="flex items-center gap-2 ml-2 pl-2 border-l">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="text-xs text-muted-foreground hidden lg:inline">{user?.email}</span>
							</div>
							<Button 
								variant="outline" 
								size="sm"
								onClick={logout}
								className="ml-2"
							>
								<LogOut className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">Đăng xuất</span>
							</Button>
						</>
					) : (
						<>
							<Link href="/apps" className="px-3 py-2 rounded-lg hover:bg-accent transition-colors">
								Bảng điều khiển
							</Link>
							<Button asChild variant="outline" size="sm" className="ml-2">
								<Link href="/login">Đăng nhập</Link>
							</Button>
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
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Mở menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[300px] sm:w-[400px]">
								<SheetHeader>
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<div className="mt-6 flex flex-col gap-2">
									{navLinks.map((link) => {
										const Icon = link.icon;
										return (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => setMobileMenuOpen(false)}
												className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
											>
												<Icon className="h-5 w-5" />
												<span className="text-sm font-medium">{link.label}</span>
											</Link>
										);
									})}
									<div className="border-t pt-4 mt-4">
										<div className="flex items-center gap-3 px-4 py-3">
											<User className="h-5 w-5 text-muted-foreground" />
											<span className="text-sm text-muted-foreground">{user?.email}</span>
										</div>
										<Button
											variant="outline"
											onClick={() => {
												logout();
												setMobileMenuOpen(false);
											}}
											className="w-full mt-2"
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
		</nav>
	);
}
