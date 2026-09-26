import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, MessageSquareText, PackageSearch, Tags, UsersRound } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return <div className="container"><header className="page-header"><span className="eyebrow">NovaCart operations</span><h1>Admin dashboard</h1><p>Catalog, orders and inventory in one place.</p></header>
    <nav className="account-nav" aria-label="Admin navigation" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginBottom: 22 }}>
      <Link href="/admin"><LayoutDashboard size={14} /> Overview</Link><Link href="/admin/products"><PackageSearch size={14} /> Products</Link><Link href="/admin/categories"><Tags size={14} /> Categories</Link><Link href="/admin/users"><UsersRound size={14} /> Customers</Link><Link href="/admin/orders"><ClipboardList size={14} /> Orders</Link><Link href="/admin/inventory"><Boxes size={14} /> Inventory</Link><Link href="/admin/reviews"><MessageSquareText size={14} /> Reviews</Link>
    </nav>{children}
  </div>;
}