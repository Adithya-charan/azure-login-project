import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart, Package, UserRound } from "lucide-react";
import { saveAddressAction, updateProfileAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; address?: string; error?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const query = await searchParams;
  const [user, orderCount, wishlistCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { addresses: { orderBy: { createdAt: "desc" }, take: 4 } } }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.wishlistItem.count({ where: { wishlist: { userId: session.user.id } } }),
  ]);
  if (!user) redirect("/login");
  return <div className="container"><header className="page-header"><span className="eyebrow">Your NovaCart</span><h1>Hey, {user.name?.split(" ")[0] ?? "there"}.</h1><p>Your details, addresses and everything on its way to you.</p></header>
    {query.saved && <div className="notice">Your profile is up to date.</div>}{query.address && <div className="notice">Address saved.</div>}{query.error && <div className="error-note">Please check the information and try again.</div>}
    <div className="account-layout"><nav className="account-nav" aria-label="Account navigation"><Link href="/account"><UserRound size={14} /> Profile</Link><Link href="/account/orders"><Package size={14} /> Orders</Link><Link href="/wishlist"><Heart size={14} /> Wishlist</Link></nav>
      <div className="account-main"><div className="dashboard-grid"><div className="metric"><span>Orders placed</span><strong>{orderCount}</strong></div><div className="metric"><span>Saved finds</span><strong>{wishlistCount}</strong></div></div>
        <section className="summary" style={{ marginBottom: 20 }}><h2>Personal information</h2><form className="form-stack" action={updateProfileAction}><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" defaultValue={user.name ?? ""} required minLength={2} maxLength={80} /></div><div className="field"><label htmlFor="account-email">Email</label><input id="account-email" value={user.email} readOnly /></div><button className="button-dark" type="submit">Save profile</button></form></section>
        <section className="summary"><div className="section-heading" style={{ marginBottom: 12 }}><div><h2>Saved addresses</h2></div><Link className="text-link" href="/checkout">Use at checkout <ArrowRight size={13} /></Link></div>
          {user.addresses.length ? user.addresses.map((address) => <div className="review-row" key={address.id}><strong>{address.fullName} · {address.label}</strong><p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}</p><p>{address.phone}</p></div>) : <p className="prose-note">No saved addresses yet. Add your first address below.</p>}
          <details style={{ marginTop: 15 }}><summary className="text-link" style={{ cursor: "pointer", display: "inline-flex" }}>Add an address</summary><form className="form-stack" action={saveAddressAction} style={{ marginTop: 16 }}>
            <AddressFields />
            <button className="button-dark" type="submit">Save address</button>
          </form></details>
        </section>
      </div>
    </div>
  </div>;
}

function AddressFields() {
  return <>
    <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required /></div><div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required /></div><div className="field"><label htmlFor="line1">Address</label><input id="line1" name="line1" required /></div><div className="field"><label htmlFor="line2">Address line 2</label><input id="line2" name="line2" /></div><div className="field"><label htmlFor="city">City</label><input id="city" name="city" required /></div><div className="field"><label htmlFor="state">State</label><input id="state" name="state" required /></div><div className="field"><label htmlFor="postalCode">Postal code</label><input id="postalCode" name="postalCode" required /></div><div className="field"><label htmlFor="country">Country</label><input id="country" name="country" defaultValue="India" required /></div>
  </>;
}