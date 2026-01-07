"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { UserProfileService } from "@/services/user-profile.service";
import type { ChangePasswordRequest } from "@/types/user-profile";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const validatePassword = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.currentPassword) {
      validationErrors.push("Vui lòng nhập mật khẩu hiện tại");
    }

    if (!formData.newPassword) {
      validationErrors.push("Vui lòng nhập mật khẩu mới");
    } else {
      if (formData.newPassword.length < 8) {
        validationErrors.push("Mật khẩu mới phải có ít nhất 8 ký tự");
      }

      if (!/[a-z]/.test(formData.newPassword)) {
        validationErrors.push("Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)");
      }

      if (!/[A-Z]/.test(formData.newPassword)) {
        validationErrors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)");
      }

      if (!/\d/.test(formData.newPassword)) {
        validationErrors.push("Mật khẩu phải chứa ít nhất 1 số (0-9)");
      }

      if (!/[@$!%*?&]/.test(formData.newPassword)) {
        validationErrors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)");
      }
    }

    if (!formData.confirmPassword) {
      validationErrors.push("Vui lòng xác nhận mật khẩu mới");
    } else if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.push("Xác nhận mật khẩu không khớp");
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      validationErrors.push("Mật khẩu mới không được trùng với mật khẩu hiện tại");
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    // Validate
    const validationErrors = validatePassword();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await UserProfileService.changePassword(formData);
      
      // Show success state
      setSuccess(true);
      toast.success("Đổi mật khẩu thành công!");
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Wait 2 seconds to show success message, then redirect
      setTimeout(() => {
        onClose();
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || "Đổi mật khẩu thất bại!";
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!success) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors([]);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới. Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu.
          </DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Đổi mật khẩu thành công!</strong>
              <p className="text-sm mt-1">Đang chuyển hướng đến trang đăng nhập...</p>
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && !success && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Lỗi xác thực:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading || success}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || success} variant="success">
              {isLoading ? "Đang xử lý..." : success ? "Thành công!" : "Đổi mật khẩu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
