import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, Heart, PackageCheck, ShieldCheck, Star } from "lucide-react";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";
import { ProductCard } from "@/components/product-card";
import { ReviewEntry } from "@/components/review-entry";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug, active: true }, include: { category: true, images: { orderBy: { position: "asc" } }, inventory: true, reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 } } });
  if (!product) notFound();
  const quantity = product.inventory?.quantity ?? 0;
  const rating = product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0;
  const related = await prisma.product.findMany({ where: { active: true, categoryId: product.categoryId, id: { not: product.id } }, include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true }, take: 4, orderBy: { createdAt: "desc" } });

  return <div className="container">
    <div className="page-header" style={{ paddingBottom: 0 }}><span className="eyebrow"><Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link></span></div>
    <section className="detail-grid">
      <div><div className="detail-image"><Image src={product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85"} alt={product.images[0]?.alt ?? product.name} fill sizes="(max-width: 700px) 100vw, 50vw" priority /></div>{product.images.length > 1 && <div className="detail-thumbnails" aria-label="Product image gallery">{product.images.slice(1).map((image) => <div className="detail-thumbnail" key={image.id}><Image src={image.url} alt={image.alt} fill sizes="150px" /></div>)}</div>}</div>
      <div className="detail-copy"><span className="product-brand">{product.brand}</span><h1>{product.name}</h1>
        <div className="product-rating"><Star size={14} fill="currentColor" /> {rating ? rating.toFixed(1) : "New"} <span>({product.reviews.length} reviews)</span></div>
        <div className="detail-price">₹{Number(product.price).toLocaleString("en-IN")}</div>{product.originalPrice && <span className="detail-original">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>}
        <p className="detail-description">{product.description}</p>
        <div className="product-stock">{quantity === 0 ? "Out of stock" : quantity <= 5 ? `Only ${quantity} left in stock` : "In stock and ready to ship"}</div>
        <div className="detail-actions"><form action={addToCartAction}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="quantity" value="1" /><button className="button-primary" type="submit" disabled={quantity === 0}>Add to bag · ₹{Number(product.price).toLocaleString("en-IN")}</button></form><form action={toggleWishlistAction}><input type="hidden" name="productId" value={product.id} /><button className="button-light" type="submit" aria-label="Add to wishlist"><Heart size={17} /></button></form></div>
        <div className="info-row"><div className="info-chip"><PackageCheck size={16} /> {quantity > 5 ? "In stock" : quantity > 0 ? "Low stock" : "Sold out"}</div><div className="info-chip"><TruckIcon /> Free over ₹2,500</div><div className="info-chip"><ShieldCheck size={16} /> Easy returns</div></div>
        <div className="detail-sku">SKU: {product.sku} <span style={{ marginLeft: 15 }}>Brand: {product.brand}</span></div>
      </div>
    </section>
    <section className="section" style={{ paddingTop: 5 }}><div className="section-heading"><div><span className="eyebrow">Real words, real people</span><h2>Customer reviews</h2></div></div>
      <ReviewEntry productId={product.id} />
      {product.reviews.length ? <div className="review-list">{product.reviews.map((review) => <article className="review-row" key={review.id}><div className="quote-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><h3>{review.title}</h3><p>{review.comment}</p><span className="product-brand">{review.user.name ?? "NovaCart customer"} · {review.createdAt.toLocaleDateString("en-IN")}</span></article>)}</div> : <div className="empty-state"><h2>Be the first to share a thought</h2><p>Thoughtful reviews help everyone find their next favorite.</p><Link className="text-link" href="/login">Sign in to review</Link></div>}
    </section>
    {related.length > 0 && <section className="section" style={{ paddingTop: 0 }}><div className="section-heading"><div><span className="eyebrow">More to love</span><h2>Related finds</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={{ id: item.id, slug: item.slug, name: item.name, brand: item.brand, price: Number(item.price), image: item.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", stock: item.inventory?.quantity ?? 0 }} />)}</div></section>}
  </div>;
}

function TruckIcon() { return <BadgeCheck size={16} />; }