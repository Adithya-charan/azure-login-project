import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(10).max(72),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(72),
});

export const productSchema = z.object({
  name: z.string().trim().min(3).max(120),
  brand: z.string().trim().min(2).max(80),
  sku: z.string().trim().min(3).max(40),
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(20).max(5000),
  price: z.coerce.number().positive().max(10000000),
  categoryId: z.string().min(1),
  stock: z.coerce.number().int().min(0).max(100000),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10).max(500),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(4).max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(12),
  country: z.string().trim().min(2).max(80).default("India"),
});

export const cartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  comment: z.string().trim().min(10).max(2000),
});

export const checkoutSchema = addressSchema;