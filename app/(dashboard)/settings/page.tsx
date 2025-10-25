"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserSettings } from "@/hooks/useUserSettings";
import { UserSettingsService } from "@/services/user-settings.service";
import { UserProfileService } from "@/services/user-profile.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { 
	Settings as SettingsIcon, 
	Bell, 
	Shield, 
	Globe, 
	Save, 
	CheckCircle2,
	AlertCircle,
	Loader2,
	Github,
	Trash2
} from "lucide-react";
import GitHubAppIntegration from "@/components/github/GitHubAppIntegration";

export default function SettingsPage() {
	const router = useRouter();
	const { settings, isLoading, isError, mutate } = useUserSettings();
	const [isSaving, setIsSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	
	// Delete account dialog state
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteReason, setDeleteReason] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	
	// Local state for form
	const [formData, setFormData] = useState({
		// Thông báo
		emailNotifications: true,
		pushNotifications: false,
		deploymentUpdates: true,
		errorAlerts: true,
		
		// Quyền riêng tư
		publicProfile: false,
		showEmail: false,
		analyticsEnabled: true,
		
		// Bảo mật
		twoFactorEnabled: false,
		sessionTimeoutHours: 24,
		loginAlerts: true,
	});

	// Update form when settings load from backend
	useEffect(() => {
		if (settings) {
			setFormData(settings);
		}
	}, [settings]);

	const handleSaveSettings = async () => {
		setIsSaving(true);
		setSuccess(false);
		
		try {
			const updatedSettings = await UserSettingsService.updateUserSettings(formData);
			mutate(updatedSettings, false); // Optimistic update without revalidation
			setSuccess(true);
			toast.success("Cập nhật cài đặt thành công!");
			
			// Hide success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error('Failed to update settings:', error);
			toast.error("Có lỗi xảy ra khi cập nhật cài đặt");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!deletePassword.trim()) {
			toast.error("Vui lòng nhập mật khẩu để xác nhận");
			return;
		}

		setIsDeleting(true);
		
		try {
			await UserProfileService.deleteAccount({
				password: deletePassword,
				reason: deleteReason || undefined,
			});
			
			toast.success("Tài khoản đã được xóa thành công");
			
			// Clear auth and redirect to login
			setTimeout(() => {
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth_token");
					window.location.href = "/login";
				}
			}, 1500);
		} catch (error: any) {
			console.error('Failed to delete account:', error);
			const errorMessage = error.response?.data?.message || "Mật khẩu không đúng hoặc có lỗi xảy ra";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="py-6">
				<div className="container-page flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-muted-foreground">Đang tải cài đặt...</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="py-6">
				<div className="container-page">
					<Alert className="border-red-200 bg-red-50">
						<AlertCircle className="h-4 w-4 text-red-600" />
						<AlertDescription className="text-red-800">
							Không thể tải cài đặt. Vui lòng thử lại sau.
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<div className="container-page grid gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
							<SettingsIcon className="h-6 w-6" />
							Cài đặt
						</h1>
						<p className="text-muted-foreground">Quản lý cài đặt tài khoản và ứng dụng</p>
					</div>
				</div>

				{success && (
					<Alert className="border-green-200 bg-green-50">
						<CheckCircle2 className="h-4 w-4 text-green-600" />
						<AlertDescription className="text-green-800">
							Cài đặt đã được cập nhật thành công!
						</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* GitHub Integration */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Github className="h-5 w-5" />
								GitHub Integration
							</CardTitle>
							<CardDescription>
								Kết nối với GitHub App để truy cập repositories từ cả personal account và organization
							</CardDescription>
						</CardHeader>
						<CardContent>
							<GitHubAppIntegration />
						</CardContent>
					</Card>

					{/* Notifications */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bell className="h-5 w-5" />
								Thông báo
							</CardTitle>
							<CardDescription>
								Quản lý cách bạn nhận thông báo
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Thông báo qua email</Label>
										<p className="text-sm text-muted-foreground">
											Nhận thông báo qua email
										</p>
									</div>
									<Switch
										checked={formData.emailNotifications}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, emailNotifications: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Thông báo đẩy</Label>
										<p className="text-sm text-muted-foreground">
											Nhận thông báo đẩy trên trình duyệt
										</p>
									</div>
									<Switch
										checked={formData.pushNotifications}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, pushNotifications: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Cập nhật triển khai</Label>
										<p className="text-sm text-muted-foreground">
											Thông báo khi deployment hoàn thành
										</p>
									</div>
									<Switch
										checked={formData.deploymentUpdates}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, deploymentUpdates: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Cảnh báo lỗi</Label>
										<p className="text-sm text-muted-foreground">
											Thông báo khi có lỗi xảy ra
										</p>
									</div>
									<Switch
										checked={formData.errorAlerts}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, errorAlerts: checked }))
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Privacy */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Globe className="h-5 w-5" />
								Quyền riêng tư
							</CardTitle>
							<CardDescription>
								Kiểm soát thông tin cá nhân của bạn
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Hồ sơ công khai</Label>
										<p className="text-sm text-muted-foreground">
											Cho phép người khác xem hồ sơ của bạn
										</p>
									</div>
									<Switch
										checked={formData.publicProfile}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, publicProfile: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Hiển thị email</Label>
										<p className="text-sm text-muted-foreground">
											Cho phép người khác xem email của bạn
										</p>
									</div>
									<Switch
										checked={formData.showEmail}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, showEmail: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Phân tích và cải thiện</Label>
										<p className="text-sm text-muted-foreground">
											Cho phép thu thập dữ liệu để cải thiện dịch vụ
										</p>
									</div>
									<Switch
										checked={formData.analyticsEnabled}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, analyticsEnabled: checked }))
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Security */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Bảo mật
							</CardTitle>
							<CardDescription>
								Bảo vệ tài khoản của bạn
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Xác thực hai yếu tố (2FA)</Label>
										<p className="text-sm text-muted-foreground">
											Thêm lớp bảo mật bổ sung cho tài khoản
										</p>
									</div>
									<Switch
										checked={formData.twoFactorEnabled}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, twoFactorEnabled: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Cảnh báo đăng nhập</Label>
										<p className="text-sm text-muted-foreground">
											Nhận thông báo khi có đăng nhập mới
										</p>
									</div>
									<Switch
										checked={formData.loginAlerts}
										onCheckedChange={(checked) => 
											setFormData(prev => ({ ...prev, loginAlerts: checked }))
										}
									/>
								</div>
								
								<div className="space-y-2 md:col-span-2">
									<Label>Thời gian timeout phiên (giờ)</Label>
									<Select
										value={formData.sessionTimeoutHours.toString()}
										onValueChange={(value) => 
											setFormData(prev => ({ ...prev, sessionTimeoutHours: parseInt(value) }))
										}
									>
										<SelectTrigger className="max-w-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">1 giờ</SelectItem>
											<SelectItem value="6">6 giờ</SelectItem>
											<SelectItem value="12">12 giờ</SelectItem>
											<SelectItem value="24">24 giờ</SelectItem>
											<SelectItem value="168">1 tuần</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-sm text-muted-foreground">
										Tự động đăng xuất sau thời gian không hoạt động
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Action Buttons Row - Save on left, Danger Zone on right */}
				<div className="flex items-center justify-between gap-6">
					{/* Save Button */}
					<Button 
						onClick={handleSaveSettings} 
						disabled={isSaving}
						className="gap-2 min-w-[200px]"
						size="lg"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Đang lưu...
							</>
						) : (
							<>
								<Save className="h-4 w-4" />
								Lưu tất cả cài đặt
							</>
						)}
					</Button>

					{/* Danger Zone - Delete Account */}
					<div className="flex items-center gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
						<div className="space-y-0.5">
							<Label className="text-red-900 text-sm font-semibold">Vùng Nguy Hiểm</Label>
							<p className="text-xs text-red-700">
								Xóa vĩnh viễn tài khoản của bạn
							</p>
						</div>
						<Button 
							variant="destructive"
							onClick={() => setShowDeleteDialog(true)}
							className="gap-2"
							size="sm"
						>
							<Trash2 className="h-4 w-4" />
							Xóa tài khoản
						</Button>
					</div>
				</div>

				{/* Delete Account Dialog */}
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2 text-red-600">
								<Trash2 className="h-5 w-5" />
								Xác nhận xóa tài khoản
							</AlertDialogTitle>
							<AlertDialogDescription>
								Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và không thể hoàn tác.
								Vui lòng nhập mật khẩu để xác nhận.
							</AlertDialogDescription>
						</AlertDialogHeader>
						
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="delete-password">Mật khẩu hiện tại *</Label>
								<Input
									id="delete-password"
									type="password"
									placeholder="Nhập mật khẩu của bạn"
									value={deletePassword}
									onChange={(e) => setDeletePassword(e.target.value)}
									disabled={isDeleting}
								/>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="delete-reason">Lý do xóa (tùy chọn)</Label>
								<Textarea
									id="delete-reason"
									placeholder="Cho chúng tôi biết tại sao bạn muốn xóa tài khoản..."
									value={deleteReason}
									onChange={(e) => setDeleteReason(e.target.value)}
									disabled={isDeleting}
									rows={3}
								/>
							</div>

							<Alert className="border-red-200 bg-red-50">
								<AlertCircle className="h-4 w-4 text-red-600" />
								<AlertDescription className="text-red-800">
									<strong>Cảnh báo:</strong> Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, 
									bao gồm ứng dụng, deployments, và logs.
								</AlertDescription>
							</Alert>
						</div>

						<AlertDialogFooter>
							<AlertDialogCancel disabled={isDeleting}>
								Hủy
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									handleDeleteAccount();
								}}
								disabled={isDeleting || !deletePassword.trim()}
								className="bg-red-600 hover:bg-red-700"
							>
								{isDeleting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Đang xóa...
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4 mr-2" />
										Xác nhận xóa
									</>
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
