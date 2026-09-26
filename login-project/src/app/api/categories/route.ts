import { methodNotAllowed, publicCatalogHeaders } from "@/lib/catalog-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true, image: true, _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: "asc" },
    });
    return Response.json({ data: categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products })) }, { headers: publicCatalogHeaders });
  } catch {
    return Response.json({ error: "Catalog is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }