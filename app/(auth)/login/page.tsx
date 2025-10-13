import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold">Đăng nhập</h1>
				<p className="text-sm muted">Chào mừng trở lại EasyDeploy</p>
			</div>
			<form className="card grid gap-3 p-5">
				<input className="input" placeholder="Email" type="email" />
				<input className="input" placeholder="Mật khẩu" type="password" />
				<Button type="submit">Đăng nhập</Button>
			</form>
			<div className="text-center text-sm muted">hoặc</div>
			<a href="/api/auth/github" className="btn btn-outline w-full text-center">Đăng nhập với GitHub</a>
			<p className="text-center text-sm muted">
				Chưa có tài khoản? <Link className="text-sky-600 underline" href="/register">Đăng ký</Link>
			</p>
		</div>
	);
}
