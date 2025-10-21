# User Management Module - Frontend Implementation

## 📁 Cấu trúc Files đã tạo

```
easydeploy-frontend/
├── types/
│   └── user-management.ts                          ✅ Types & Interfaces
│
├── services/
│   └── user-management.service.ts                  ✅ API Service Layer
│
├── hooks/
│   ├── useUsers.ts                                 ✅ Hook fetch danh sách users
│   ├── useUserDetail.ts                            ✅ Hook fetch chi tiết user
│   └── useUserActions.ts                           ✅ Hook cho actions (ban, suspend, etc.)
│
├── utils/
│   └── user-management.utils.ts                    ✅ Utility functions
│
├── app/(dashboard)/admin/users/
│   ├── page.tsx                                    ✅ Danh sách users page
│   └── [userId]/
│       └── page.tsx                                ✅ Chi tiết user page
│
└── components/admin/users/
    ├── UserFiltersBar.tsx                          ✅ Filter bar component
    ├── UserTable.tsx                               ✅ Table component
    ├── UserTableRowActions.tsx                     ✅ Row actions dropdown
    ├── UserActionButtons.tsx                       ✅ Action buttons
    ├── BanUserModal.tsx                            ✅ Ban user modal
    ├── SuspendUserModal.tsx                        ✅ Suspend user modal
    ├── DeleteUserModal.tsx                         ✅ Delete user modal
    └── ActivateUserModal.tsx                       ✅ Activate user modal
```

## 🎯 Tính năng đã Implement

### 1. **Danh sách Users** (`/admin/users`)
- ✅ Table hiển thị users với avatar, email, GitHub, status, roles, projects
- ✅ Filter theo status (All, Active, Banned, Suspended, Deleted)
- ✅ Search theo email hoặc username
- ✅ Sort theo created date, email, projects count
- ✅ Pagination
- ✅ Quick actions trên mỗi row

### 2. **Chi tiết User** (`/admin/users/[userId]`)
- ✅ Thông tin đầy đủ user (avatar, email, GitHub, status)
- ✅ Stats cards (Total Projects, Active Projects, Login Count, Last IP)
- ✅ Admin action buttons (Edit, Ban, Suspend, Delete, Activate)

### 3. **User Actions** (theo UC06)
- ✅ **Ban User**: Khóa vĩnh viễn, thu hồi token, dừng projects
- ✅ **Suspend User**: Tạm khóa, có thể activate lại
- ✅ **Delete User**: Xóa vĩnh viễn (cần check projects)
- ✅ **Activate User**: Mở khóa tài khoản
- ✅ Tất cả actions đều yêu cầu nhập reason
- ✅ Toast notifications khi thành công/thất bại
- ✅ Refresh data sau khi action

### 4. **UI/UX Features**
- ✅ Status badges với màu sắc phù hợp (Green/Yellow/Orange/Red)
- ✅ Confirmation modals với thông tin chi tiết effects
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

## 🔗 API Endpoints Mapping

| Frontend Service | Backend Endpoint | Method |
|-----------------|------------------|--------|
| `getAllUsers()` | `/api/v1/admin/users` | GET |
| `getUserById()` | `/api/v1/admin/users/{userId}` | GET |
| `updateUser()` | `/api/v1/admin/users/{userId}` | PUT |
| `banUser()` | `/api/v1/admin/users/{userId}/ban` | POST |
| `suspendUser()` | `/api/v1/admin/users/{userId}/suspend` | POST |
| `deleteUser()` | `/api/v1/admin/users/{userId}` | DELETE |
| `activateUser()` | `/api/v1/admin/users/{userId}/activate` | POST |

## 📦 Dependencies Cần Có

Các UI components từ shadcn/ui (cần install nếu chưa có):

```bash
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add dropdown-menu
```

NPM packages:

```bash
npm install swr lucide-react
npm install sonner  # For toast notifications
```

## 🚀 Cách sử dụng

### 1. Đảm bảo Backend đang chạy
```bash
cd easydeploy-backend
mvn spring-boot:run
```

### 2. Kiểm tra API base URL trong `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run Frontend
```bash
cd easydeploy-frontend
npm run dev
```

### 4. Truy cập
- Danh sách users: `http://localhost:3000/admin/users`
- Chi tiết user: `http://localhost:3000/admin/users/ezdpl000001`

## ⚠️ Missing UI Components

Các components này cần được tạo nếu chưa có trong project:

1. **Pagination Component** (`@/components/ui/pagination`)
   - Tạm thời có thể comment out pagination trong UserTable

2. **Dialog Component** (`@/components/ui/dialog`)
   - Cần thiết cho modals
   - Install: `npx shadcn@latest add dialog`

3. **Dropdown Menu Component** (`@/components/ui/dropdown-menu`)
   - Dùng cho row actions
   - Install: `npx shadcn@latest add dropdown-menu`

4. **Textarea Component** (`@/components/ui/textarea`)
   - Dùng trong modals (reason input)
   - Install: `npx shadcn@latest add textarea`

## 🔐 Authorization

Đảm bảo middleware check role ADMIN:

```typescript
// middleware.ts
if (pathname.startsWith('/admin')) {
  const user = await getUser(token);
  if (!user || !user.roles.includes('ADMIN')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
}
```

## 🧪 Testing Checklist

- [ ] Load danh sách users
- [ ] Filter by status
- [ ] Search by keyword
- [ ] Sort by các fields
- [ ] Pagination
- [ ] View user detail
- [ ] Ban user (check modal, toast, refresh)
- [ ] Suspend user
- [ ] Delete user (check error nếu có active projects)
- [ ] Activate user
- [ ] Edit user (TODO - chưa implement edit form)

## 📝 TODO

Các tính năng chưa implement (có thể làm thêm):

1. **Edit User Form** (`/admin/users/[userId]/edit`)
   - Form cập nhật email, roles, GitHub username
   - Validation

2. **Projects List** trong user detail
   - Danh sách projects của user
   - Link đến project detail

3. **Activity Log Timeline**
   - History các actions (login, create project, etc.)
   - Cần backend API riêng

4. **Bulk Actions**
   - Select multiple users
   - Bulk ban/suspend/delete

5. **Advanced Filters**
   - Filter by role
   - Filter by project count
   - Date range filter

6. **Export**
   - Export user list to CSV/Excel

## 🎨 UI Customization

Có thể tùy chỉnh colors trong `utils/user-management.utils.ts`:

```typescript
export const getStatusColor = (status: UserStatus): string => {
  // Thay đổi màu sắc badges ở đây
}
```

## 📞 Support

Nếu gặp lỗi compile:
1. Check tất cả imports
2. Đảm bảo đã install shadcn/ui components
3. Check tsconfig.json có `"@/*"` alias
4. Restart dev server: `npm run dev`

---

**Status**: ✅ Core features implemented theo UC06
**Next Steps**: Test với backend API thật và implement edit form
