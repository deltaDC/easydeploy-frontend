export default function SettingsPage() {
	return (
		<div className="grid gap-6">
			<h1 className="text-2xl font-semibold">Cài đặt tài khoản</h1>
			<div className="card grid max-w-xl gap-3 p-5">
				<label className="grid gap-1 text-sm">
					<span>Tên</span>
					<input className="input" defaultValue="User" />
				</label>
				<button className="btn btn-primary w-fit">Lưu</button>
			</div>
		</div>
	);
}
