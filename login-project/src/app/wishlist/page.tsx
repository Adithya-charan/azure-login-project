import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  const items = wishlist?.items ?? [];
  return <div className="container"><header className="page-header"><span className="eyebrow">Saved for another day</span><h1>Your wishlist</h1><p>All the things you’ve had your eye on.</p></header>
    {items.length ? <div className="product-grid" style={{ paddingBottom: 70 }}>{items.map(({ product }) => <article className="product-card" key={product.id}><Link href={`/products/${product.slug}`} className="product-media"><Image src={product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" /></Link><div className="product-copy"><span className="product-brand">{product.brand}</span><Link className="product-name" href={`/products/${product.slug}`}>{product.name}</Link><div className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</div><div style={{ display: "flex", gap: 7 }}><form action={addToCartAction} style={{ flex: 1 }}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="quantity" value="1" /><button className="add-button" type="submit">Add to bag</button></form><form action={toggleWishlistAction}><input type="hidden" name="productId" value={product.id} /><button className="add-button" type="submit" aria-label={`Remove ${product.name} from wishlist`}><Trash2 size={14} /></button></form></div>{(product.inventory?.quantity ?? 0) === 0 && <span className="product-stock">Out of stock</span>}</div></article>)}</div> : <div className="empty-state" style={{ marginBottom: 70 }}><Heart size={25} /><h2>Nothing saved just yet</h2><p>Tap the heart on anything you love to find it here later.</p><Link className="button-dark" href="/products">Browse products</Link></div>}
  </div>;
}