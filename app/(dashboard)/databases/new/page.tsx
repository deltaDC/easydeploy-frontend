"use client";

import DatabaseDeployForm from "@/components/database/DatabaseDeployForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NewDatabasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Triển khai Cơ sở dữ liệu mới"
        description="Tạo một container cơ sở dữ liệu mới"
      />
      <DatabaseDeployForm />
    </div>
  );
}

