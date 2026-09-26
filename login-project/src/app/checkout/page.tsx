import { redirect } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { prepareCheckoutAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const query = await searchParams;
  const [cart, address] = await Promise.all([
    prisma.cart.findUnique({ where: { userId: session.user.id }, include: { items: { include: { product: true } } } }),
    prisma.address.findFirst({ where: { userId: session.user.id }, orderBy: { isDefault: "desc" } }),
  ]);
  if (!cart?.items.length) redirect("/cart?error=empty");
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shipping = subtotal >= 2500 ? 0 : 99;

  return <div className="container"><header className="page-header"><span className="eyebrow">Almost on its way</span><h1>Checkout</h1><p>Share where to send your order. You’ll review everything before placing it.</p></header>
    <div className="steps" aria-label="Checkout steps"><span className="current"><b>1</b> Address</span><span><b>2</b> Review</span><span><b>3</b> Place order</span></div>
    {query.error && <div className="error-note" role="alert">We couldn’t place that order. Stock may have changed; please review your bag.</div>}
    <div className="checkout-layout"><form className="checkout-form" action={prepareCheckoutAction}>
      <h2>Shipping address</h2>
      <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required minLength={2} defaultValue={address?.fullName ?? session.user.name ?? ""} autoComplete="name" /></div>
      <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" required minLength={7} defaultValue={address?.phone ?? ""} autoComplete="tel" /></div>
      <div className="field wide"><label htmlFor="line1">Address line 1</label><input id="line1" name="line1" required minLength={4} defaultValue={address?.line1 ?? ""} autoComplete="address-line1" /></div>
      <div className="field wide"><label htmlFor="line2">Address line 2 (optional)</label><input id="line2" name="line2" defaultValue={address?.line2 ?? ""} autoComplete="address-line2" /></div>
      <div className="field"><label htmlFor="city">City</label><input id="city" name="city" required defaultValue={address?.city ?? ""} autoComplete="address-level2" /></div>
      <div className="field"><label htmlFor="state">State</label><input id="state" name="state" required defaultValue={address?.state ?? ""} autoComplete="address-level1" /></div>
      <div className="field"><label htmlFor="postalCode">Postal code</label><input id="postalCode" name="postalCode" required defaultValue={address?.postalCode ?? ""} autoComplete="postal-code" /></div>
      <div className="field"><label htmlFor="country">Country</label><input id="country" name="country" required defaultValue={address?.country ?? "India"} autoComplete="country-name" /></div>
      <button className="button-dark wide" type="submit">Review order <ArrowRight size={15} /></button>
    </form><aside className="summary"><h2>Your order</h2>{cart.items.map((item) => <div className="summary-line" key={item.id}><span>{item.product.name} × {item.quantity}</span><strong>₹{(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}</strong></div>)}<div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? `₹${shipping}` : "Free"}</span></div><div className="summary-total"><span>Total</span><span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span></div><div className="notice"><Check size={14} /> No payment details are needed. Your order is placed directly.</div></aside></div>
  </div>;
}