"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerAction } from "@/app/actions";
import { registerSchema } from "@/schemas";
import { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ initialEmail }: { initialEmail?: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { email: initialEmail ?? "" } });

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    await registerAction(formData);
  });

  return <form className="form-stack" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="name">Your name</label><input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} />{errors.name && <span className="error-note" role="alert">{errors.name.message}</span>}</div>
    <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />{errors.email && <span className="error-note" role="alert">{errors.email.message}</span>}</div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} /><small>Use at least 10 characters.</small>{errors.password && <span className="error-note" role="alert">{errors.password.message}</span>}</div>
    <button className="button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
  </form>;
}