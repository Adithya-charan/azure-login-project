import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } }, items: true, history: { orderBy: { createdAt: "asc" } } } });
  if (!order) notFound();
  return <section style={{ paddingBottom: 70 }}><p><Link className="text-link" href="/admin/orders">Back to orders</Link></p><div className="section-heading"><div><span className="eyebrow">{order.orderNumber}</span><h2>{order.user.name ?? order.user.email}</h2><p>{order.createdAt.toLocaleString("en-IN")}</p></div><span className="status-pill">{order.status}</span></div>
    <div className="cart-layout"><div className="summary"><h2>Order items</h2>{order.items.map((item) => <article className="cart-row" key={item.id}><Image src={item.imageUrl ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=75"} alt={item.productName} width={90} height={90} sizes="90px" /><div><h3>{item.productName}</h3><p>{item.productSku} · Quantity {item.quantity}</p></div><strong>₹{(Number(item.priceAtOrder) * item.quantity).toLocaleString("en-IN")}</strong></article>)}
      <h2 style={{ marginTop: 24 }}>Shipping address</h2><p className="prose-note">{order.shipName}<br />{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br />{order.shipCity}, {order.shipState} {order.shipPostal}<br />{order.shipCountry}<br />{order.shipPhone}</p></div>
      <aside className="summary"><h2>Order total</h2><div className="summary-line"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Shipping</span><span>{Number(order.shipping) ? `₹${Number(order.shipping).toLocaleString("en-IN")}` : "Free"}</span></div><div className="summary-total"><span>Total</span><span>₹{Number(order.total).toLocaleString("en-IN")}</span></div><form className="form-stack" action={updateOrderStatusAction}><input type="hidden" name="orderId" value={order.id} /><div className="field"><label htmlFor="status">Update status</label><select id="status" name="status" defaultValue={order.status}>{Object.values(OrderStatus).map((status) => <option value={status} key={status}>{status}</option>)}</select></div><button className="button-dark" type="submit">Save status</button></form></aside>
    </div><h2 style={{ fontSize: 17 }}>Status history</h2>{order.history.map((entry) => <div className="review-row" key={entry.id}><strong>{entry.status}</strong><p>{entry.note ?? "Status updated"} · {entry.createdAt.toLocaleString("en-IN")}</p></div>)}
  </section>;
}