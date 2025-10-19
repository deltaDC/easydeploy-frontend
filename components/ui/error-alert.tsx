"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  error: {
    message: string;
    status?: number;
  };
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, className }: ErrorAlertProps) {
  const isSystemError = error.message.includes("Hệ thống chưa được cấu hình đầy đủ");
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">{error.message}</p>
          {isSystemError && (
            <div className="text-sm mt-2 opacity-90">
              <p className="mb-1"><strong>Nguyên nhân:</strong> Backend thiếu dữ liệu khởi tạo (roles)</p>
              <p className="mb-1"><strong>Giải pháp:</strong> Admin cần chạy script khởi tạo database</p>
              <p className="text-xs mt-2 p-2 bg-gray-100 rounded">
                <strong>Chi tiết kỹ thuật:</strong><br/>
                - Tạo bảng roles với dữ liệu: ADMIN, DEVELOPER<br/>
                - Hoặc thêm DataInitializer trong backend<br/>
                - Lỗi: ResourceNotFoundException: Role DEVELOPER không tồn tại
              </p>
            </div>
          )}
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
