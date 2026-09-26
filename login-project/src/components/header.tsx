import Link from "next/link";
import { Menu, Search, Sparkles } from "lucide-react";
import { AccountControls } from "@/components/account-controls";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><Menu size={20} /></summary>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <Link href="/">Home</Link><Link href="/products">Shop all</Link><Link href="/categories">Categories</Link>
          </nav>
        </details>
        <Link className="brand" href="/" aria-label="NovaCart home"><span className="brand-mark"><Sparkles size={17} /></span>nova<span>cart</span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/">Home</Link><Link href="/products">Shop</Link><Link href="/categories">Categories</Link>
        </nav>
        <form action="/products" className="search-box" role="search">
          <Search size={15} aria-hidden="true" /><input name="q" aria-label="Search products" placeholder="Search anything..." />
        </form>
        <div className="header-actions">
          <AccountControls />
        </div>
      </div>
      <div className="mobile-search"><form action="/products" className="search-box" role="search"><Search size={15} aria-hidden="true" /><input name="q" aria-label="Search products" placeholder="Search anything..." /></form></div>
    </header>
  );
}