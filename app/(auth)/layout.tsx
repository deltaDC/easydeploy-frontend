import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="border-b bg-white/80 backdrop-blur-sm">
				<div className="container-page py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="flex items-center space-x-2">
							<div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
								<span className="text-white font-bold text-sm">E</span>
							</div>
							<span className="text-xl font-bold text-gray-900">EasyDeploy</span>
						</Link>
						<nav className="hidden md:flex items-center space-x-6">
							<Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
								Trang chủ
							</Link>
						</nav>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1">
				{children}
			</main>

			{/* Footer */}
			<footer className="border-t bg-white/80 backdrop-blur-sm">
				<div className="container-page py-6">
					<div className="text-center text-sm text-gray-600">
						<p>&copy; 2024 EasyDeploy. Tất cả quyền được bảo lưu.</p>
						<div className="mt-2 flex justify-center space-x-4">
							<Link href="/privacy" className="hover:text-gray-900">
								Chính sách bảo mật
							</Link>
							<Link href="/terms" className="hover:text-gray-900">
								Điều khoản sử dụng
							</Link>
							<Link href="/support" className="hover:text-gray-900">
								Hỗ trợ
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
