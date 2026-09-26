import { moderateReviewAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100 });
  return <section style={{ paddingBottom: 70 }}>{reviews.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Status</th><th>Moderate</th></tr></thead><tbody>{reviews.map((review) => <tr key={review.id}><td>{review.product.name}</td><td>{review.user.name ?? review.user.email}</td><td>{review.rating} / 5</td><td><strong>{review.title}</strong><br />{review.comment}</td><td><span className="status-pill">{review.status}</span></td><td>{review.status === "PENDING" && <div style={{ display: "flex", gap: 5 }}>{["APPROVED", "REJECTED"].map((status) => <form action={moderateReviewAction} key={status}><input type="hidden" name="reviewId" value={review.id} /><input type="hidden" name="status" value={status} /><button className="text-button" type="submit">{status === "APPROVED" ? "Approve" : "Reject"}</button></form>)}</div>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No reviews to moderate</h2><p>New customer reviews will be listed here.</p></div>}</section>;
}