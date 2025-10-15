import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import ProjectsTable from "@/components/tables/ProjectsTable";

export default function AppsListPage() {
	return (
		<div className="grid gap-6">
			<PageHeader title="Ứng dụng của bạn" description="Quản lý, redeploy và xem log" actions={<Link href="/apps/new" className="btn btn-primary">Deploy mới</Link>} />
			<ProjectsTable />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardBody>
						<p className="muted">Chưa có ứng dụng nào. Bắt đầu bằng nút &quot;Deploy mới&quot;.</p>
					</CardBody>
				</Card>
				<Card>
					<CardBody>
						<p className="muted">Gợi ý: hỗ trợ deploy qua GitHub repo hoặc Docker image.</p>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
