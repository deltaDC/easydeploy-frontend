export default function NewAppPage() {
	return (
		<div className="grid gap-6">
			<h1 className="text-2xl font-semibold">Deploy ứng dụng mới</h1>
			<form className="card grid max-w-xl gap-3 p-5">
				<select className="input">
					<option value="">Chọn nguồn</option>
					<option>GitHub Repository</option>
					<option>Docker Image</option>
				</select>
				<input className="input" placeholder="Repo URL hoặc Image name" />
				<button className="btn btn-primary w-fit">Deploy</button>
			</form>
		</div>
	);
}
