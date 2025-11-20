"use client";

import DatabaseList from "@/components/database/DatabaseList";
import PageHeader from "@/components/layout/PageHeader";

export default function DatabasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cơ sở dữ liệu"
        description="Quản lý các container cơ sở dữ liệu của bạn"
      />
      <DatabaseList />
    </div>
  );
}

