import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { clearCartAction, removeCartItemAction, updateCartItemAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CartPage({ searchParams }: { searchParams: Promise<{ error?: string; added?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const query = await searchParams;
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 }, inventory: true } },
        },
      },
    },
  });
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shipping = subtotal >= 2500 ? 0 : subtotal > 0 ? 99 : 0;

  return <div className="container"><header className="page-header"><span className="eyebrow">Your little pile of good things</span><h1>Shopping bag</h1><p>Give everything one last look before it heads your way.</p></header>
    {query.added && <div className="notice">Added to your bag.</div>}{query.error && <div className="error-note" role="alert">{query.error === "stock" ? "That quantity is no longer available. Please update your bag." : "Please check your bag and try again."}</div>}
    {items.length ? <div className="cart-layout"><section aria-label="Shopping cart items"><div style={{ display: "flex", justifyContent: "flex-end" }}><form action={clearCartAction}><button className="text-button" type="submit">Clear bag</button></form></div>
      {items.map((item) => <article className="cart-row" key={item.id}><Image src={item.product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=75"} alt={item.product.name} width={90} height={90} sizes="90px" /><div><Link href={`/products/${item.product.slug}`}><h3>{item.product.name}</h3></Link><p>{item.product.brand}</p><div className="cart-row-actions"><form action={updateCartItemAction}><input type="hidden" name="itemId" value={item.id} /><label className="sr-only" htmlFor={`qty-${item.id}`}>Quantity for {item.product.name}</label><input id={`qty-${item.id}`} name="quantity" type="number" min="1" max={Math.min(20, item.product.inventory?.quantity ?? 1)} defaultValue={item.quantity} /><button className="text-button" type="submit">Update</button></form><form action={removeCartItemAction}><input type="hidden" name="itemId" value={item.id} /><button className="text-button" type="submit"><Trash2 size={12} /> Remove</button></form></div>{item.quantity > (item.product.inventory?.quantity ?? 0) && <span className="error-note">Stock changed. Reduce quantity to continue.</span>}</div><strong>₹{(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}</strong></article>)}
    </section><aside className="summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? `₹${shipping}` : "Free"}</span></div>{subtotal > 0 && subtotal < 2500 && <div className="product-stock">Add ₹{(2500 - subtotal).toLocaleString("en-IN")} more for free shipping.</div>}<div className="summary-total"><span>Total</span><span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span></div><Link className="button-dark" href="/checkout">Continue to address <ArrowRight size={15} /></Link><p className="product-stock">No payment step. Review your order and place it when you’re ready.</p></aside></div>
    : <div className="empty-state" style={{ marginBottom: 70 }}><ShoppingBag size={26} /><h2>Your bag is taking a breather</h2><p>Find a few useful, lovely things to bring it back to life.</p><Link className="button-dark" href="/products">Explore the shop <ArrowRight size={14} /></Link></div>}
  </div>;
}