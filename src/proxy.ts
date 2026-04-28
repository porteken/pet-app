import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const staticFiles = ["/robots.txt", "/sitemap.xml"];
  if (staticFiles.includes(pathname)) {
    return new NextResponse(undefined, { status: 404 });
  }

  const knownRoutes = [
    "/about",
    "/map",
    "/monitoring",
    "/rankings",
    "/plot-test",
  ];
  if (knownRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/") && pathname.length > 1) {
    const idPart = pathname.slice(1);

    if (!/^\d+$/.test(idPart)) {
      return new NextResponse(undefined, { status: 404 });
    }

    const id = Number.parseInt(idPart, 10);
    if (id <= 0) {
      return new NextResponse(undefined, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
