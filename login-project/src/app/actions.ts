"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  addressSchema,
  cartSchema,
  categorySchema,
  productSchema,
  registerSchema,
  reviewSchema,
} from "@/schemas";
import { OrderStatus } from "@prisma/client";

const formValues = (formData: FormData) => Object.fromEntries(formData.entries());

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/register?error=invalid");
  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
  } catch {
    redirect("/register?error=exists");
  }
  redirect("/login?registered=1");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
    redirect("/login?error=credentials");
  }
}

export async function addToCartAction(formData: FormData) {
  const user = await requireUser();
  const parsed = cartSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/cart?error=invalid");

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, active: true },
    include: { inventory: true },
  });
  if (!product?.inventory || product.inventory.quantity < parsed.data.quantity) redirect("/cart?error=stock");

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
    const existing = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: product.id } } });
    if ((existing?.quantity ?? 0) + parsed.data.quantity > product.inventory!.quantity) throw new Error("OUT_OF_STOCK");
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: { cartId: cart.id, productId: product.id, quantity: parsed.data.quantity },
      update: { quantity: { increment: parsed.data.quantity } },
    });
  }).catch(() => redirect("/cart?error=stock"));

  revalidatePath("/");
  revalidatePath("/cart");
  redirect("/cart?added=1");
}

export async function updateCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity"));
  if (!itemId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) redirect("/cart?error=invalid");

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
    include: { product: { include: { inventory: true } } },
  });
  const parsed = cartSchema.safeParse({ productId: item?.productId, quantity });
  if (!item || !parsed.success || !item.product.inventory || parsed.data.quantity > item.product.inventory.quantity) redirect("/cart?error=stock");
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId") ?? "");
  if (itemId) await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } });
  revalidatePath("/cart");
}

export async function clearCartAction() {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
  revalidatePath("/cart");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) redirect("/account?error=name");
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  revalidatePath("/account");
  redirect("/account?saved=1");
}

export async function saveAddressAction(formData: FormData) {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/account?error=address");
  await prisma.address.create({ data: { ...parsed.data, userId: user.id, isDefault: false } });
  revalidatePath("/account");
  redirect("/account?address=added");
}

export async function toggleWishlistAction(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") ?? "");
  const product = await prisma.product.findFirst({ where: { id: productId, active: true }, select: { id: true } });
  if (!product) redirect("/products");
  const wishlist = await prisma.wishlist.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
  const existing = await prisma.wishlistItem.findUnique({ where: { wishlistId_productId: { wishlistId: wishlist.id, productId } } });
  if (existing) await prisma.wishlistItem.delete({ where: { id: existing.id } });
  else await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  revalidatePath("/wishlist");
  revalidatePath("/products");
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect(`/products?error=review`);
  try {
    await prisma.review.create({ data: { ...parsed.data, userId: user.id } });
  } catch {
    redirect(`/products?error=review-exists`);
  }
  revalidatePath(`/products`);
  redirect(`/products?review=pending`);
}

export async function prepareCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/checkout?error=address");
  const address = await prisma.address.create({ data: { ...parsed.data, userId: user.id, isDefault: false } });
  redirect(`/checkout/review?address=${address.id}`);
}

export async function placeOrderAction(formData: FormData) {
  const user = await requireUser();
  const addressId = String(formData.get("addressId") ?? "");
  const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!address) redirect("/checkout?error=address");

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: { include: { inventory: true, images: { orderBy: { position: "asc" }, take: 1 } } } } } },
  });
  if (!cart?.items.length) redirect("/cart?error=empty");

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shipping = subtotal >= 2500 ? 0 : 99;
  const orderNumber = `NC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      if (!item.product.active) throw new Error("PRODUCT_UNAVAILABLE");
      const stock = await tx.inventory.updateMany({
        where: { productId: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (stock.count !== 1) throw new Error("OUT_OF_STOCK");
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: address.id,
        status: OrderStatus.PENDING,
        subtotal,
        shipping,
        total: subtotal + shipping,
        shipName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipLine2: address.line2,
        shipCity: address.city,
        shipState: address.state,
        shipPostal: address.postalCode,
        shipCountry: address.country,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSku: item.product.sku,
            imageUrl: item.product.images[0]?.url,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
          })),
        },
        history: { create: { status: OrderStatus.PENDING, note: "Order placed" } },
      },
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  }).catch(() => redirect("/checkout?error=stock"));

  revalidatePath("/cart");
  revalidatePath("/account/orders");
  redirect(`/account/orders/${order.id}?placed=1`);
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!Object.values(OrderStatus).includes(status as OrderStatus)) redirect("/admin/orders?error=status");
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: status as OrderStatus } }),
    prisma.orderStatusHistory.create({ data: { orderId, status: status as OrderStatus } }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}

export async function moderateReviewAction(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") redirect("/admin/reviews");
  const review = await prisma.review.update({ where: { id: reviewId }, data: { status }, include: { product: { select: { slug: true } } } });
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  revalidatePath(`/products/${review.product.slug}`);
  revalidatePath("/");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/admin/products?error=invalid");
  const { stock, price, ...values } = parsed.data;
  const imageUrl = String(formData.get("imageUrl") || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900");
  const existingProduct = await prisma.product.findUnique({ where: { sku: values.sku }, select: { slug: true, category: { select: { slug: true } } } });
  const product = await prisma.product.upsert({
    where: { sku: values.sku },
    create: {
      ...values,
      price,
      images: { create: { url: imageUrl, alt: values.name } },
      inventory: { create: { quantity: stock } },
    },
    update: {
      ...values,
      price,
      images: { deleteMany: {}, create: { url: imageUrl, alt: values.name } },
      inventory: { upsert: { create: { quantity: stock }, update: { quantity: stock } } },
    },
    include: { category: { select: { slug: true } } },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/categories/${product.category.slug}`);
  if (existingProduct) {
    revalidatePath(`/products/${existingProduct.slug}`);
    revalidatePath(`/categories/${existingProduct.category.slug}`);
  }
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/products?saved=1");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/admin/categories?error=invalid");
  await prisma.category.upsert({ where: { slug: parsed.data.slug }, create: parsed.data, update: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath(`/categories/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/categories?saved=1");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  const parsed = categorySchema.safeParse(formValues(formData));
  if (!categoryId || !parsed.success) redirect("/admin/categories?error=invalid");
  const existing = await prisma.category.findUnique({ where: { id: categoryId }, select: { slug: true } });
  await prisma.category.update({ where: { id: categoryId }, data: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  if (existing) revalidatePath(`/categories/${existing.slug}`);
  revalidatePath(`/categories/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/categories?saved=1");
}

export async function updateInventoryAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  if (!productId || !Number.isInteger(quantity) || quantity < 0 || quantity > 100000) redirect("/admin/inventory?error=invalid");
  const inventory = await prisma.inventory.upsert({ where: { productId }, create: { productId, quantity }, update: { quantity }, include: { product: { select: { slug: true } } } });
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  revalidatePath(`/products/${inventory.product.slug}`);
  revalidatePath("/");
}

export async function archiveProductAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) redirect("/admin/products");
  const product = await prisma.product.update({ where: { id: productId }, data: { active: false }, select: { slug: true } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");
}