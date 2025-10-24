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
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileService } from "@/services/user-profile.service";
import { Image as ImageIcon } from "lucide-react";

interface UpdateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onSuccess: (updatedProfile?: any) => void;
}

export function UpdateAvatarModal({
  isOpen,
  onClose,
  currentAvatar,
  onSuccess,
}: UpdateAvatarModalProps) {
  const { user, setUser } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!avatarUrl.trim()) {
      toast.error("Vui lòng nhập URL avatar!");
      return;
    }

    // Validate URL
    try {
      new URL(avatarUrl);
    } catch {
      toast.error("URL không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await UserProfileService.updateAvatar(avatarUrl);
      
      // Update auth store with new avatar
      if (user) {
        setUser({
          ...user,
          // @ts-ignore
          avatarUrl: updatedProfile.avatarUrl,
        });
      }
      
      toast.success("Cập nhật avatar thành công!");
      onSuccess(updatedProfile); // Pass updated data
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật avatar thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Cập nhật Avatar
          </DialogTitle>
          <DialogDescription>
            Nhập URL hình ảnh avatar mới của bạn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL *</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Nhập URL trực tiếp đến hình ảnh (jpg, png, gif)
            </p>
          </div>

          {avatarUrl && (
            <div className="space-y-2">
              <Label>Xem trước</Label>
              <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
