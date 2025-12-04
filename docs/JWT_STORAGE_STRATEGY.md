# JWT Token Storage Strategy

## Overview

Trong project EasyDeploy Frontend, JWT token được trả về từ server sau khi đăng nhập/đăng ký và được client lưu trữ để sử dụng cho các API requests tiếp theo.

## Vị trí lưu trữ JWT Token

### Primary Storage: Zustand Persist với localStorage

**JWT token được lưu trong Zustand store với Zustand persist middleware.**

- **Storage Key**: `auth-storage`
- **Location**: Browser localStorage
- **Implementation**: `/store/useAuthStore.ts`

#### Cấu trúc dữ liệu được lưu:
```json
{
  "state": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "githubUsername": "username",
      "avatarUrl": "https://...",
      "roles": ["ADMIN", "DEVELOPER"],
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isAuthenticated": true
  },
  "version": 0
}
```

### Tại sao chọn Zustand Persist?

1. **Single Source of Truth**: Tất cả auth state (user info, token, authentication status) được quản lý tập trung
2. **Type Safety**: TypeScript types được enforce tự động qua Zustand
3. **Automatic Persistence**: Tự động sync giữa memory state và localStorage
4. **Hydration Support**: Hỗ trợ SSR/SSG với Next.js thông qua `skipHydration` option
5. **State Management**: Tích hợp sẵn với React state management ecosystem

## Flow hoạt động

### 1. Login/Register Flow

```typescript
// hooks/useAuth.ts
const handleLogin = async (email: string, password: string) => {
  const response = await AuthService.login({ email, password });
  
  // Convert backend response to frontend format
  const user: User = {
    id: response.userId,
    email: response.email,
    roles: normalizeRoles(response.roles),
    // ...
  };
  
  // Lưu vào Zustand store (tự động persist vào localStorage)
  login(user, response.token);
};
```

### 2. API Request Flow

```typescript
// services/api.ts
api.interceptors.request.use((config) => {
  // Đọc token từ Zustand persist storage
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    if (parsed.state?.token) {
      config.headers.Authorization = `Bearer ${parsed.state.token}`;
    }
  }
  return config;
});
```

### 3. WebSocket Connection Flow

```typescript
// hooks/useLogStream.ts
const getToken = () => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    return state?.token;
  }
  return null;
};
```

### 4. Logout Flow

```typescript
// services/auth.service.ts
logout: async () => {
  // Call backend logout endpoint
  await api.post("/auth/logout");
  
  // Zustand store sẽ tự động clear localStorage khi logout() được gọi
  useAuthStore.getState().logout();
};
```

## Backward Compatibility

Để đảm bảo tương thích ngược trong quá trình migration, một số services vẫn hỗ trợ đọc từ legacy key `auth_token`:

```typescript
// Fallback to legacy storage if Zustand storage not found
if (!config.headers.Authorization) {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
}
```

**Lưu ý**: Fallback này chỉ để đọc (read-only). Tất cả write operations chỉ sử dụng Zustand persist.

## Security Considerations

### 1. localStorage vs sessionStorage vs Cookies

**Tại sao dùng localStorage?**
- ✅ Không bị expire khi đóng tab/browser (better UX)
- ✅ Dễ dàng access từ JavaScript
- ✅ Không gửi kèm mọi request (giảm bandwidth)

**Trade-offs:**
- ⚠️ Dễ bị XSS attacks nếu có vulnerability trong code
- ⚠️ Không thể set HttpOnly flag

**Mitigations:**
- ✅ Content Security Policy (CSP) headers
- ✅ Input validation và sanitization
- ✅ Regular security audits
- ✅ Token expiration và refresh mechanisms

### 2. Token Expiration

Token nên có expiration time hợp lý (e.g., 24 hours) và implement refresh token mechanism để renew token mà không cần user login lại.

### 3. Sensitive Data

**KHÔNG** lưu sensitive data như password, credit card info trong localStorage. Chỉ lưu JWT token và public user information.

## Migration từ legacy storage

Nếu application đang sử dụng `localStorage.getItem("auth_token")`, migrate theo steps:

1. ✅ **Đã implement**: Zustand persist storage đang hoạt động
2. ✅ **Đã implement**: Fallback reads từ legacy `auth_token` key
3. 🔄 **In progress**: Remove các direct writes vào `auth_token`
4. ⏭️ **Future**: Remove fallback reads sau khi ensure tất cả users đã migrate

## Code Examples

### Đọc token trong component
```typescript
import { useAuthStore } from '@/store/useAuthStore';

function MyComponent() {
  const { token, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || !token) {
    return <div>Please login</div>;
  }
  
  // Use token...
}
```

### Đọc token ngoài React component
```typescript
import { useAuthStore } from '@/store/useAuthStore';

// Trong service/utility function
const token = useAuthStore.getState().token;
```

### Check authentication status
```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { isAuthenticated, user, hasRole, isAdmin } = useAuthStore();

if (isAdmin()) {
  // Admin-only logic
}
```

## Testing

Khi test components/services sử dụng auth:

```typescript
import { useAuthStore } from '@/store/useAuthStore';

beforeEach(() => {
  // Setup mock auth state
  useAuthStore.setState({
    user: mockUser,
    token: 'mock-token',
    isAuthenticated: true,
  });
});

afterEach(() => {
  // Cleanup
  useAuthStore.getState().logout();
});
```

## Future Improvements

1. **HttpOnly Cookies**: Consider migrate to HttpOnly cookies for better XSS protection
2. **Refresh Token**: Implement refresh token mechanism
3. **Token Encryption**: Consider encrypting token before storing in localStorage
4. **Multiple Tabs Sync**: Use BroadcastChannel API to sync auth state across tabs
5. **Secure Context**: Ensure app only runs in secure context (HTTPS)

## References

- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
