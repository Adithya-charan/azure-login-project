import Link from "next/link";
import { ArrowRight, BadgeCheck, Headphones, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const categoryPhotos = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
];

export default async function HomePage() {
  const [categories, featured, popular, newest] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" }, take: 8 }),
    prisma.product.findMany({ where: { active: true, featured: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, take: 4 }),
    prisma.product.findMany({ where: { active: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { reviews: { _count: "desc" } }, take: 4 }),
    prisma.product.findMany({ where: { active: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  const toCard = (product: (typeof featured)[number], badge?: string) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: Number(product.price),
    image: product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    stock: product.inventory?.quantity ?? 0,
    rating: product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 4.8,
    reviewCount: product.reviews.length,
    badge,
  });

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-panel">
          <div className="hero-copy"><span className="eyebrow">Your everyday, considered</span><h1 id="hero-title">Small upgrades.<br />Big everyday joy.</h1><p>Useful, well-made things for the places you go and the spaces you call yours.</p><Link className="button-dark" href="/products">Shop the edit <ArrowRight size={15} /></Link></div>
          <div className="hero-photo" role="img" aria-label="Sunglasses and modern everyday accessories" />
          <div className="hero-stamp">GOOD FINDS<br />LIVE HERE<br /><span>✳</span></div>
        </div>
      </section>

      <section className="section container" aria-labelledby="category-title">
        <div className="section-heading"><div><span className="eyebrow">A little of everything</span><h2 id="category-title">Find your kind of good</h2></div><Link className="text-link" href="/categories">All categories <ArrowRight size={14} /></Link></div>
        <div className="category-grid">
          {categories.map((category, index) => <Link className="category-tile" key={category.id} href={`/categories/${category.slug}`} style={{ backgroundImage: `url("${category.image || categoryPhotos[index % categoryPhotos.length]}")` }}><strong>{category.name}</strong><span>{category._count.products} picks</span></Link>)}
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 10 }} aria-labelledby="featured-title">
        <div className="section-heading"><div><span className="eyebrow">The NovaCart shortlist</span><h2 id="featured-title">Good things, picked for you</h2><p>Customer-loved essentials worth keeping close.</p></div><Link className="text-link" href="/products?sort=rating">Shop best rated <ArrowRight size={14} /></Link></div>
        {featured.length ? <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={toCard(product, "Staff pick")} />)}</div> : <div className="empty-state"><h2>Our shortlist is taking shape</h2><p>Seed the catalog to see the first NovaCart picks here.</p><Link className="text-link" href="/products">Explore the shop <ArrowRight size={14} /></Link></div>}
      </section>

      <section className="section container" style={{ paddingTop: 0 }} aria-labelledby="popular-title">
        <div className="section-heading"><div><span className="eyebrow">Loved around here</span><h2 id="popular-title">Popular right now</h2><p>Good finds shoppers keep coming back to.</p></div><Link className="text-link" href="/products?sort=rating">Browse top rated <ArrowRight size={14} /></Link></div>
        {popular.length > 0 && <div className="product-grid">{popular.map((product) => <ProductCard key={product.id} product={toCard(product, "Popular")} />)}</div>}
      </section>

      <section className="section container" style={{ paddingTop: 0 }} aria-labelledby="arrival-title">
        <div className="section-heading"><div><span className="eyebrow">Just found its way here</span><h2 id="arrival-title">Fresh arrivals</h2></div><Link className="text-link" href="/products?sort=newest">See what’s new <ArrowRight size={14} /></Link></div>
        {newest.length > 0 && <div className="product-grid">{newest.map((product) => <ProductCard key={product.id} product={toCard(product, "Just in")} />)}</div>}
      </section>

      <section className="container section" style={{ paddingTop: 4 }}>
        <div className="promo-band"><div><span className="eyebrow" style={{ color: "var(--accent)" }}>The little extras</span><h2>Good shopping should feel good all the way home.</h2><p>Free delivery on orders above ₹2,500, easy returns and real people ready to help.</p></div><Link className="button-primary" href="/products">Shop now <ArrowRight size={15} /></Link></div>
      </section>

      <section className="section container" style={{ paddingTop: 7 }} aria-label="Customer benefits">
        <div className="benefit-grid">
          <div className="benefit"><span className="benefit-icon"><Truck size={19} /></span><h3>Delivery, made easy</h3><p>Free shipping over ₹2,500. Every order is packed with care and tracked to your door.</p></div>
          <div className="benefit"><span className="benefit-icon"><BadgeCheck size={19} /></span><h3>Only the good stuff</h3><p>Thoughtful quality checks mean fewer maybes and more things you’ll actually use.</p></div>
          <div className="benefit"><span className="benefit-icon"><Headphones size={19} /></span><h3>People who can help</h3><p>Questions before or after your order? Our small support team is here for you.</p></div>
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 0 }} aria-labelledby="love-title">
        <div className="section-heading"><div><span className="eyebrow">Notes from the good-life club</span><h2 id="love-title">A few kind words</h2></div></div>
        <div className="quote-grid"><article className="quote"><div className="quote-stars">★★★★★</div><p>“The quality is genuinely lovely. My desk feels calmer and a lot more like me.”</p><strong>Rhea M. · Pune</strong></article><article className="quote"><div className="quote-stars">★★★★★</div><p>“Found a gift in five minutes, and it arrived beautifully packed. Keeping NovaCart bookmarked.”</p><strong>Arjun K. · Bengaluru</strong></article><article className="quote"><div className="quote-stars">★★★★★</div><p>“The everyday bag I didn’t know I needed. Great details, fair price, zero fuss.”</p><strong>Meera S. · Mumbai</strong></article></div>
      </section>

      <section className="container" style={{ paddingBottom: 38 }}>
        <div className="newsletter"><div><h2>Good finds, occasionally.</h2><p>Get new arrivals and the occasional little treat in your inbox.</p></div><form action="/register"><input aria-label="Email address" type="email" name="email" placeholder="Your email address" /><button className="button-dark" type="submit">Count me in</button></form></div>
      </section>
    </>
  );
}