import { Suspense } from "react";
import { ProductCatalog } from "@/components/product-catalog";

export const revalidate = 60;

export default function ProductsPage() {
  return <Suspense fallback={<div className="container" aria-busy="true"><header className="page-header"><span className="eyebrow">The whole collection</span><h1>Shop the good stuff</h1><p>Loading the latest catalog…</p></header></div>}><ProductCatalog /></Suspense>;
}