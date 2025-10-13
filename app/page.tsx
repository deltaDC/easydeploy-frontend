import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

export default function LandingPage() {
	return (
		<section className="grid gap-10 py-10">
			<header className="grid gap-4 text-center">
				<h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Triển khai web app nhanh chóng với EasyDeploy</h1>
				<p className="mx-auto max-w-2xl muted">Kết nối GitHub hoặc dùng Docker image. Hệ thống tự động build & deploy và trả về URL public.</p>
				<div className="flex items-center justify-center gap-3">
					<Link href="/login" className="btn btn-primary">Bắt đầu miễn phí</Link>
					<Link href="/apps" className="btn btn-outline">Xem Dashboard</Link>
				</div>
			</header>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card><CardBody><h3 className="font-semibold">Tự động hóa CI/CD</h3><p className="muted text-sm">Clone → Build → Deploy chỉ với vài cú click.</p></CardBody></Card>
				<Card><CardBody><h3 className="font-semibold">Hỗ trợ Docker</h3><p className="muted text-sm">Triển khai bằng Docker image hoặc từ source.</p></CardBody></Card>
				<Card><CardBody><h3 className="font-semibold">Giám sát</h3><p className="muted text-sm">Trạng thái, log realtime, cảnh báo downtime.</p></CardBody></Card>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardBody>
						<h3 className="font-semibold">Dành cho sinh viên, freelancer, startup</h3>
						<p className="muted text-sm">Không cần DevOps nâng cao. Tập trung vào sản phẩm, để EasyDeploy lo phần deploy.</p>
					</CardBody>
				</Card>
				<Card>
					<CardBody>
						<h3 className="font-semibold">Kết nối GitHub trong 1 phút</h3>
						<p className="muted text-sm">Authorize GitHub, chọn repository, bấm Deploy. Có thể tự động redeploy khi có commit mới.</p>
					</CardBody>
				</Card>
			</div>
		</section>
	);
}
