import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock3, Package, UsersRound } from "lucide-react";
import { OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [customers, products, orders, lowStock, pending, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  return <section style={{ paddingBottom: 70 }}>
    <div className="dashboard-grid"><div className="metric"><span><UsersRound size={13} /> Customers</span><strong>{customers.toLocaleString("en-IN")}</strong></div><div className="metric"><span><Package size={13} /> Active products</span><strong>{products.toLocaleString("en-IN")}</strong></div><div className="metric"><span><Clock3 size={13} /> Total orders</span><strong>{orders.toLocaleString("en-IN")}</strong></div><div className="metric"><span><AlertTriangle size={13} /> Low stock / pending</span><strong>{lowStock} <small style={{ color: "var(--muted)", fontSize: 12 }}>/ {pending}</small></strong></div></div>
    <div className="section-heading"><div><span className="eyebrow">The latest</span><h2>Recent orders</h2></div><Link className="text-link" href="/admin/orders">All orders <ArrowRight size={13} /></Link></div>
    {recentOrders.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.user.name ?? order.user.email}</td><td>{order.createdAt.toLocaleDateString("en-IN")}</td><td><span className="status-pill">{order.status}</span></td><td>₹{Number(order.total).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No orders yet</h2><p>Orders will appear here when customers check out.</p></div>}
  </section>;
}