import { z } from "zod";
import { Prisma } from "@prisma/client";
import { catalogError, methodNotAllowed, publicCatalogHeaders, serializeCatalogProduct } from "@/lib/catalog-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(100).optional(),
  min: z.coerce.number().finite().min(0).optional(),
  max: z.coerce.number().finite().min(0).optional(),
  availability: z.enum(["available", "out"]).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: Request) {
  const params = Object.fromEntries([...new URL(request.url).searchParams.entries()].filter(([, value]) => value.trim() !== ""));
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return Response.json({ error: "Invalid catalog query." }, { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }

  const { q, category, min, max, availability, sort, page } = parsed.data;
  const where = {
    active: true,
    ...(q ? { OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { brand: { contains: q, mode: "insensitive" as const } },
      { sku: { contains: q, mode: "insensitive" as const } },
    ] } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(min !== undefined || max !== undefined ? { price: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}),
    ...(availability === "available" ? { inventory: { quantity: { gt: 0 } } } : {}),
    ...(availability === "out" ? { inventory: { quantity: 0 } } : {}),
  };
  const orderBy = sort === "price-asc" ? { price: "asc" as const }
    : sort === "price-desc" ? { price: "desc" as const }
    : sort === "rating" ? { reviews: { _count: "desc" as const } }
    : { createdAt: "desc" as const };
  const take = 12;

  try {
    const ratingOrderedIds = sort === "rating" ? await (async () => {
      const conditions: Prisma.Sql[] = [Prisma.sql`p.active = TRUE`];
      if (q) {
        const term = `%${q}%`;
        conditions.push(Prisma.sql`(p.name ILIKE ${term} OR p.description ILIKE ${term} OR p.brand ILIKE ${term} OR p.sku ILIKE ${term})`);
      }
      if (category) conditions.push(Prisma.sql`c.slug = ${category}`);
      if (min !== undefined) conditions.push(Prisma.sql`p.price >= ${min}`);
      if (max !== undefined) conditions.push(Prisma.sql`p.price <= ${max}`);
      if (availability === "available") conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "Inventory" i WHERE i."productId" = p.id AND i.quantity > 0)`);
      if (availability === "out") conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "Inventory" i WHERE i."productId" = p.id AND i.quantity = 0)`);
      const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT p.id
        FROM "Product" p
        JOIN "Category" c ON c.id = p."categoryId"
        LEFT JOIN (
          SELECT "productId", AVG(rating)::float AS average_rating
          FROM "Review"
          WHERE status = 'APPROVED'
          GROUP BY "productId"
        ) r ON r."productId" = p.id
        WHERE ${Prisma.join(conditions, " AND ")}
        ORDER BY COALESCE(r.average_rating, 0) DESC, p."createdAt" DESC
        LIMIT ${take} OFFSET ${(page - 1) * take}
      `);
      return rows.map((row) => row.id);
    })() : null;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, ...(ratingOrderedIds ? { id: { in: ratingOrderedIds } } : {}) },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 4 },
          inventory: { select: { quantity: true } },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
        orderBy: sort === "rating" ? { createdAt: "desc" } : orderBy,
        skip: sort === "rating" ? 0 : (page - 1) * take,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    if (ratingOrderedIds) {
      const rank = new Map(ratingOrderedIds.map((id, index) => [id, index]));
      products.sort((first, second) => (rank.get(first.id) ?? 0) - (rank.get(second.id) ?? 0));
    }
    return Response.json({ data: products.map(serializeCatalogProduct), total, page, pageSize: take }, { headers: publicCatalogHeaders });
  } catch {
    return catalogError();
  }
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }