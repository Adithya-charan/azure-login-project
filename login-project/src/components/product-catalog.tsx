"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { apiUrl } from "@/lib/api-url";

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  images: { url: string }[];
  inventory: { quantity: number };
  rating: number | null;
  reviewCount: number;
};

type CategoryOption = { name: string; slug: string };
type ProductResponse = { data: CatalogProduct[]; total: number; page: number; pageSize: number };

export function ProductCatalog() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const query = new URLSearchParams(queryString);
  const page = Math.max(1, Number(query.get("page")) || 1);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetch(apiUrl(`/api/products${queryString ? `?${queryString}` : ""}`))
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return response.json() as Promise<ProductResponse>;
      })
      .then((result) => {
        if (!active) return;
        setProducts(result.data);
        setTotal(result.total);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [queryString, retry]);

  useEffect(() => {
    fetch(apiUrl("/api/categories"))
      .then((response) => response.ok ? response.json() as Promise<{ data: CategoryOption[] }> : Promise.reject())
      .then((result) => setCategories(result.data))
      .catch(() => setCategories([]));
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / 12));
  const hrefForPage = (nextPage: number) => {
    const params = new URLSearchParams(queryString);
    params.set("page", String(nextPage));
    return `/products?${params.toString()}`;
  };
  const search = query.get("q") ?? "";

  return <div className="container">
    <header className="page-header"><span className="eyebrow">The whole collection</span><h1>{search ? `Results for “${search}”` : "Shop the good stuff"}</h1><p>Useful, well-made picks for every room, routine and little adventure.</p></header>
    <div className="catalog-layout">
      <aside className="filters"><h2>Refine your search</h2><form action="/products" method="get" key={queryString}>
        {search && <input type="hidden" name="q" value={search} />}
        <div className="filter-control"><label htmlFor="category">Category</label><select id="category" name="category" defaultValue={query.get("category") ?? ""}><option value="">All categories</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></div>
        <div className="filter-control"><label htmlFor="min">Min. price (₹)</label><input id="min" type="number" name="min" min="0" defaultValue={query.get("min") ?? ""} /></div>
        <div className="filter-control"><label htmlFor="max">Max. price (₹)</label><input id="max" type="number" name="max" min="0" defaultValue={query.get("max") ?? ""} /></div>
        <div className="filter-control"><label htmlFor="availability">Availability</label><select id="availability" name="availability" defaultValue={query.get("availability") ?? ""}><option value="">Any stock status</option><option value="available">In stock</option><option value="out">Out of stock</option></select></div>
        <div className="filter-control filter-wide"><label htmlFor="sort">Sort by</label><select id="sort" name="sort" defaultValue={query.get("sort") ?? "newest"}><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></div>
        <button className="button-dark" type="submit">Apply filters</button>
      </form></aside>
      <section aria-label="Products" aria-busy={loading}>
        <div className="catalog-topline"><span>{loading ? "Loading products…" : `${total} ${total === 1 ? "find" : "finds"} to explore`}</span><span>Page {page} of {pageCount}</span></div>
        {error ? <div className="empty-state" role="alert"><h2>We couldn’t load the catalog</h2><p>Please try again in a moment.</p><button className="button-dark" type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button></div>
          : loading ? <div className="product-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div key={index}><div style={{ aspectRatio: "1 / 1.08", borderRadius: 6, background: "#e9ede5" }} /><div style={{ width: "70%", height: 12, marginTop: 14, borderRadius: 4, background: "#e5e9df" }} /></div>)}</div>
            : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={{ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, image: product.images[0]?.url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", stock: product.inventory.quantity, rating: product.rating ?? 4.8, reviewCount: product.reviewCount }} />)}</div>
              : <div className="empty-state"><h2>No finds match just yet</h2><p>Try a different search or loosen your filters.</p><Link className="button-dark" href="/products">Clear filters</Link></div>}
        {!loading && !error && total > 12 && <nav className="pagination" aria-label="Pagination">{page > 1 && <Link href={hrefForPage(page - 1)}><ArrowLeft size={14} /> Previous</Link>}<span>{page} / {pageCount}</span>{page < pageCount && <Link href={hrefForPage(page + 1)}>Next <ArrowRight size={14} /></Link>}</nav>}
      </section>
    </div>
  </div>;
}