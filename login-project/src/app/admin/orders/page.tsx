import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { updateOrderStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return <section style={{ paddingBottom: 70 }}><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td><td>{order.user.name ?? order.user.email}</td><td>{order.createdAt.toLocaleDateString("en-IN")}</td><td>{order._count.items}</td><td>₹{Number(order.total).toLocaleString("en-IN")}</td><td><form action={updateOrderStatusAction} style={{ display: "flex", gap: 5 }}><input type="hidden" name="orderId" value={order.id} /><select name="status" defaultValue={order.status} aria-label={`Status for ${order.orderNumber}`}>{Object.values(OrderStatus).map((status) => <option value={status} key={status}>{status}</option>)}</select><button className="text-button" type="submit">Update</button></form></td></tr>)}</tbody></table></div></section>;
}