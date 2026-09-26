"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div className="container"><section className="empty-state" style={{ maxWidth: 620, margin: "70px auto" }}><span className="eyebrow">A little hiccup</span><h1 style={{ fontSize: 34, letterSpacing: "-.06em" }}>That didn’t go to plan.</h1><p>We couldn’t load this page just now. Your account and order details are still safe.</p><button className="button-dark" type="button" onClick={reset}><RefreshCw size={15} /> Try again</button></section></div>;
}