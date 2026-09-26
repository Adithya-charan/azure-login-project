import { auth } from "@/auth";
import { noStoreHeaders } from "@/lib/catalog-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ authenticated: false, isAdmin: false, itemCount: 0 }, { headers: noStoreHeaders });
    }

    const cart = await prisma.cartItem.aggregate({
      where: { cart: { userId: session.user.id } },
      _sum: { quantity: true },
    });
    return Response.json({
      authenticated: true,
      isAdmin: session.user.role === "ADMIN",
      itemCount: cart._sum.quantity ?? 0,
    }, { headers: noStoreHeaders });
  } catch {
    return Response.json({ error: "Account summary is unavailable." }, { status: 503, headers: noStoreHeaders });
  }
}