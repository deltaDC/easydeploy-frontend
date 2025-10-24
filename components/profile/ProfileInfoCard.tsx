"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileService } from "@/services/user-profile.service";
import type { UserProfile, UpdateProfileRequest } from "@/types/user-profile";
import {
  User,
  Mail,
  Lock,
  Github,
  Image as ImageIcon,
  Shield,
  Calendar,
  AlertCircle,
  Check,
  X,
  CheckCircle2,
} from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { UpdateAvatarModal } from "./UpdateAvatarModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileInfoCardProps {
  profile: UserProfile;
  onUpdate: (updatedProfile?: UserProfile) => void;
}

export function ProfileInfoCard({ profile, onUpdate }: ProfileInfoCardProps) {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    email: profile.email,
    avatarUrl: profile.avatarUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setIsLoading(true);
    setUpdateSuccess(false);
    try {
      const updatedProfile = await UserProfileService.updateProfile(formData);
      
      // Check if email changed - need to re-login
      const emailChanged = formData.email !== profile.email;
      
      // Update auth store with new user info
      if (user) {
        setUser({
          ...user,
          email: updatedProfile.email,
          avatarUrl: updatedProfile.avatarUrl || user.avatarUrl,
        });
      }
      
      setUpdateSuccess(true);
      
      if (emailChanged) {
        toast.success("Email đã được cập nhật! Vui lòng đăng nhập lại với email mới.", {
          duration: 5000,
        });
        
        // Auto logout after 3 seconds
        setTimeout(() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
        }, 3000);
      } else {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
        onUpdate(updatedProfile); // Pass updated data instead of refetching
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thông tin thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      await UserProfileService.disconnectGithub();
      toast.success("Ngắt kết nối GitHub thành công!");
      onUpdate();
      setShowDisconnectDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Ngắt kết nối thất bại!");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Hoạt động", variant: "default" as const, icon: Check },
      BANNED: { label: "Bị cấm", variant: "destructive" as const, icon: X },
      SUSPENDED: { label: "Tạm khóa", variant: "secondary" as const, icon: AlertCircle },
      DELETED: { label: "Đã xóa", variant: "outline" as const, icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Quản lý thông tin tài khoản và cài đặt bảo mật
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Success Alert */}
          {updateSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Thành công!</strong> Thông tin của bạn đã được cập nhật.
              </AlertDescription>
            </Alert>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="avatarUrl"
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, avatarUrl: e.target.value })
                      }
                      disabled={isLoading}
                      className="pl-10"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Hoặc{" "}
                    <button
                      type="button"
                      onClick={() => setShowUpdateAvatarModal(true)}
                      className="text-blue-600 hover:underline"
                    >
                      tải lên avatar mới
                    </button>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      email: profile.email,
                      avatarUrl: profile.avatarUrl || "",
                    });
                  }}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profile.avatarUrl || "/placeholder-avatar.png"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{profile.email}</h3>
                  <p className="text-sm text-gray-500">ID: {profile.id}</p>
                  <div className="mt-2">{getStatusBadge(profile.status)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpdateAvatarModal(true)}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Đổi avatar
                </Button>
              </div>

              <Separator />

              {/* Account Info */}
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-2">
                  <Label className="text-gray-500">Email:</Label>
                  <span className="col-span-2 font-medium">{profile.email}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Label className="text-gray-500">User ID:</Label>
                  <span className="col-span-2 font-mono text-sm">{profile.id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Label className="text-gray-500 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Roles:
                  </Label>
                  <div className="col-span-2 flex gap-2 flex-wrap">
                    {profile.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Label className="text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Ngày tạo:
                  </Label>
                  <span className="col-span-2 text-sm">
                    {new Date(profile.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Label className="text-gray-500">Cập nhật lần cuối:</Label>
                  <span className="col-span-2 text-sm">
                    {new Date(profile.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* GitHub Integration */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Github className="h-5 w-5" />
                  Liên kết GitHub
                </Label>
                {profile.isGithubLinked ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          Đã liên kết với GitHub
                        </p>
                        <p className="text-sm text-green-700">
                          @{profile.githubUsername || "N/A"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisconnectDialog(true)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Ngắt kết nối
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Github className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Chưa liên kết GitHub
                        </p>
                        <p className="text-sm text-gray-600">
                          Liên kết để deploy ứng dụng từ repository
                        </p>
                      </div>
                    </div>
                    <Button size="sm">Liên kết ngay</Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Lock className="h-5 w-5" />
                  Bảo mật
                </Label>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <UpdateAvatarModal
        isOpen={showUpdateAvatarModal}
        onClose={() => setShowUpdateAvatarModal(false)}
        currentAvatar={profile.avatarUrl}
        onSuccess={onUpdate}
      />

      {/* Disconnect GitHub Confirmation */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngắt kết nối GitHub</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngắt kết nối tài khoản GitHub? 
              Bạn sẽ không thể deploy các ứng dụng từ repository cho đến khi liên kết lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectGithub}
              className="bg-red-600 hover:bg-red-700"
            >
              Ngắt kết nối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
