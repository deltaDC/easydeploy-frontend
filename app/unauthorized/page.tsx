import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
						<Shield className="h-8 w-8 text-red-600" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">Truy cập bị từ chối</h1>
					<p className="mt-2 text-sm text-gray-600">
						Bạn không có quyền truy cập vào trang này
					</p>
				</div>

				<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="text-center pb-6">
						<CardTitle className="text-xl font-semibold text-red-600">403 - Forbidden</CardTitle>
						<CardDescription>
							Trang này chỉ dành cho quản trị viên hoặc người dùng có quyền phù hợp
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<Alert className="border-red-200 bg-red-50">
							<Shield className="h-4 w-4 text-red-600" />
							<AlertDescription className="text-red-800">
								Bạn cần có quyền phù hợp để truy cập trang này. 
								Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
							</AlertDescription>
						</Alert>

						<div className="space-y-3">
							<Button asChild className="w-full gap-2">
								<Link href="/">
									<Home className="h-4 w-4" />
									Về trang chủ
								</Link>
							</Button>
							
							<Button variant="outline" asChild className="w-full gap-2">
								<Link href="javascript:history.back()">
									<ArrowLeft className="h-4 w-4" />
									Quay lại
								</Link>
							</Button>
						</div>

						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Nếu bạn là quản trị viên, vui lòng{" "}
								<Link href="/login" className="text-primary hover:underline">
									đăng nhập lại
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
