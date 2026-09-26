import { updateInventoryAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({ where: { active: true }, include: { inventory: true, category: { select: { name: true } } }, orderBy: { name: "asc" }, take: 150 });
  return <section style={{ paddingBottom: 70 }}><p className="prose-note">Low stock is five units or fewer. Inventory changes are saved directly to the catalog.</p><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Availability</th><th>Set quantity</th></tr></thead><tbody>{products.map((product) => { const quantity = product.inventory?.quantity ?? 0; return <tr key={product.id}><td>{product.name}</td><td>{product.sku}</td><td>{product.category.name}</td><td><span className="status-pill">{quantity === 0 ? "OUT OF STOCK" : quantity <= 5 ? "LOW STOCK" : "IN STOCK"}</span></td><td><form action={updateInventoryAction} style={{ display: "flex", gap: 5 }}><input type="hidden" name="productId" value={product.id} /><label className="sr-only" htmlFor={`stock-${product.id}`}>Stock for {product.name}</label><input id={`stock-${product.id}`} name="quantity" type="number" min="0" max="100000" defaultValue={quantity} /><button className="text-button" type="submit">Save</button></form></td></tr>; })}</tbody></table></div></section>;
}