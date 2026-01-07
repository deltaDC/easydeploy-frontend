/**
 * Edit User Modal
 * Modal để cập nhật thông tin user (roles)
 */

'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserDetail } from '@/types/user-management';

interface EditUserModalProps {
  user: UserDetail;
  onSuccess: () => void;
  onEdit: (roles: string[]) => Promise<void>;
}

const AVAILABLE_ROLES = [
  { value: 'ADMIN', label: 'Quản trị viên', description: 'Quyền truy cập đầy đủ hệ thống' },
  { value: 'DEVELOPER', label: 'Nhà phát triển', description: 'Có thể triển khai và quản lý ứng dụng của mình' },
];

export default function EditUserModal({ user, onSuccess, onEdit }: EditUserModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Initialize with current user roles
      setSelectedRoles(Array.from(user.roles));
    }
  }, [open, user.roles]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      alert('Người dùng phải có ít nhất một vai trò');
      return;
    }

    setIsLoading(true);
    try {
      await onEdit(selectedRoles);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa vai trò
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật vai trò cho <strong>{user.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-3">
              <Label>Vai trò</Label>
              {AVAILABLE_ROLES.map((role) => (
                <div key={role.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={role.value}
                    checked={selectedRoles.includes(role.value)}
                    onCheckedChange={() => handleRoleToggle(role.value)}
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={role.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {role.label}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedRoles.length === 0 && (
                <p className="text-sm text-red-500">
                Người dùng phải có ít nhất một vai trò
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || selectedRoles.length === 0}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
