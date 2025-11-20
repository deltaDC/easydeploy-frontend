"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseType, CreateDatabaseDto } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { Loader2 } from "lucide-react";
import ErrorDialog from "./ErrorDialog";

export default function DatabaseDeployForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [formData, setFormData] = useState<CreateDatabaseDto>({
    name: "",
    type: DatabaseType.POSTGRESQL,
    version: "14",
    storageGb: 1,
    memoryMb: 256,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const database = await DatabaseService.createDatabase(formData);
      router.push(`/databases/${database.id}`);
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể tạo cơ sở dữ liệu",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVersions = (type: DatabaseType): string[] => {
    switch (type) {
      case DatabaseType.POSTGRESQL:
        return ["14", "15", "16"];
      case DatabaseType.MYSQL:
        return ["8.0", "8.1"];
      case DatabaseType.MONGODB:
        return ["6.0", "7.0"];
      case DatabaseType.REDIS:
        return ["7", "7-alpine"];
      default:
        return [];
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Triển khai Cơ sở dữ liệu mới</CardTitle>
        <CardDescription>Tạo một container cơ sở dữ liệu mới</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên Cơ sở dữ liệu</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="myapp-db"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại Cơ sở dữ liệu</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as DatabaseType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DatabaseType.POSTGRESQL}>PostgreSQL</SelectItem>
                <SelectItem value={DatabaseType.MYSQL}>MySQL</SelectItem>
                <SelectItem value={DatabaseType.MONGODB}>MongoDB</SelectItem>
                <SelectItem value={DatabaseType.REDIS}>Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Phiên bản</Label>
            <Select
              value={formData.version}
              onValueChange={(value) => setFormData({ ...formData, version: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVersions(formData.type).map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storageGb">Dung lượng lưu trữ (GB)</Label>
              <Input
                id="storageGb"
                type="number"
                value={formData.storageGb}
                onChange={(e) =>
                  setFormData({ ...formData, storageGb: parseInt(e.target.value) || 10 })
                }
                min={1}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memoryMb">Bộ nhớ (MB)</Label>
              <Input
                id="memoryMb"
                type="number"
                value={formData.memoryMb}
                onChange={(e) =>
                  setFormData({ ...formData, memoryMb: parseInt(e.target.value) || 256 })
                }
                min={128}
                max={8192}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang triển khai...
              </>
            ) : (
              "Triển khai Cơ sở dữ liệu"
            )}
          </Button>
        </form>
      </CardContent>
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        message={errorDialog.message}
      />
    </Card>
  );
}

