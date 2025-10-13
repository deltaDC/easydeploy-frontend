import PageHeader from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Link from "next/link";

export default function DashboardHome() {
	return (
		<div className="grid gap-6">
			<PageHeader title="Tổng quan" description="Tình trạng hệ thống, tài nguyên sử dụng và dự án gần đây" actions={<Link className="btn btn-primary" href="/apps/new">Deploy mới</Link>} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				{/* Left column: Usage + Recent */}
				<div className="lg:col-span-4 grid gap-4">
					<Card>
						<CardHeader title="Usage (30 ngày)" />
						<CardBody className="grid gap-3">
							<div className="flex items-center justify-between text-sm"><span className="muted">Data Transfer</span><span>0 / 100 GB</span></div>
							<div className="flex items-center justify-between text-sm"><span className="muted">Origin Transfer</span><span>0 / 10 GB</span></div>
							<div className="flex items-center justify-between text-sm"><span className="muted">Edge Requests</span><span>0 / 1M</span></div>
							<div className="flex items-center justify-between text-sm"><span className="muted">Edge CPU</span><span>0 / 1h</span></div>
						</CardBody>
					</Card>

					<Card>
						<CardHeader title="Recent Previews" />
						<CardBody>
							<p className="muted text-sm">Chưa có preview nào gần đây.</p>
						</CardBody>
					</Card>
				</div>

				{/* Right column: Projects */}
				<div className="lg:col-span-8 grid gap-4">
					<Card>
						<CardBody>
							<div className="grid place-items-center py-12 text-center">
								<div>
									<div className="mb-2 text-lg font-semibold">Deploy dự án đầu tiên của bạn</div>
									<p className="muted text-sm">Import từ Git provider hoặc chọn một template có sẵn.</p>
									<div className="mt-4 flex justify-center gap-2">
										<Link href="/apps/new" className="btn btn-primary">Import Project</Link>
										<button className="btn btn-outline">Next.js Boilerplate</button>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Card>
							<CardHeader title="AI Chatbot" subtitle="Full-featured Next.js AI chatbot" />
							<CardBody>
								<div className="flex items-center justify-between text-sm">
									<span className="muted">Status</span>
									<span>Not deployed</span>
								</div>
								<div className="mt-3"><button className="btn btn-outline">Deploy</button></div>
							</CardBody>
						</Card>
						<Card>
							<CardHeader title="Express.js" subtitle="Template Express trên EasyDeploy" />
							<CardBody>
								<div className="flex items-center justify-between text-sm">
									<span className="muted">Status</span>
									<span>Not deployed</span>
								</div>
								<div className="mt-3"><button className="btn btn-outline">Deploy</button></div>
							</CardBody>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
