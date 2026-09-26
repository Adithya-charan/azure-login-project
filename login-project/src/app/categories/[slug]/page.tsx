import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, include: { products: { where: { active: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { createdAt: "desc" }, take: 48 } } });
  if (!category) notFound();
  return <div className="container"><header className="page-header"><span className="eyebrow">Browse NovaCart</span><h1>{category.name}</h1><p>{category.description}</p></header>
    {category.products.length ? <div className="product-grid" style={{ paddingBottom: 70 }}>{category.products.map((product) => <ProductCard key={product.id} product={{ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: Number(product.price), image: product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", stock: product.inventory?.quantity ?? 0, rating: product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 4.8, reviewCount: product.reviews.length }} />)}</div> : <div className="empty-state"><h2>More good things coming soon</h2><p>There are no products in this category yet.</p></div>}
  </div>;
}