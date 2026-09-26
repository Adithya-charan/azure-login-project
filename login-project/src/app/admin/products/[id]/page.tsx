import Link from "next/link";
import { notFound } from "next/navigation";
import { saveProductAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { inventory: true, images: { orderBy: { position: "asc" }, take: 1 } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return <section style={{ paddingBottom: 70 }}><p><Link className="text-link" href="/admin/products">Back to products</Link></p><h2 style={{ fontSize: 22 }}>Edit {product.name}</h2>
    <form action={saveProductAction} className="checkout-form">
      <div className="field"><label htmlFor="name">Product name</label><input id="name" name="name" defaultValue={product.name} required minLength={3} /></div><div className="field"><label htmlFor="brand">Brand</label><input id="brand" name="brand" defaultValue={product.brand} required /></div><div className="field"><label htmlFor="sku">SKU</label><input id="sku" name="sku" defaultValue={product.sku} required /></div><div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" defaultValue={product.slug} pattern="[a-z0-9-]+" required /></div><div className="field"><label htmlFor="price">Price (₹)</label><input id="price" name="price" type="number" min="1" step="0.01" defaultValue={Number(product.price)} required /></div><div className="field"><label htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" min="0" defaultValue={product.inventory?.quantity ?? 0} required /></div><div className="field"><label htmlFor="categoryId">Category</label><select id="categoryId" name="categoryId" defaultValue={product.categoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="field"><label htmlFor="imageUrl">Image URL</label><input id="imageUrl" name="imageUrl" type="url" defaultValue={product.images[0]?.url ?? ""} /></div><div className="field wide"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={product.description} required minLength={20} /></div><button className="button-dark wide" type="submit">Save changes</button>
    </form>
  </section>;
}