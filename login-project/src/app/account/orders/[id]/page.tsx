import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const order = await prisma.order.findFirst({ where: { id, userId: session.user.id }, include: { items: true, history: { orderBy: { createdAt: "asc" } } } });
  if (!order) notFound();
  return <div className="container"><header className="page-header"><span className="eyebrow">Order {order.orderNumber}</span><h1>{query.placed ? "Order placed successfully" : "Order details"}</h1><p>Placed on {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })}. We’ll keep you posted as it moves along.</p></header>
    {query.placed && <div className="notice"><CheckCircle2 size={15} /> Order placed successfully. No payment was collected.</div>}
    <div className="cart-layout"><section className="summary"><h2>Items in this order</h2>{order.items.map((item) => <div className="cart-row" key={item.id}><Image src={item.imageUrl ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=75"} alt={item.productName} width={90} height={90} sizes="90px" /><div><h3>{item.productName}</h3><p>SKU {item.productSku} · Qty {item.quantity}</p></div><strong>₹{(Number(item.priceAtOrder) * item.quantity).toLocaleString("en-IN")}</strong></div>)}</section>
      <aside className="summary"><h2>Order summary</h2><div className="summary-line"><span>Status</span><span className="status-pill">{order.status}</span></div><div className="summary-line"><span>Placed</span><span>{order.createdAt.toLocaleDateString("en-IN")}</span></div><div className="summary-line"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Shipping</span><span>{Number(order.shipping) ? `₹${Number(order.shipping).toLocaleString("en-IN")}` : "Free"}</span></div><div className="summary-total"><span>Total</span><span>₹{Number(order.total).toLocaleString("en-IN")}</span></div><h3 style={{ fontSize: 12 }}>Shipping address</h3><p className="prose-note">{order.shipName}<br />{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br />{order.shipCity}, {order.shipState} {order.shipPostal}<br />{order.shipCountry}<br />{order.shipPhone}</p></aside>
    </div>
    <section style={{ paddingBottom: 60 }}><h2 style={{ fontSize: 17 }}>Order updates</h2>{order.history.map((entry) => <div className="review-row" key={entry.id}><strong>{entry.status}</strong><p>{entry.note ?? "Status updated"} · {entry.createdAt.toLocaleString("en-IN")}</p></div>)}</section>
    <Link className="text-link" href="/account/orders">Back to orders</Link>
  </div>;
}