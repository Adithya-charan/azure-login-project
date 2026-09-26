import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  const query = await searchParams;
  return <div className="container"><section className="form-wrap"><span className="eyebrow">Join the good-life club</span><h1>Make yourself at home.</h1><p>Create an account to keep your orders, saved finds and addresses together.</p>
    {query.error && <div className="error-note" role="alert">{query.error === "exists" ? "An account already uses that email." : "Please check your details and try again."}</div>}
    <RegisterForm initialEmail={query.email} />
    <p className="form-note">Already have an account? <Link href="/login">Sign in</Link></p>
  </section></div>;
}