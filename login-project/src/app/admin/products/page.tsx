import Link from "next/link";
import { archiveProductAction, saveProductAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const query = await searchParams;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true, inventory: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <section style={{ paddingBottom: 70 }}>
    {query.saved && <div className="notice">Product saved.</div>}{query.error && <div className="error-note">Product details were not valid or the SKU already exists.</div>}
    <details className="summary" style={{ marginBottom: 22 }}><summary style={{ cursor: "pointer", fontWeight: 800 }}>Add a product</summary><form action={saveProductAction} className="checkout-form" style={{ marginTop: 15 }}>
      <div className="field"><label htmlFor="name">Product name</label><input id="name" name="name" required minLength={3} /></div><div className="field"><label htmlFor="brand">Brand</label><input id="brand" name="brand" required /></div><div className="field"><label htmlFor="sku">SKU</label><input id="sku" name="sku" required /></div><div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" pattern="[a-z0-9-]+" required /></div><div className="field"><label htmlFor="price">Price (₹)</label><input id="price" name="price" type="number" min="1" step="0.01" required /></div><div className="field"><label htmlFor="stock">Initial stock</label><input id="stock" name="stock" type="number" min="0" required /></div><div className="field"><label htmlFor="categoryId">Category</label><select id="categoryId" name="categoryId" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="field"><label htmlFor="imageUrl">Image URL</label><input id="imageUrl" name="imageUrl" type="url" /></div><div className="field wide"><label htmlFor="description">Description</label><textarea id="description" name="description" required minLength={20} /></div><button className="button-dark wide" type="submit">Save product</button>
    </form></details>
    <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><Link href={`/products/${product.slug}`}>{product.name}</Link></td><td>{product.sku}</td><td>{product.category.name}</td><td>₹{Number(product.price).toLocaleString("en-IN")}</td><td>{product.inventory?.quantity ?? 0}</td><td><span className="status-pill">{product.active ? "ACTIVE" : "ARCHIVED"}</span></td><td><Link className="text-button" href={`/admin/products/${product.id}`}>Edit</Link>{product.active && <form action={archiveProductAction}><input type="hidden" name="productId" value={product.id} /><button className="text-button" type="submit">Archive</button></form>}</td></tr>)}</tbody></table></div>
  </section>;
}