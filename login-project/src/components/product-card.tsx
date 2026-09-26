"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
};

export function ProductCard({ product }: { product: CardProduct }) {
  const availability = product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? "Only a few left" : "In stock";
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-media" aria-label={`View ${product.name}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </Link>
      <form action={toggleWishlistAction}><input type="hidden" name="productId" value={product.id} /><button className="wishlist-button" type="submit" aria-label={`Add ${product.name} to wishlist`}><Heart size={16} /></button></form>
      <div className="product-copy">
        <span className="product-brand">{product.brand}</span>
        <Link className="product-name" href={`/products/${product.slug}`}>{product.name}</Link>
        <div className="product-meta"><span className="product-price">₹{product.price.toLocaleString("en-IN")}</span><span className="product-rating"><Star size={12} fill="currentColor" /> {product.rating?.toFixed(1) ?? "4.8"} <span>({product.reviewCount ?? 0})</span></span></div>
        <div className="product-stock">{availability}</div>
        <form action={addToCartAction}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="quantity" value="1" /><button className="add-button" type="submit" disabled={product.stock <= 0}><Plus size={14} /> {product.stock <= 0 ? "Unavailable" : "Add to bag"}</button></form>
      </div>
    </article>
  );
}