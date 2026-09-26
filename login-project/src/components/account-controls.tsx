"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, UserRound } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { apiUrl } from "@/lib/api-url";

type AccountSummary = { authenticated: boolean; isAdmin: boolean; itemCount: number };

export function AccountControls() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/account/summary"), { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() as Promise<AccountSummary> : Promise.reject())
      .then(setSummary)
      .catch(() => setSummary({ authenticated: false, isAdmin: false, itemCount: 0 }));
  }, []);

  return <>
    <details className="account-menu">
      <summary className="icon-link" aria-label="Account menu"><UserRound size={19} /></summary>
      <div className="account-popover">
        {summary?.authenticated ? <>
          <Link href="/account">My account</Link><Link href="/account/orders">My orders</Link><Link href="/wishlist"><Heart size={13} /> Wishlist</Link>
          {summary.isAdmin && <Link href="/admin">Admin dashboard</Link>}
          <form action={signOutAction}><button type="submit">Sign out</button></form>
        </> : <><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></>}
      </div>
    </details>
    <Link className="icon-link" href="/cart" aria-label={`Shopping cart, ${summary?.itemCount ?? 0} items`}><ShoppingBag size={19} />{(summary?.itemCount ?? 0) > 0 && <span className="cart-count">{summary?.itemCount}</span>}</Link>
  </>;
}