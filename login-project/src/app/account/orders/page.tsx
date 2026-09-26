import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return <div className="container"><header className="page-header"><span className="eyebrow">Your NovaCart</span><h1>Orders</h1><p>Every order, from placed to delivered.</p></header>
    <div className="account-layout"><nav className="account-nav" aria-label="Account navigation"><Link href="/account">Profile</Link><Link href="/account/orders">Orders</Link><Link href="/wishlist">Wishlist</Link></nav><section className="account-main">
      {orders.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.createdAt.toLocaleDateString("en-IN")}</td><td>{order.items.length}</td><td><span className="status-pill">{order.status}</span></td><td>₹{Number(order.total).toLocaleString("en-IN")}</td><td><Link href={`/account/orders/${order.id}`} aria-label={`View ${order.orderNumber}`}><ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No orders yet</h2><p>Your first good find is waiting.</p><Link className="button-dark" href="/products">Start exploring</Link></div>}
    </section></div>
  </div>;
}