"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { isLocalOrPrivateHost, getHostWarningMessage } from "@/utils/hostValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ConnectionInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  externalConnectionString?: string;
  externalCompleteConnectionString?: string;
  externalHost?: string;
  port?: number;
  databaseName?: string;
  username: string;
  password: string;
}

export default function ConnectionInfoDialog({
  open,
  onOpenChange,
  externalConnectionString,
  externalCompleteConnectionString,
  externalHost,
  port,
  databaseName,
  username,
  password,
}: ConnectionInfoDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const showWarning = isLocalOrPrivateHost(externalHost);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thông tin Kết nối</DialogTitle>
          <DialogDescription>
            Sử dụng các thông tin đăng nhập này để kết nối đến cơ sở dữ liệu của bạn bằng các công cụ như pgAdmin, MySQL Workbench, MongoDB Compass, Redis CLI. Nhấp vào nút sao chép để sao chép từng giá trị.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {showWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getHostWarningMessage(externalHost)}
              </AlertDescription>
            </Alert>
          )}
          
          {externalCompleteConnectionString && (
            <div className="space-y-2">
              <Label htmlFor="externalCompleteConnectionString">
                Chuỗi Kết nối Hoàn chỉnh (Connection String)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="externalCompleteConnectionString"
                  value={externalCompleteConnectionString}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(externalCompleteConnectionString, "externalCompleteConnectionString")}
                >
                  {copiedField === "externalCompleteConnectionString" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sao chép chuỗi kết nối này để kết nối trực tiếp từ máy của bạn. Tất cả thông tin đăng nhập đã được bao gồm.
              </p>
            </div>
          )}
          
          {externalConnectionString && (
            <div className="space-y-2">
              <Label htmlFor="externalConnectionString">Chuỗi Kết nối (Đã ẩn mật khẩu)</Label>
              <div className="flex gap-2">
                <Input
                  id="externalConnectionString"
                  value={externalConnectionString}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(externalConnectionString, "externalConnectionString")}
                >
                  {copiedField === "externalConnectionString" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {externalHost && (
            <div className="space-y-2">
              <Label htmlFor="externalHost">Máy chủ (Host)</Label>
              <div className="flex gap-2">
                <Input
                  id="externalHost"
                  value={externalHost}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(externalHost, "externalHost")}
                >
                  {copiedField === "externalHost" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {port && (
            <div className="space-y-2">
              <Label htmlFor="port">Cổng (Port)</Label>
              <div className="flex gap-2">
                <Input
                  id="port"
                  value={String(port)}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(String(port), "port")}
                >
                  {copiedField === "port" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {databaseName && (
            <div className="space-y-2">
              <Label htmlFor="databaseName">Tên Cơ sở dữ liệu</Label>
              <div className="flex gap-2">
                <Input
                  id="databaseName"
                  value={databaseName}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(databaseName, "databaseName")}
                >
                  {copiedField === "databaseName" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Tên người dùng</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={username}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(username, "username")}
              >
                {copiedField === "username" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password, "password")}
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
