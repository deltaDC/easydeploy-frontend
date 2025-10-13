import Link from "next/link";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold">Đăng ký</h1>
				<p className="text-sm muted">Tạo tài khoản EasyDeploy</p>
			</div>
			<form className="card grid gap-3 p-5">
				<input className="input" placeholder="Tên" />
				<input className="input" placeholder="Email" type="email" />
				<input className="input" placeholder="Mật khẩu" type="password" />
				<Button type="submit">Tạo tài khoản</Button>
			</form>
			<p className="text-center text-sm muted">
				Đã có tài khoản? <Link className="text-sky-600 underline" href="/login">Đăng nhập</Link>
			</p>
		</div>
	);
}
