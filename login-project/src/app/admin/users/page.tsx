import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const take = 50;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where: { role: "CUSTOMER" }, include: { _count: { select: { orders: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));
  return <section style={{ paddingBottom: 70 }}><div className="catalog-topline"><span>{total.toLocaleString("en-IN")} customers</span><span>Page {page} of {pages}</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name ?? "—"}</td><td>{user.email}</td><td>{user.createdAt.toLocaleDateString("en-IN")}</td><td>{user._count.orders}</td></tr>)}</tbody></table></div><nav className="pagination">{page > 1 && <Link href={`/admin/users?page=${page - 1}`}>Previous</Link>}<span>{page} / {pages}</span>{page < pages && <Link href={`/admin/users?page=${page + 1}`}>Next</Link>}</nav></section>;
}