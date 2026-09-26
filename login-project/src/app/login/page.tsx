import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const query = await searchParams;
  return <div className="container"><section className="form-wrap"><span className="eyebrow">Welcome back</span><h1>Good to see you.</h1><p>Sign in to pick up right where you left off.</p>
    {query.registered && <div className="notice">Your account is ready. Sign in to start shopping.</div>}
    {query.error && <div className="error-note" role="alert">That email and password combination didn’t work. Please try again.</div>}
    <form className="form-stack" action={loginAction}><div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div><button className="button-dark" type="submit"><LockKeyhole size={15} /> Sign in <ArrowRight size={14} /></button></form>
    <p className="form-note">New to NovaCart? <Link href="/register">Create an account</Link></p>
  </section></div>;
}