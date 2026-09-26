import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  return <div className="container"><header className="page-header"><span className="eyebrow">Find your next favorite</span><h1>Shop by category</h1><p>From daily essentials to just-because treats, there’s something good in every corner.</p></header>
    {categories.length ? <div className="category-grid" style={{ paddingBottom: 75 }}>{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="category-tile" style={{ minHeight: 250, backgroundImage: `url("${category.image || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80"}")` }}><strong>{category.name}</strong><span>{category._count.products} picks <ArrowRight size={13} /></span></Link>)}</div> : <div className="empty-state"><h2>Categories are on their way</h2><p>Run the seed command to add the NovaCart collection.</p></div>}
  </div>;
}