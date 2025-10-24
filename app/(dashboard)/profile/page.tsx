"use client";

import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, isLoading, isError, mutate } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Đang tải thông tin profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Không thể tải thông tin profile</p>
                  <p className="text-sm">Vui lòng thử lại sau hoặc liên hệ admin.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin tài khoản và cài đặt bảo mật của bạn
          </p>
        </div>
        <ProfileInfoCard 
          profile={profile} 
          onUpdate={(updatedProfile) => {
            // Optimistic update - use data from API response instead of refetching
            if (updatedProfile) {
              mutate(updatedProfile, false); // false = don't revalidate
            }
          }} 
        />
      </div>
    </div>
  );
}
