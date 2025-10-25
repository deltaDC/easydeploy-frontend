"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
	User, 
	Mail, 
	Calendar, 
	Shield, 
	Edit, 
	Save, 
	X, 
	CheckCircle,
	AlertCircle,
	Loader2
} from "lucide-react";
import GitHubIntegration from "@/components/github/GitHubIntegration";
import { EmailUpdateAlert } from "@/components/ui/email-update-alert";
import { GithubService } from "@/services/github.service";

export default function ProfilePage() {
	const { user, isLoading, hasRole } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		email: user?.email || "",
	});
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleEmailUpdated = (newEmail: string) => {
		// Update user data in auth store
		// This would typically be handled by the auth store
		setMessage({ type: 'success', text: `Email đã được cập nhật thành ${newEmail}` });
	};

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

	if (!user) {
		return (
			<div className="flex items-center justify-center py-12">
				<Alert className="max-w-md">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Bạn cần đăng nhập để xem thông tin cá nhân.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const handleSave = async () => {
		setIsSaving(true);
		setMessage(null);
		
		try {
			// TODO: Implement update profile API call
			// await AuthService.updateProfile(editData);
			
			// Mock success for now
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
			setIsEditing(false);
		} catch (error) {
			setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin.' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditData({
			email: user.email,
		});
		setIsEditing(false);
		setMessage(null);
	};

	const getInitials = (email: string) => {
		return email.split('@')[0].substring(0, 2).toUpperCase();
	};

	return (
		<div className="py-6">
			<div className="container-page grid gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
						<p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
					</div>
					{!isEditing && (
						<Button onClick={() => setIsEditing(true)} className="gap-2">
							<Edit className="h-4 w-4" />
							Chỉnh sửa
						</Button>
					)}
				</div>

				{/* Email Update Alert for Fallback Emails */}
				{GithubService.isFallbackEmail(user.email) && (
					<EmailUpdateAlert 
						email={user.email} 
						onEmailUpdated={handleEmailUpdated}
					/>
				)}

				{message && (
					<Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
						{message.type === 'success' ? (
							<CheckCircle className="h-4 w-4 text-green-600" />
						) : (
							<AlertCircle className="h-4 w-4 text-red-600" />
						)}
						<AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
							{message.text}
						</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Profile Overview */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader className="text-center">
								<Avatar className="h-24 w-24 mx-auto mb-4">
									<AvatarImage src={user.avatarUrl} alt={user.email} />
									<AvatarFallback className="text-lg">
										{getInitials(user.email)}
									</AvatarFallback>
								</Avatar>
								<CardTitle className="text-xl">{user.email}</CardTitle>
								<CardDescription className="flex items-center justify-center gap-2">
									<Mail className="h-4 w-4" />
									{user.email}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Vai trò</span>
									<Badge variant={hasRole('ADMIN') ? 'default' : 'secondary'}>
										<Shield className="h-3 w-3 mr-1" />
										{hasRole('ADMIN') ? 'Quản trị viên' : 'Người dùng'}
									</Badge>
								</div>
								
								<Separator />
								
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Tham gia</span>
									<span className="text-sm font-medium">
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
									</span>
								</div>
								
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Đăng nhập cuối</span>
									<span className="text-sm font-medium">N/A</span>
								</div>
								
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Email đã xác thực</span>
									<Badge variant="default">
										Đã xác thực
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Profile Details */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Thông tin cá nhân
								</CardTitle>
								<CardDescription>
									Cập nhật thông tin cơ bản của bạn
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Họ và tên</Label>
										<div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
											<User className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm text-muted-foreground">Chưa có thông tin</span>
										</div>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										{isEditing ? (
											<Input
												id="email"
												type="email"
												value={editData.email}
												onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
												placeholder="Nhập email"
											/>
										) : (
											<div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span>{user.email}</span>
											</div>
										)}
									</div>
								</div>

								{isEditing && (
									<div className="flex gap-2 pt-4">
										<Button onClick={handleSave} disabled={isSaving} className="gap-2">
											<Save className="h-4 w-4" />
											{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
										</Button>
										<Button variant="outline" onClick={handleCancel} className="gap-2">
											<X className="h-4 w-4" />
											Hủy
										</Button>
									</div>
								)}
							</CardContent>
						</Card>

						{/* GitHub Integration */}
						<GitHubIntegration />

						{/* Account Statistics */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Thống kê tài khoản
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="text-center p-4 border rounded-lg">
										<div className="text-2xl font-bold text-primary">0</div>
										<div className="text-sm text-muted-foreground">Dự án đã deploy</div>
									</div>
									<div className="text-center p-4 border rounded-lg">
										<div className="text-2xl font-bold text-primary">0</div>
										<div className="text-sm text-muted-foreground">Lần deploy thành công</div>
									</div>
									<div className="text-center p-4 border rounded-lg">
										<div className="text-2xl font-bold text-primary">0</div>
										<div className="text-sm text-muted-foreground">Giờ hoạt động</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
