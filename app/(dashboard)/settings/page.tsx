"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
	Settings, 
	Bell, 
	Shield, 
	Globe, 
	Save, 
	Eye, 
	EyeOff,
	CheckCircle,
	AlertCircle,
	Mail,
	Key,
	Trash2
} from "lucide-react";

export default function SettingsPage() {
	const { user, logout } = useAuth();
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	
	// Notification settings
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		deployments: true,
		errors: true,
		maintenance: true,
	});
	
	// Privacy settings
	const [privacy, setPrivacy] = useState({
		profilePublic: false,
		showEmail: false,
		analytics: true,
	});
	
	// Security settings
	const [security, setSecurity] = useState({
		twoFactor: false,
		sessionTimeout: "24",
		loginAlerts: true,
	});

	const handleSaveSettings = async (section: string) => {
		setIsSaving(true);
		setMessage(null);
		
		try {
			// TODO: Implement save settings API call
			// await SettingsService.updateSettings(section, data);
			
			// Mock success for now
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setMessage({ type: 'success', text: `Cập nhật ${section} thành công!` });
		} catch (error) {
			setMessage({ type: 'error', text: `Có lỗi xảy ra khi cập nhật ${section}.` });
		} finally {
			setIsSaving(false);
		}
	};

	const handleChangePassword = async () => {
		setIsSaving(true);
		setMessage(null);
		
		try {
			// TODO: Implement change password API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
		} catch (error) {
			setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đổi mật khẩu.' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
			return;
		}
		
		setIsSaving(true);
		setMessage(null);
		
		try {
			// TODO: Implement delete account API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Logout and redirect
			await logout();
			window.location.href = '/';
		} catch (error) {
			setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa tài khoản.' });
			setIsSaving(false);
		}
	};

	return (
		<div className="py-6">
			<div className="container-page grid gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
							<Settings className="h-6 w-6" />
							Cài đặt
						</h1>
						<p className="text-muted-foreground">Quản lý cài đặt tài khoản và ứng dụng</p>
					</div>
				</div>

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

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
										<Label>Email notifications</Label>
										<p className="text-sm text-muted-foreground">
											Nhận thông báo qua email
										</p>
									</div>
									<Switch
										checked={notifications.email}
										onCheckedChange={(checked) => 
											setNotifications(prev => ({ ...prev, email: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Push notifications</Label>
										<p className="text-sm text-muted-foreground">
											Nhận thông báo đẩy trên trình duyệt
										</p>
									</div>
									<Switch
										checked={notifications.push}
										onCheckedChange={(checked) => 
											setNotifications(prev => ({ ...prev, push: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Deployment updates</Label>
										<p className="text-sm text-muted-foreground">
											Thông báo khi deployment hoàn thành
										</p>
									</div>
									<Switch
										checked={notifications.deployments}
										onCheckedChange={(checked) => 
											setNotifications(prev => ({ ...prev, deployments: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Error alerts</Label>
										<p className="text-sm text-muted-foreground">
											Thông báo khi có lỗi xảy ra
										</p>
									</div>
									<Switch
										checked={notifications.errors}
										onCheckedChange={(checked) => 
											setNotifications(prev => ({ ...prev, errors: checked }))
										}
									/>
								</div>
							</div>
							
							<Button 
								onClick={() => handleSaveSettings('thông báo')} 
								disabled={isSaving}
								className="w-full gap-2"
							>
								<Save className="h-4 w-4" />
								Lưu cài đặt thông báo
							</Button>
						</CardContent>
					</Card>

					{/* Privacy */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
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
										checked={privacy.profilePublic}
										onCheckedChange={(checked) => 
											setPrivacy(prev => ({ ...prev, profilePublic: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Hiển thị email</Label>
										<p className="text-sm text-muted-foreground">
											Hiển thị email trong hồ sơ công khai
										</p>
									</div>
									<Switch
										checked={privacy.showEmail}
										onCheckedChange={(checked) => 
											setPrivacy(prev => ({ ...prev, showEmail: checked }))
										}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Analytics</Label>
										<p className="text-sm text-muted-foreground">
											Cho phép thu thập dữ liệu phân tích
										</p>
									</div>
									<Switch
										checked={privacy.analytics}
										onCheckedChange={(checked) => 
											setPrivacy(prev => ({ ...prev, analytics: checked }))
										}
									/>
								</div>
							</div>
							
							<Button 
								onClick={() => handleSaveSettings('quyền riêng tư')} 
								disabled={isSaving}
								className="w-full gap-2"
							>
								<Save className="h-4 w-4" />
								Lưu cài đặt quyền riêng tư
							</Button>
						</CardContent>
					</Card>

					{/* Security */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5" />
								Bảo mật
							</CardTitle>
							<CardDescription>
								Bảo vệ tài khoản của bạn
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Xác thực 2 yếu tố</Label>
										<p className="text-sm text-muted-foreground">
											Thêm lớp bảo mật cho tài khoản
										</p>
									</div>
									<Switch
										checked={security.twoFactor}
										onCheckedChange={(checked) => 
											setSecurity(prev => ({ ...prev, twoFactor: checked }))
										}
									/>
								</div>
								
								<div className="space-y-2">
									<Label>Thời gian hết phiên</Label>
									<Select 
										value={security.sessionTimeout} 
										onValueChange={(value) => 
											setSecurity(prev => ({ ...prev, sessionTimeout: value }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">1 giờ</SelectItem>
											<SelectItem value="8">8 giờ</SelectItem>
											<SelectItem value="24">24 giờ</SelectItem>
											<SelectItem value="168">7 ngày</SelectItem>
										</SelectContent>
									</Select>
								</div>
								
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Cảnh báo đăng nhập</Label>
										<p className="text-sm text-muted-foreground">
											Thông báo khi có đăng nhập mới
										</p>
									</div>
									<Switch
										checked={security.loginAlerts}
										onCheckedChange={(checked) => 
											setSecurity(prev => ({ ...prev, loginAlerts: checked }))
										}
									/>
								</div>
							</div>
							
							<Separator />
							
							<div className="space-y-4">
								<Button 
									onClick={handleChangePassword} 
									disabled={isSaving}
									variant="outline"
									className="w-full gap-2"
								>
									<Key className="h-4 w-4" />
									Đổi mật khẩu
								</Button>
								
								<Button 
									onClick={() => handleSaveSettings('bảo mật')} 
									disabled={isSaving}
									className="w-full gap-2"
								>
									<Save className="h-4 w-4" />
									Lưu cài đặt bảo mật
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Danger Zone */}
					<Card className="border-red-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-600">
								<AlertCircle className="h-5 w-5" />
								Vùng nguy hiểm
							</CardTitle>
							<CardDescription>
								Hành động không thể hoàn tác
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="p-4 border border-red-200 rounded-lg bg-red-50">
								<h4 className="font-medium text-red-800 mb-2">Xóa tài khoản</h4>
								<p className="text-sm text-red-700 mb-4">
									Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. 
									Hành động này không thể hoàn tác.
								</p>
								<Button 
									onClick={handleDeleteAccount} 
									disabled={isSaving}
									variant="destructive"
									className="gap-2"
								>
									<Trash2 className="h-4 w-4" />
									Xóa tài khoản
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}