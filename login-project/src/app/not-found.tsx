import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <div className="container"><section className="empty-state" style={{ maxWidth: 620, margin: "70px auto" }}><span className="eyebrow">Well, this is a little awkward</span><h1 style={{ fontSize: 40, letterSpacing: "-.07em" }}>We couldn’t find that one.</h1><p>The product or page may have moved. Let’s find you something good instead.</p><div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}><Link className="button-dark" href="/products"><Search size={15} /> Browse the shop</Link><Link className="button-light" href="/"><ArrowLeft size={15} /> Back home</Link></div></section></div>;
}