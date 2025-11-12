"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

interface ExportStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => Promise<void>;
  isLoading?: boolean;
}

export function ExportStatsModal({
  open,
  onOpenChange,
  onExport,
  isLoading = false,
}: ExportStatsModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onExport();
      onOpenChange(false);
    } catch (error) {
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Xuất báo cáo PDF
          </DialogTitle>
          <DialogDescription>
            Xuất toàn bộ trang thống kê dưới dạng PDF bao gồm tất cả các biểu đồ và bảng dữ liệu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Báo cáo PDF sẽ bao gồm:
            </p>
            <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>Tổng quan thống kê</li>
              <li>Biểu đồ xu hướng</li>
              <li>Phân tích chi tiết</li>
              <li>Bảng dữ liệu</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              {isLoading ? "Đang xuất..." : "Xuất PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

