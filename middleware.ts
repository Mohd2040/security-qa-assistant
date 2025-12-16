import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protect Admin-only Routes (Users, Logs, Monitoring, Reports)
        // Other pages like /admin/qa, /admin/match-answers, /admin/import are accessible to all authenticated users
        const adminOnlyRoutes = [
            "/admin",  // Admin Dashboard - admin only
            "/admin/users",  // User Management - admin only
            "/admin/logs",  // System Logs - admin only
            "/admin/monitoring",  // Infrastructure Monitoring - admin only
            "/admin/reports",  // Reports - admin only
            "/admin/prepare",  // Prepare - admin only
            "/admin/import"   // Import - admin only
        ];

        const isAdminOnlyRoute = adminOnlyRoutes.some(route => {
            // Exact match for /admin, startsWith for sub-routes
            return path === route || (route !== "/admin" && path.startsWith(route));
        });

        if (isAdminOnlyRoute && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/search", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*"],
};
