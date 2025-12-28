"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
	LogOut, 
	Home, 
	Settings, 
	Activity, 
	Server, 
	Users, 
	BarChart3, 
	Monitor, 
	Database 
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarLinkProps {
	href: string;
	icon: React.ElementType;
	children: ReactNode;
	pathname: string;
}

function SidebarLink({ href, icon: Icon, children, pathname }: SidebarLinkProps) {
	const isActive = (href: string) => {
		if (href === "/admin" || href === "/dashboard") {
			return pathname === "/admin" || pathname === "/dashboard" || pathname === "/";
		}
		return pathname.startsWith(href);
	};
	
	const active = isActive(href);
	
	return (
		<Link href={href}>
			<motion.div
				whileHover={{ x: 4 }}
				className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
					active
						? "bg-white/60 text-charcoal font-medium"
						: "text-charcoal/70 hover:text-charcoal hover:bg-white/20"
				}`}
			>
					{/* Active indicator bar */}
				{active && (
					<motion.div
						layoutId="activeIndicator"
						className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
						initial={false}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
					/>
				)}
				<Icon className="h-5 w-5" strokeWidth={1.5} />
				<span className="text-sm">{children}</span>
			</motion.div>
		</Link>
	);
}

export default function DashboardSidebar() {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const pathname = usePathname();

	const getNavLinks = () => {
		const links: Array<{ href: string; label: string; icon: React.ElementType }> = [
			{ href: isAdmin() ? "/admin" : "/dashboard", label: "Bảng điều khiển", icon: Home },
		];
		
		if (isAdmin()) {
			links.push(
				{ href: "/admin/users", label: "Quản lý người dùng", icon: Users },
				{ href: "/monitoring", label: "Giám sát", icon: Monitor }
			);
		}
		
		links.push(
			{ href: "/apps", label: "Ứng dụng", icon: Server },
			{ href: "/databases", label: "Cơ sở dữ liệu", icon: Database }
		);
		
		if (isAdmin()) {
			links.push({ href: "/admin/stats", label: "Thống kê", icon: BarChart3 });
		}
		
		links.push(
			{ href: "/logs", label: "Nhật ký", icon: Activity },
			{ href: "/settings", label: "Cài đặt", icon: Settings }
		);
		
		return links;
	};

	const navLinks = getNavLinks();
	const userInitials = user?.email?.charAt(0).toUpperCase() || "U";

	return (
		<aside className="fixed left-0 top-0 h-screen w-[260px] sidebar-glass-enhanced z-50 flex flex-col" style={{
			background: 'rgba(255, 255, 255, 0.3)',
			backdropFilter: 'blur(25px)',
			WebkitBackdropFilter: 'blur(25px)',
			borderRight: '1px solid rgba(255, 255, 255, 0.2)'
		}}>
			{/* Logo Section */}
			<div className="px-6 py-6 border-b border-white/18">
				<Link href="/" className="flex items-center gap-2 group">
					<div className="h-8 w-8 bg-misty-sage/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
						<span className="text-charcoal font-bold text-sm">ED</span>
					</div>
					<span className="text-lg font-semibold text-charcoal font-serif">EasyDeploy</span>
				</Link>
			</div>

			{/* Navigation Menu */}
			<nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto scrollbar-misty">
				{navLinks.map((link) => (
					<SidebarLink
						key={link.href}
						href={link.href}
						icon={link.icon}
						pathname={pathname}
					>
						{link.label}
					</SidebarLink>
				))}
			</nav>

			{/* User Profile Section */}
			{isAuthenticated && (
				<div className="px-4 py-4 border-t border-white/18">
					<div className="flex items-center gap-3 mb-3">
						<div className="relative">
							<Avatar className="h-10 w-10 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-white/45">
								<AvatarImage src={user?.avatarUrl} alt={user?.email} />
								<AvatarFallback className="bg-misty-sage/20 text-charcoal font-semibold">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							{/* Enhanced Glow effect */}
							<div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-lg -z-10 animate-pulse" />
							<div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md -z-10" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-charcoal truncate">
								{user?.email || "User"}
							</p>
							<p className="text-xs text-charcoal/60 truncate">
								{isAdmin() ? "Admin" : "Developer"}
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={logout}
						className="w-full justify-start gap-2 text-charcoal/70 hover:text-charcoal hover:bg-white/20"
					>
						<LogOut className="h-4 w-4" strokeWidth={1.5} />
						<span className="text-sm">Đăng xuất</span>
					</Button>
				</div>
			)}
		</aside>
	);
}

