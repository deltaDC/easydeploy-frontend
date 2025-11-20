"use client";
import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Settings, Activity, Server, Menu, X, Users, BarChart3, Monitor, Database, ChevronRight as BreadcrumbChevron, ChevronLeft, ChevronRight } from "lucide-react";

function NavLink({ 
	href, 
	icon: Icon, 
	children, 
	mobile = false,
	pathname,
	onMobileMenuClose
}: { 
	href: string; 
	icon: React.ElementType; 
	children: ReactNode;
	mobile?: boolean;
	pathname: string;
	onMobileMenuClose?: () => void;
}) {
	const isActive = (href: string) => {
		if (href === "/admin" || href === "/dashboard") {
			return pathname === "/admin" || pathname === "/dashboard" || pathname === "/";
		}
		return pathname.startsWith(href);
	};
	
	const active = isActive(href);
	
	return (
		<Link 
			href={href} 
			className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
				active 
					? "bg-blue-50 text-blue-700 font-medium border border-blue-200 shadow-sm dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
					: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
			}`}
			onClick={() => {
				if (mobile && onMobileMenuClose) {
					onMobileMenuClose();
				}
			}}
		>
			<Icon className={`h-4 w-4 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
			{children}
		</Link>
	);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	const getNavLinks = () => {
		const links: Array<{ href: string; label: string; icon: React.ElementType }> = [
			{ href: isAdmin() ? "/admin" : "/dashboard", label: "Dashboard", icon: Home },
		];
		
		if (isAdmin()) {
			links.push(
				{ href: "/admin/users", label: "Quản lý User", icon: Users },
				{ href: "/monitoring", label: "Monitoring", icon: Monitor }
			);
		}
		
		links.push(
			{ href: "/apps", label: "Ứng dụng", icon: Server },
			{ href: "/databases", label: "Databases", icon: Database }
		);
		
		if (isAdmin()) {
			links.push({ href: "/admin/stats", label: "Thống kê", icon: BarChart3 });
		}
		
		links.push(
			{ href: "/logs", label: "Logs", icon: Activity },
			{ href: "/settings", label: "Cài đặt", icon: Settings }
		);
		
		return links;
	};

	const getOrderedNavLinks = () => {
		const links = getNavLinks();
		const isActive = (href: string) => {
			if (href === "/admin" || href === "/dashboard") {
				return pathname === "/admin" || pathname === "/dashboard" || pathname === "/";
			}
			return pathname.startsWith(href);
		};

		const activeIndex = links.findIndex(link => isActive(link.href));
		
		if (activeIndex === -1) {
			return links;
		}

		const activeLink = links[activeIndex];
		const beforeActive = links.slice(0, activeIndex);
		const afterActive = links.slice(activeIndex + 1);
		
		return [activeLink, ...afterActive, ...beforeActive];
	};

	const checkScrollButtons = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		setCanScrollLeft(container.scrollLeft > 0);
		setCanScrollRight(
			container.scrollLeft < container.scrollWidth - container.clientWidth - 1
		);
	};

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			setTimeout(() => {
				container.scrollTo({
					left: 0,
					behavior: "smooth",
				});
				checkScrollButtons();
			}, 100);
		}
	}, [pathname]);

	useEffect(() => {
		checkScrollButtons();
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", checkScrollButtons);
			window.addEventListener("resize", checkScrollButtons);
			return () => {
				container.removeEventListener("scroll", checkScrollButtons);
				window.removeEventListener("resize", checkScrollButtons);
			};
		}
	}, []);

	const scroll = (direction: "left" | "right") => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const scrollAmount = 200;
		const newScrollLeft =
			direction === "left"
				? container.scrollLeft - scrollAmount
				: container.scrollLeft + scrollAmount;

		container.scrollTo({
			left: newScrollLeft,
			behavior: "smooth",
		});
	};

	const generateBreadcrumbs = () => {
		const breadcrumbs: Array<{ href: string; label: string }> = [];
		const navLinks = getNavLinks();
		
		breadcrumbs.push({ href: isAdmin() ? "/admin" : "/dashboard", label: "Dashboard" });
		
		const pathSegments = pathname.split("/").filter(Boolean);
		
		if (pathname.startsWith("/admin/stats")) {
			breadcrumbs.push({ href: "/admin/stats", label: "Thống kê" });
		} else if (pathname.startsWith("/admin/users")) {
			breadcrumbs.push({ href: "/admin/users", label: "Quản lý User" });
		} else if (pathname.startsWith("/monitoring")) {
			breadcrumbs.push({ href: "/monitoring", label: "Monitoring" });
		} else if (pathname.startsWith("/apps")) {
			breadcrumbs.push({ href: "/apps", label: "Ứng dụng" });
			if (pathSegments.length > 1 && pathSegments[1] !== "new") {
				breadcrumbs.push({ href: pathname, label: pathSegments[1] });
			}
		} else if (pathname.startsWith("/databases")) {
			breadcrumbs.push({ href: "/databases", label: "Databases" });
			if (pathSegments.length > 1) {
				if (pathSegments[1] === "new") {
					breadcrumbs.push({ href: "/databases/new", label: "Triển khai Cơ sở dữ liệu mới" });
				} else {
					breadcrumbs.push({ href: pathname, label: pathSegments[1] });
				}
			}
		} else if (pathname.startsWith("/logs")) {
			breadcrumbs.push({ href: "/logs", label: "Logs" });
		} else if (pathname.startsWith("/settings")) {
			breadcrumbs.push({ href: "/settings", label: "Cài đặt" });
		} else if (pathname.startsWith("/profile")) {
			breadcrumbs.push({ href: "/profile", label: "Hồ sơ" });
		}
		
		return breadcrumbs;
	};


	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navbar */}
			<nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
				<div className="container-page">
					<div className="flex h-16 items-center justify-between">
						{/* Logo - Fixed */}
						<div className="flex items-center gap-2 flex-shrink-0">
							<span className="inline-block h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
								<span className="text-white font-bold text-sm">E</span>
							</span>
							<Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">EasyDeploy</Link>
						</div>

					{/* Desktop Navigation Links - Scrollable with Active First */}
					<div className="hidden md:flex items-center flex-1 justify-center mx-4" style={{ width: '600px' }}>
						<div className="relative w-full flex items-center gap-2">
							{/* Left Scroll Button */}
							{canScrollLeft && (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 flex-shrink-0"
									onClick={() => scroll("left")}
									aria-label="Scroll left"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
							)}
							
							{/* Scrollable Container */}
							<div
								ref={scrollContainerRef}
								className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
								style={{
									scrollbarWidth: 'none',
									msOverflowStyle: 'none',
									WebkitOverflowScrolling: 'touch',
								}}
								role="navigation"
								aria-label="Main navigation"
							>
								{getOrderedNavLinks().map((link) => (
									<NavLink
										key={link.href}
										href={link.href}
										icon={link.icon}
										pathname={pathname}
									>
										{link.label}
									</NavLink>
								))}
							</div>

							{/* Right Scroll Button */}
							{canScrollRight && (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 flex-shrink-0"
									onClick={() => scroll("right")}
									aria-label="Scroll right"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

						{/* Desktop User Menu - Fixed */}
						<div className="hidden md:flex items-center gap-3 flex-shrink-0">
							{isAuthenticated ? (
								<>
									<Link href="/profile">
										<Button 
											variant="ghost" 
											size="sm"
											className="flex items-center gap-2"
										>
											<User className="h-4 w-4" />
											<span className="max-w-[150px] truncate">{user?.email || "User"}</span>
										</Button>
									</Link>
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
					<div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-900">
						<div className="space-y-2">
							<NavLink href={isAdmin() ? "/admin" : "/dashboard"} icon={Home} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
								Dashboard
							</NavLink>
							{isAdmin() && (
								<>
									<NavLink href="/admin/users" icon={Users} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
										Quản lý User
									</NavLink>
									<NavLink href="/monitoring" icon={Monitor} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
										Monitoring
									</NavLink>
								</>
							)}
							<NavLink href="/apps" icon={Server} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
								Ứng dụng
							</NavLink>
							<NavLink href="/databases" icon={Database} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
								Databases
							</NavLink>
							{isAdmin() && (
								<NavLink href="/admin/stats" icon={BarChart3} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
									Thống kê
								</NavLink>
							)}
							<NavLink href="/logs" icon={Activity} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
								Logs
							</NavLink>
							<NavLink href="/settings" icon={Settings} mobile pathname={pathname} onMobileMenuClose={() => setIsMobileMenuOpen(false)}>
								Cài đặt
							</NavLink>
								
								{isAuthenticated ? (
									<div className="pt-4 border-t border-gray-200">
										<div className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2">
											<User className="h-4 w-4" />
											<span>{user?.email}</span>
										</div>
										<Link 
											href="/profile" 
											className="block w-full mt-2"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											<Button 
												variant="ghost" 
												size="sm"
												className="w-full flex items-center gap-2"
											>
												<User className="h-4 w-4" />
												Profile
											</Button>
										</Link>
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

			{/* Breadcrumbs */}
			{pathname !== "/" && pathname !== "/admin" && pathname !== "/dashboard" && (
				<div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
					<div className="container-page py-3">
						<nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
							{generateBreadcrumbs().map((crumb, index, array) => (
								<div key={crumb.href} className="flex items-center gap-2">
									{index > 0 && (
										<BreadcrumbChevron className="h-4 w-4 text-gray-400" />
									)}
									{index === array.length - 1 ? (
										<span className="text-gray-900 dark:text-gray-100 font-medium">
											{crumb.label}
										</span>
									) : (
										<Link 
											href={crumb.href}
											className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
										>
											{crumb.label}
										</Link>
									)}
								</div>
							))}
						</nav>
					</div>
				</div>
			)}

			{/* Main Content */}
			<main className="py-6">
				<div className="container-page">
					{children}
				</div>
			</main>
		</div>
	);
}
