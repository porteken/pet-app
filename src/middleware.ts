import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle static files and known routes
  const staticFiles = ["/robots.txt", "/sitemap.xml"];
  if (staticFiles.includes(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // Handle known routes that should not be processed as [id]
  const knownRoutes = ["/about", "/map"];
  if (knownRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the pathname matches the [id] pattern (should be a number)
  if (pathname.startsWith("/") && pathname.length > 1) {
    const idPart = pathname.slice(1); // Remove the leading slash

    // If it's not a valid number, return 404
    if (!/^\d+$/.test(idPart)) {
      return new NextResponse(null, { status: 404 });
    }

    // If it's 0 or negative, return 404
    const id = parseInt(idPart, 10);
    if (id <= 0) {
      return new NextResponse(null, { status: 404 });
    }
  }

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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
