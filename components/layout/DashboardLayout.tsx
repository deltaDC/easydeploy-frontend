"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Settings, Activity, Server, Menu, X, Users } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navbar */}
			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="container-page">
					<div className="flex h-16 items-center justify-between">
						{/* Logo */}
						<div className="flex items-center gap-2">
							<span className="inline-block h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
								<span className="text-white font-bold text-sm">E</span>
							</span>
							<Link href="/" className="text-lg font-semibold text-gray-900">EasyDeploy</Link>
						</div>

						{/* Desktop Navigation Links */}
						<div className="hidden md:flex items-center gap-6">
							<Link 
								href={isAdmin() ? "/admin" : "/profile"} 
								className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
							>
								<Home className="h-4 w-4" />
								Dashboard
							</Link>
							{isAdmin() && (
								<Link 
									href="/admin/users" 
									className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
								>
									<Users className="h-4 w-4" />
									Quản lý User
								</Link>
							)}
							<Link 
								href="/apps" 
								className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
							>
								<Server className="h-4 w-4" />
								Ứng dụng
							</Link>
							<Link 
								href="/logs" 
								className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
							>
								<Activity className="h-4 w-4" />
								Logs
							</Link>
							<Link 
								href="/settings" 
								className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
							>
								<Settings className="h-4 w-4" />
								Cài đặt
							</Link>
						</div>						{/* Desktop User Menu */}
						<div className="hidden md:flex items-center gap-3">
							{isAuthenticated ? (
								<>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<User className="h-4 w-4" />
										<span>{user?.email}</span>
									</div>
									<Button 
										variant="outline" 
										size="sm"
										onClick={logout}
										className="flex items-center gap-2"
									>
										<LogOut className="h-4 w-4" />
										Đăng xuất
									</Button>
								</>
							) : (
								<Link 
									href="/login" 
									className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Đăng nhập
								</Link>
							)}
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							>
								{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</Button>
						</div>
					</div>

					{/* Mobile Menu */}
					{isMobileMenuOpen && (
						<div className="md:hidden border-t border-gray-200 py-4">
							<div className="space-y-2">
								<Link 
									href={isAdmin() ? "/admin" : "/profile"} 
									className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Home className="h-4 w-4" />
									Dashboard
								</Link>
								{isAdmin() && (
									<Link 
										href="/admin/users" 
										className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Users className="h-4 w-4" />
										Quản lý User
									</Link>
								)}
								<Link 
									href="/apps" 
									className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Server className="h-4 w-4" />
									Ứng dụng
								</Link>
								<Link 
									href="/logs" 
									className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Activity className="h-4 w-4" />
									Logs
								</Link>
								<Link 
									href="/settings" 
									className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Settings className="h-4 w-4" />
									Cài đặt
								</Link>
								
								{isAuthenticated ? (
									<div className="pt-4 border-t border-gray-200">
										<div className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2">
											<User className="h-4 w-4" />
											<span>{user?.email}</span>
										</div>
										<Button 
											variant="outline" 
											size="sm"
											onClick={() => {
												logout();
												setIsMobileMenuOpen(false);
											}}
											className="w-full mt-2 flex items-center gap-2"
										>
											<LogOut className="h-4 w-4" />
											Đăng xuất
										</Button>
									</div>
								) : (
									<Link 
										href="/login" 
										className="block w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center mt-4"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										Đăng nhập
									</Link>
								)}
							</div>
						</div>
					)}
				</div>
			</nav>

			{/* Main Content */}
			<main className="py-6">
				<div className="container-page">
					{children}
				</div>
			</main>
		</div>
	);
}
