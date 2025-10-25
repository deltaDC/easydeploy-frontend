"use client";
import { useState } from "react";
import { GithubService } from "@/services/github.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail, Check } from "lucide-react";

interface EmailUpdateAlertProps {
	email: string;
	onEmailUpdated?: (newEmail: string) => void;
}

export function EmailUpdateAlert({ email, onEmailUpdated }: EmailUpdateAlertProps) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleUpdateEmail = async () => {
		if (!newEmail.trim()) {
			setError("Vui lòng nhập email mới");
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newEmail)) {
			setError("Email không hợp lệ");
			return;
		}

		setIsUpdating(true);
		setError("");

		try {
			await GithubService.updateFallbackEmail(newEmail);
			setSuccess(true);
			onEmailUpdated?.(newEmail);
		} catch (err: any) {
			setError(err.response?.data?.error || "Có lỗi xảy ra khi cập nhật email");
		} finally {
			setIsUpdating(false);
		}
	};

	if (success) {
		return (
			<Alert className="border-green-200 bg-green-50">
				<Check className="h-4 w-4 text-green-600" />
				<AlertDescription className="text-green-800">
					Email đã được cập nhật thành công thành: <strong>{newEmail}</strong>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert className="border-orange-200 bg-orange-50">
			<AlertCircle className="h-4 w-4 text-orange-600" />
			<AlertDescription className="text-orange-800">
				<div className="space-y-3">
					<div>
						<p className="font-medium">Email tạm thời từ GitHub</p>
						<p className="text-sm">
							Bạn đang sử dụng email tạm thời: <strong>{email}</strong>
						</p>
						<p className="text-sm">
							Để nhận thông báo và liên lạc tốt hơn, hãy cập nhật email thật của bạn.
						</p>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="new-email">Email mới</Label>
						<div className="flex gap-2">
							<Input
								id="new-email"
								type="email"
								placeholder="your-email@example.com"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								disabled={isUpdating}
								className="flex-1"
							/>
							<Button
								onClick={handleUpdateEmail}
								disabled={isUpdating || !newEmail.trim()}
								size="sm"
							>
								{isUpdating ? "Đang cập nhật..." : "Cập nhật"}
							</Button>
						</div>
						
						{error && (
							<p className="text-sm text-red-600">{error}</p>
						)}
					</div>
				</div>
			</AlertDescription>
		</Alert>
	);
}
