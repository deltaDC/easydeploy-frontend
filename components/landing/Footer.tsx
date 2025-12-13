"use client";

import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t bg-muted/30 space-section-sm">
			<div className="container-page">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-sm">ED</span>
							</div>
							<span className="font-semibold text-lg">EasyDeploy</span>
						</div>
						<p className="text-body-sm text-muted-foreground">
							Triển khai ứng dụng nhanh chóng và dễ dàng
						</p>
					</div>

					{/* Links */}
					<div>
						<h4 className="font-semibold mb-4">Sản phẩm</h4>
						<ul className="space-y-2 text-body-sm">
							<li>
								<Link href="/apps" className="text-muted-foreground hover:text-foreground transition-colors">
									Bảng điều khiển
								</Link>
							</li>
							<li>
								<Link href="/apps/new" className="text-muted-foreground hover:text-foreground transition-colors">
									Tạo ứng dụng mới
								</Link>
							</li>
							<li>
								<Link href="/databases" className="text-muted-foreground hover:text-foreground transition-colors">
									Quản lý Database
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Hỗ trợ</h4>
						<ul className="space-y-2 text-body-sm">
							<li>
								<Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
									Tài liệu
								</Link>
							</li>
							<li>
								<Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
									Hướng dẫn
								</Link>
							</li>
							<li>
								<Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
									Liên hệ
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Kết nối</h4>
						<div className="flex gap-4">
							<a
								href="#"
								className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
								aria-label="GitHub"
							>
								<Github className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
								aria-label="Twitter"
							>
								<Twitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
								aria-label="Email"
							>
								<Mail className="h-5 w-5" />
							</a>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="pt-8 border-t text-center text-body-sm text-muted-foreground">
					<p>&copy; {new Date().getFullYear()} EasyDeploy. Tất cả quyền được bảo lưu.</p>
				</div>
			</div>
		</footer>
	);
}
