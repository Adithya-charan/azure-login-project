"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { submitReviewAction } from "@/app/actions";
import { apiUrl } from "@/lib/api-url";

export function ReviewEntry({ productId }: { productId: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/account/summary"), { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() as Promise<{ authenticated: boolean }> : Promise.reject())
      .then((summary) => setAuthenticated(summary.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <p className="prose-note" aria-busy="true">Checking review access…</p>;
  if (!authenticated) return <p className="prose-note"><Link className="text-link" href="/login">Sign in to write a review</Link></p>;

  return <form className="form-wrap" action={submitReviewAction} style={{ margin: "0 0 25px", width: "100%" }}>
    <input type="hidden" name="productId" value={productId} /><h3 style={{ marginTop: 0 }}>Share your experience</h3>
    <div className="form-stack">
      <div className="field"><label htmlFor={`rating-${productId}`}>Your rating</label><select id={`rating-${productId}`} name="rating" required defaultValue="5"><option value="5">5 - Loved it</option><option value="4">4 - Really good</option><option value="3">3 - It’s good</option><option value="2">2 - Not for me</option><option value="1">1 - Disappointed</option></select></div>
      <div className="field"><label htmlFor={`review-title-${productId}`}>Review title</label><input id={`review-title-${productId}`} name="title" required minLength={3} /></div>
      <div className="field"><label htmlFor={`review-comment-${productId}`}>Your review</label><textarea id={`review-comment-${productId}`} name="comment" required minLength={10} /></div>
      <button className="button-dark" type="submit">Submit review for moderation</button>
    </div>
  </form>;
}