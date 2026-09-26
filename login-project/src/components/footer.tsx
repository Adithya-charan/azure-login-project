import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span>nova<span>cart</span></Link><p>Good things for everyday life. Curated with care, delivered with a little extra joy.</p></div>
          <div><h3>Explore</h3><nav className="footer-links"><Link href="/products">Shop all</Link><Link href="/categories">Categories</Link><Link href="/products?sort=newest">New arrivals</Link><Link href="/products?sort=rating">Best rated</Link></nav></div>
          <div><h3>Your account</h3><nav className="footer-links"><Link href="/account">Profile</Link><Link href="/account/orders">Orders</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Shopping bag</Link></nav></div>
          <div><h3>Here to help</h3><div className="footer-links"><span>Mon–Sat, 9am–6pm</span><span>hello@novacart.local</span><span>Made for everyday India</span></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 NovaCart. Thoughtfully shopped.</span><span>Careful picks. Clear prices. No surprises. <ArrowUpRight size={12} /></span></div>
      </div>
    </footer>
  );
}