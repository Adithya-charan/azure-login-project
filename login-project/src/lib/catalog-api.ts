import type { Prisma } from "@prisma/client";

export const publicCatalogHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=60, must-revalidate",
};

export const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  description: string;
  price: Prisma.Decimal;
  originalPrice: Prisma.Decimal | null;
  category?: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string; position: number }[];
  inventory: { quantity: number } | null;
  reviews?: { rating: number }[];
  updatedAt: Date;
};

export function serializeCatalogProduct(product: CatalogProduct) {
  const ratings = product.reviews ?? [];
  const quantity = product.inventory?.quantity ?? 0;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    category: product.category,
    images: product.images.map(({ url, alt, position }) => ({ url, alt, position })),
    inventory: { quantity, availability: quantity === 0 ? "OUT_OF_STOCK" : quantity <= 5 ? "LOW_STOCK" : "IN_STOCK" },
    rating: ratings.length ? ratings.reduce((total, review) => total + review.rating, 0) / ratings.length : null,
    reviewCount: ratings.length,
    updatedAt: product.updatedAt,
  };
}

export function catalogError() {
  return Response.json({ error: "Catalog is temporarily unavailable." }, { status: 503, headers: noStoreHeaders });
}

export function methodNotAllowed() {
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: noStoreHeaders });
}