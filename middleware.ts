import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "ed_auth";

export function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const dashboardPaths = [
		"/apps",
		"/logs",
		"/settings",
		"/admin",
	];
	const isDashboard = dashboardPaths.some((p) => path === p || path.startsWith(p + "/"));
	if (!isDashboard) return NextResponse.next();

	// Temporarily disabled for UI review
	// const hasAuth = req.cookies.get(AUTH_COOKIE)?.value;
	// if (!hasAuth) {
	// 	const url = new URL("/login", req.url);
	// 	url.searchParams.set("from", req.nextUrl.pathname);
	// 	return NextResponse.redirect(url);
	// }
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
