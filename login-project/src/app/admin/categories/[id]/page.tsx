import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCategoryAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  return <section style={{ paddingBottom: 70 }}><p><Link className="text-link" href="/admin/categories">Back to categories</Link></p><h2 style={{ fontSize: 22 }}>Edit {category.name}</h2>
    <form className="form-wrap" action={updateCategoryAction} style={{ margin: 0 }}><input type="hidden" name="categoryId" value={category.id} /><div className="form-stack"><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" defaultValue={category.name} required /></div><div className="field"><label htmlFor="slug">Slug</label><input id="slug" name="slug" defaultValue={category.slug} pattern="[a-z0-9-]+" required /></div><div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={category.description} required minLength={10} /></div><button className="button-dark" type="submit">Save changes</button></div></form>
  </section>;
}