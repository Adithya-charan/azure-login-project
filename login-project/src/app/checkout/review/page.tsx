import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { placeOrderAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutReviewPage({ searchParams }: { searchParams: Promise<{ address?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const addressId = (await searchParams).address;
  const [address, cart] = await Promise.all([
    addressId ? prisma.address.findFirst({ where: { id: addressId, userId: session.user.id } }) : null,
    prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { inventory: true, images: { orderBy: { position: "asc" }, take: 1 } } },
          },
        },
      },
    }),
  ]);
  if (!address || !cart?.items.length) redirect("/cart");
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shipping = subtotal >= 2500 ? 0 : 99;
  const unavailable = cart.items.some((item) => !item.product.active || !item.product.inventory || item.quantity > item.product.inventory.quantity);

  return <div className="container"><header className="page-header"><span className="eyebrow">One last look</span><h1>Review your order</h1><p>Make sure everything looks right before you place your order.</p></header>
    <div className="steps" aria-label="Checkout steps"><span><b>1</b> Address</span><span className="current"><b>2</b> Review</span><span><b>3</b> Place order</span></div>
    {unavailable && <div className="error-note" role="alert">One or more items no longer have enough stock. <Link href="/cart">Update your bag</Link>.</div>}
    <div className="checkout-layout"><section className="summary"><div className="section-heading" style={{ marginBottom: 10 }}><div><h2>Items</h2></div><Link className="text-link" href="/cart"><ArrowLeft size={13} /> Edit bag</Link></div>
      {cart.items.map((item) => <article className="cart-row" key={item.id}><Image src={item.product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=75"} alt={item.product.name} width={90} height={90} sizes="90px" /><div><h3>{item.product.name}</h3><p>{item.product.brand} · Quantity {item.quantity}</p></div><strong>₹{(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}</strong></article>)}
    </section><aside className="summary"><h2>Delivering to</h2><p className="prose-note"><strong>{address.fullName}</strong><br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}<br />{address.phone}</p><Link className="text-link" href="/checkout">Change address</Link><div className="summary-line" style={{ marginTop: 21 }}><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? `₹${shipping}` : "Free"}</span></div><div className="summary-total"><span>Total</span><span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span></div><form action={placeOrderAction}><input type="hidden" name="addressId" value={address.id} /><button className="button-dark" type="submit" disabled={unavailable}>Place Order <CheckCircle2 size={15} /></button></form><p className="product-stock">No payment details or payment step.</p></aside></div>
  </div>;
}