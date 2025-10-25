import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "ed_auth";

export function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	
	// Define protected routes and their required roles
	const protectedRoutes = {
		"/dashboard": ["user", "admin"],
		"/apps": ["user", "admin"],
		"/logs": ["user", "admin"],
		"/settings": ["user", "admin"],
		"/profile": ["user", "admin"],
		"/admin": ["admin"], // Only admin can access
	};
	
	// Check if current path requires authentication
	const requiredRoute = Object.keys(protectedRoutes).find(route => 
		path === route || path.startsWith(route + "/")
	);
	
	if (!requiredRoute) {
		return NextResponse.next();
	}
	
	const requiredRoles = protectedRoutes[requiredRoute as keyof typeof protectedRoutes];
	
	// TODO: When backend is ready, uncomment this section
	// const authToken = req.cookies.get(AUTH_COOKIE)?.value;
	// if (!authToken) {
	// 	const url = new URL("/login", req.url);
	// 	url.searchParams.set("from", req.nextUrl.pathname);
	// 	return NextResponse.redirect(url);
	// }
	
	// TODO: Verify token and get user role from backend
	// const userRole = await verifyTokenAndGetRole(authToken);
	// if (!requiredRoles.includes(userRole)) {
	// 	return NextResponse.redirect(new URL("/unauthorized", req.url));
	// }
	
	// For now, temporarily disabled for UI development
	// This allows access to all routes during development
	
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|public).*)",
	],
};
