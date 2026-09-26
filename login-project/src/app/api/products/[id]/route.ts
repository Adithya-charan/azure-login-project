import { catalogError, methodNotAllowed, publicCatalogHeaders, serializeCatalogProduct } from "@/lib/catalog-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findFirst({
      where: { active: true, OR: [{ id }, { slug: id }] },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: "asc" } },
        inventory: { select: { quantity: true } },
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
    });
    if (!product) return Response.json({ error: "Product not found." }, { status: 404, headers: publicCatalogHeaders });
    return Response.json(serializeCatalogProduct(product), { headers: publicCatalogHeaders });
  } catch {
    return catalogError();
  }
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }