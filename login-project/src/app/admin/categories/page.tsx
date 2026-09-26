import Link from "next/link";
import { saveCategoryAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const query = await searchParams;
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  return <section style={{ paddingBottom: 70 }}>{query.saved && <div className="notice">Category saved.</div>}{query.error && <div className="error-note">Please check the category fields and slug.</div>}
    <form className="summary" action={saveCategoryAction} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: 12, alignItems: "end", marginBottom: 20 }}><div className="field"><label htmlFor="name">Category name</label><input id="name" name="name" required /></div><div className="field"><label htmlFor="slug">Slug</label><input id="slug" name="slug" pattern="[a-z0-9-]+" required /></div><div className="field"><label htmlFor="description">Description</label><input id="description" name="description" minLength={10} required /></div><button className="button-dark" type="submit">Save</button></form>
    <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Category</th><th>Slug</th><th>Description</th><th>Products</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><Link href={`/admin/categories/${category.id}`}>{category.name}</Link></td><td>{category.slug}</td><td>{category.description}</td><td>{category._count.products}</td></tr>)}</tbody></table></div>
  </section>;
}