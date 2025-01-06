import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/pocketbase";

// For protected pages
// If auth is not valid for matching routes
// Redirect to a redirect path
export async function middleware(request: NextRequest) {
  let isTokenConfirmed = false;
  let response = NextResponse.next();

  const cookieStore = await cookies();

  const pb = createServerClient(cookieStore);

  if (pb.authStore.isValid) {
    try {
      await pb.collection("users").authRefresh();
      isTokenConfirmed = true;
    } catch {
      pb.authStore.clear();
      isTokenConfirmed = false;
    }
  }

  if (
    !isTokenConfirmed &&
    !["/", "/login", "/register"].includes(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    response = NextResponse.redirect(url);
  } else if (
    isTokenConfirmed &&
    ["/", "/login", "/register"].includes(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    response = NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login route)
     * - / (root path)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
