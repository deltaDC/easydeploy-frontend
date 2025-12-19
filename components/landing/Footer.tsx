"use client";

import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
	return (
		<footer className="bg-misty-grey/30 space-section-sm">
			<div className="container-page">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
					{/* Brand */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 bg-misty-sage/20 rounded-lg flex items-center justify-center">
								<span className="text-charcoal font-bold text-sm">ED</span>
							</div>
							<span className="font-semibold text-lg text-charcoal">EasyDeploy</span>
						</div>
						<p className="text-body-sm text-charcoal/70 leading-relaxed">
							Triển khai ứng dụng nhanh chóng và dễ dàng với phong cách tinh tế
						</p>
					</div>

					{/* Links */}
					<div>
						<h4 className="font-semibold mb-6 text-charcoal">Sản phẩm</h4>
						<ul className="space-y-3 text-body-sm">
							<li>
								<Link
									href="/apps"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Bảng điều khiển
								</Link>
							</li>
							<li>
								<Link
									href="/apps/new"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Tạo ứng dụng mới
								</Link>
							</li>
							<li>
								<Link
									href="/databases"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Quản lý Database
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-6 text-charcoal">Hỗ trợ</h4>
						<ul className="space-y-3 text-body-sm">
							<li>
								<Link
									href="#"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Tài liệu
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Hướng dẫn
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-charcoal/70 hover:text-charcoal transition-colors"
								>
									Liên hệ
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-6 text-charcoal">Kết nối</h4>
						<div className="flex gap-4">
							<a
								href="#"
								className="h-10 w-10 rounded-xl bg-misty-grey/50 flex items-center justify-center hover:bg-misty-sage/20 hover:text-misty-sage transition-colors text-charcoal/70"
								aria-label="GitHub"
							>
								<Github className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="h-10 w-10 rounded-xl bg-misty-grey/50 flex items-center justify-center hover:bg-misty-sage/20 hover:text-misty-sage transition-colors text-charcoal/70"
								aria-label="Twitter"
							>
								<Twitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="h-10 w-10 rounded-xl bg-misty-grey/50 flex items-center justify-center hover:bg-misty-sage/20 hover:text-misty-sage transition-colors text-charcoal/70"
								aria-label="Email"
							>
								<Mail className="h-5 w-5" />
							</a>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="pt-12 text-center text-body-sm text-charcoal/60">
					<p>&copy; {new Date().getFullYear()} EasyDeploy. Tất cả quyền được bảo lưu.</p>
				</div>
			</div>
		</footer>
	);
}
