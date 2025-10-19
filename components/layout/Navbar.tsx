"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
	const { user, isAuthenticated, logout, isAdmin } = useAuth();

	return (
		<div className="border-b border-white/10 bg-black/20 backdrop-blur">
			<div className="container-page flex h-14 items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="inline-block h-6 w-6 rounded bg-emerald-500" />
					<Link href="/" className="text-sm font-semibold">EasyDeploy</Link>
				</div>
				<div className="flex items-center gap-3 text-sm">
					{isAuthenticated ? (
						<>
							<Link href={isAdmin() ? "/admin" : "/profile"} className="hover:text-white">
								Dashboard
							</Link>
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<span className="text-xs text-gray-400">{user?.email}</span>
							</div>
							<Button 
								variant="outline" 
								size="sm"
								onClick={logout}
								className="border-white/20 hover:bg-white/5"
							>
								<LogOut className="h-4 w-4 mr-2" />
								Đăng xuất
							</Button>
						</>
					) : (
						<>
							<Link href="/apps" className="hover:text-white">Dashboard</Link>
							<Link href="/login" className="rounded border border-white/20 px-3 py-1 hover:bg-white/5">Đăng nhập</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
