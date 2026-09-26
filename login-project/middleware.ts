import { NextRequest, NextResponse } from "next/server";

function isPublicCatalogPath(pathname: string) {
  return pathname === "/"
    || pathname === "/products"
    || pathname.startsWith("/products/")
    || pathname === "/categories"
    || pathname.startsWith("/categories/");
}

function isCatalogApiPath(pathname: string) {
  return pathname === "/api/products"
    || pathname.startsWith("/api/products/")
    || pathname === "/api/categories"
    || pathname.startsWith("/api/categories/");
}

export function middleware(request: NextRequest) {
  if ((request.method === "GET" || request.method === "HEAD") && isCatalogApiPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const cacheable = (request.method === "GET" || request.method === "HEAD") && isPublicCatalogPath(request.nextUrl.pathname);

  response.headers.set(
    "Cache-Control",
    cacheable ? "public, max-age=0, s-maxage=60, must-revalidate" : "private, no-store, max-age=0",
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};