# EasyDeploy Frontend (Next.js 15)

EasyDeploy là nền tảng giúp developer tự động triển khai ứng dụng web bằng GitHub repo hoặc Docker image. Frontend này được xây bằng Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Zustand v5, SWR và Axios.

## 📚 Documentation

- **[JWT Storage Strategy](/docs/JWT_STORAGE_STRATEGY.md)** - Hướng dẫn chi tiết về cách JWT tokens được lưu trữ và quản lý

## Mục tiêu (MVP)
- Đăng ký/Đăng nhập, OAuth GitHub (callback scaffold)
- Kết nối GitHub, chọn repository
- Tạo Deploy (từ Repo hoặc Docker image)
- Xem trạng thái, log, danh sách ứng dụng

## Kiến trúc & Thư mục
```
 easydeploy-frontend/
 ├─ app/
 │  ├─ layout.tsx                 Root layout
 │  ├─ page.tsx                   Landing page
 │  ├─ (auth)/                    Nhóm route auth
 │  │  ├─ login/page.tsx
 │  │  ├─ register/page.tsx
 │  │  └─ callback/github/page.tsx
 │  ├─ (dashboard)/               Nhóm route dashboard
 │  │  ├─ layout.tsx
 │  │  ├─ page.tsx                Overview (Usage, Recent, Projects)
 │  │  └─ apps/
 │  │     ├─ page.tsx             Danh sách Apps + toolbar/bảng
 │  │     ├─ new/page.tsx         Form Deploy mới (2 cột)
 │  │     └─ [appId]/
 │  │        ├─ page.tsx          Thông tin app
 │  │        └─ log/page.tsx      Log realtime (placeholder)
 │  ├─ error.tsx                  Global error boundary
 │  └─ not-found.tsx              404
 │
 ├─ components/
 │  ├─ layout/                    Navbar, Dashboard layout, PageHeader
 │  ├─ tables/                    ProjectsTable (toolbar + list/grid)
 │  └─ ui/                        Button, Card...
 │
 ├─ services/                     Axios instance + domain services
 │  ├─ api.ts
 │  ├─ auth.service.ts
 │  ├─ github.service.ts
 │  └─ deploy.service.ts
 │
 ├─ store/                        Zustand stores (auth, apps, logs, theme)
 ├─ hooks/                        useFetch(SWR), useAuth, useDeployStatus, useWebSocket
 ├─ types/                        Kiểu dữ liệu: user, repo, app, log
 ├─ utils/                        constants, helpers
 ├─ styles/                       globals.css (Tailwind v4)
 ├─ public/                       Logo & images
 ├─ middleware.ts                 Auth guard (đang tắt để review UI)
├─ postcss.config.js             ESM + @tailwindcss/postcss
├─ next.config.mjs               Next.js config (ESM)
├─ tsconfig.json                 TS config (Next.js plugin)
├─ eslint.config.mjs             ESLint v9 (flat config)
 └─ package.json
```

## Yêu cầu môi trường
- Node.js 18+ (khuyến nghị 20+)
- NPM 9+/PNPM/Yarn (repo dùng NPM mặc định)

## Thiết lập lần đầu (sau khi clone/pull)
1) Cài dependencies:
```
npm install
```
2) Thiết lập biến môi trường (tạo file `.env.local` nếu cần):
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
3) Chạy dev:
```
npm run dev
```
Truy cập `http://localhost:3000`.

4) Build & chạy production:
```
npm run build
npm run start
```

## Ghi chú triển khai
- **JWT Token Storage**: JWT tokens từ server được lưu trong Zustand store với persist middleware (localStorage key: `auth-storage`). Xem chi tiết tại `/docs/JWT_STORAGE_STRATEGY.md`.
- `middleware.ts` hiện đang comment chặn auth để dễ demo UI; khi tích hợp backend, bật lại kiểm tra cookie `ed_auth`.
- Trang `/(auth)/callback/github` đã bọc Suspense và có redirect; cần backend endpoint để exchange `code` -> token và set cookie.
- Dynamic routes trên Next 15 dùng `params: Promise<...>` với React 19: các page `apps/[appId]` và `apps/[appId]/log` đã cập nhật dùng `use(params)`.
- Đã thêm Axios interceptor xử lý chung status code tại `services/api.ts`.
