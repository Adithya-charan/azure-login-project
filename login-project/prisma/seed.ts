import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { OrderStatus, PrismaClient, ReviewStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();
const categories = [
  { name: "Electronics", slug: "electronics", description: "Useful tech and everyday devices, chosen for better work and play.", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80", names: ["Studio Wireless Headphones", "Pocket Bluetooth Speaker", "Smart Desk Lamp", "Everyday Power Bank", "Compact Mechanical Keyboard", "Noise-Canceling Earbuds", "Travel Charging Hub", "Webcam with Privacy Shutter"], brands: ["SoundNest", "Dayform", "North Loop"] },
  { name: "Fashion", slug: "fashion", description: "Comfortable wardrobe staples and considered pieces for the everyday.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", names: ["Relaxed Cotton Overshirt", "Everyday Linen Trousers", "Soft Ribbed Tee", "Weekend Knit Cardigan", "Classic Canvas Sneaker", "Easy Layering Jacket", "Pleated Day Dress", "Lightweight Travel Scarf"], brands: ["Common Hours", "Studio Rowan", "Wearwell"] },
  { name: "Home & Living", slug: "home-living", description: "Small, thoughtful upgrades for the rooms where life happens.", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80", names: ["Stoneware Pour-Over Set", "Soft Cotton Throw", "Sculpted Table Lamp", "Acacia Serving Board", "Everyday Glass Pitcher", "Woven Storage Basket", "Linen Cushion Cover", "Recycled Glass Vase"], brands: ["Field & Form", "Sunday Objects", "Roomkind"] },
  { name: "Beauty", slug: "beauty", description: "Gentle care and feel-good rituals for your everyday routine.", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80", names: ["Daily Hydration Serum", "Gentle Cloud Cleanser", "Botanical Hand Cream", "Mineral Sunscreen SPF 50", "Overnight Lip Balm", "Calm Skin Body Lotion", "Travel Essentials Kit", "Citrus Bath Soak"], brands: ["Bare Ritual", "Kindred Skin", "Glowfield"] },
  { name: "Sports", slug: "sports", description: "Dependable gear to help you get outside, move and feel good.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80", names: ["Everyday Training Bottle", "Studio Grip Yoga Mat", "Lightweight Running Cap", "Resistance Band Trio", "Quick-Dry Gym Towel", "Adjustable Training Rope", "Trail Daypack 18L", "Recovery Stretch Strap"], brands: ["Move Good", "Stride Works", "Open Air"] },
  { name: "Books", slug: "books", description: "Books to slow down with, learn from and pass along.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80", names: ["The Art of Noticing", "A Field Guide to Better Days", "Small Spaces, Big Ideas", "The Everyday Cook", "Notes from the Garden", "Make Time for What Matters", "A Good Life at Home", "Stories for Slow Sundays"], brands: ["Papertrail Press", "Open Shelf", "Little Lantern"] },
  { name: "Grocery", slug: "grocery", description: "Pantry favorites, honest ingredients and little kitchen joys.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", names: ["Single-Origin Filter Coffee", "Wildflower Honey Jar", "Stone-Ground Millet Mix", "Small-Batch Masala Chai", "Cold-Pressed Sesame Oil", "Roasted Almond Butter", "Everyday Dal & Grain Box", "Dark Chocolate Bites"], brands: ["Good Harvest", "Morning Ritual", "Pantry Project"] },
  { name: "Accessories", slug: "accessories", description: "Useful finishing touches that make your daily carry feel considered.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", names: ["Minimal Analog Watch", "Everyday Crossbody Bag", "Acetate Sun Frames", "Slim Card Wallet", "Reusable Steel Bottle", "Weekender Travel Pouch", "Compact Umbrella", "Leather Key Loop"], brands: ["Good Measure", "Carry Light", "Northkind"] },
];

const imagePool = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
];

async function main() {
  faker.seed(260926);
  const passwordHash = await hash("Customer@12345", 10);
  const adminHash = await hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@novacart.local" },
    create: { id: "seed-admin", name: "NovaCart Admin", email: "admin@novacart.local", passwordHash: adminHash, role: Role.ADMIN, cart: { create: {} }, wishlist: { create: {} } },
    update: { name: "NovaCart Admin", passwordHash: adminHash, role: Role.ADMIN },
  });

  const users = Array.from({ length: 1000 }, (_, index) => ({
    id: `seed-customer-${String(index + 1).padStart(4, "0")}`,
    name: faker.person.fullName(),
    email: `customer${String(index + 1).padStart(3, "0")}@novacart.local`,
    passwordHash,
    role: Role.CUSTOMER,
  }));
  await prisma.user.createMany({ data: users, skipDuplicates: true });

  const seededCategories = await Promise.all(categories.map((category) => prisma.category.upsert({
    where: { slug: category.slug },
    create: { name: category.name, slug: category.slug, description: category.description, image: category.image },
    update: { name: category.name, description: category.description, image: category.image },
  })));

  const products: { id: string; sku: string; name: string; price: number; image: string }[] = [];
  for (let categoryIndex = 0; categoryIndex < seededCategories.length; categoryIndex += 1) {
    const category = seededCategories[categoryIndex];
    const template = categories[categoryIndex];
    for (let productIndex = 0; productIndex < 15; productIndex += 1) {
      const brand = template.brands[productIndex % template.brands.length];
      const baseName = template.names[productIndex % template.names.length];
      const name = productIndex < template.names.length ? baseName : `${baseName} · ${faker.helpers.arrayElement(["Edition", "Series", "Select", "Everyday"])} ${productIndex - template.names.length + 2}`;
      const sku = `NC-${String(categoryIndex + 1).padStart(2, "0")}-${String(productIndex + 1).padStart(3, "0")}`;
      const slug = `${template.slug}-${baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${productIndex + 1}`;
      const price = faker.number.int({ min: 399, max: 14999 });
      const image = imagePool[(categoryIndex + productIndex) % imagePool.length];
      const id = `seed-product-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const data = {
        id,
        name,
        slug,
        sku,
        brand,
        description: `${name} by ${brand} is designed to make everyday routines a little more thoughtful. ${faker.commerce.productDescription()}`,
        price,
        originalPrice: productIndex % 4 === 0 ? Math.round(price * 1.2) : null,
        categoryId: category.id,
        active: true,
        featured: productIndex < 2,
      };
      await prisma.product.upsert({
        where: { sku },
        create: { ...data, images: { create: [{ id: `${id}-image-1`, url: image, alt: name, position: 0 }, { id: `${id}-image-2`, url: imagePool[(categoryIndex + productIndex + 1) % imagePool.length], alt: `${name}, alternate view`, position: 1 }] }, inventory: { create: { quantity: faker.number.int({ min: 0, max: 80 }) } } },
        update: { ...data, images: { deleteMany: {}, create: [{ id: `${id}-image-1`, url: image, alt: name, position: 0 }, { id: `${id}-image-2`, url: imagePool[(categoryIndex + productIndex + 1) % imagePool.length], alt: `${name}, alternate view`, position: 1 }] }, inventory: { upsert: { create: { quantity: 24 }, update: { quantity: 24 } } } },
      });
      products.push({ id, sku, name, price, image });
    }
  }

  const addressRows = users.map((user, index) => ({
    id: `seed-address-${String(index + 1).padStart(4, "0")}`,
    userId: user.id,
    label: index % 2 === 0 ? "Home" : "Work",
    fullName: user.name,
    phone: `+91 ${faker.string.numeric(10)}`,
    line1: faker.location.streetAddress(),
    city: faker.helpers.arrayElement(["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "Delhi", "Kochi", "Jaipur"]),
    state: faker.location.state(),
    postalCode: faker.string.numeric(6),
    country: "India",
    isDefault: true,
  }));
  await prisma.address.createMany({ data: addressRows, skipDuplicates: true });

  await prisma.cart.createMany({ data: users.map((user) => ({ id: `seed-cart-${user.id}`, userId: user.id })), skipDuplicates: true });
  await prisma.wishlist.createMany({ data: users.map((user) => ({ id: `seed-wishlist-${user.id}`, userId: user.id })), skipDuplicates: true });
  await prisma.cartItem.createMany({ data: users.slice(0, 30).map((user, index) => ({ id: `seed-cart-item-${index + 1}`, cartId: `seed-cart-${user.id}`, productId: products[index].id, quantity: index % 3 + 1 })), skipDuplicates: true });
  await prisma.wishlistItem.createMany({ data: users.slice(0, 60).map((user, index) => ({ id: `seed-wishlist-item-${index + 1}`, wishlistId: `seed-wishlist-${user.id}`, productId: products[(index * 2 + 8) % products.length].id })), skipDuplicates: true });

  const statuses = [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING, OrderStatus.CONFIRMED, OrderStatus.PENDING];
  const orderRows = Array.from({ length: 40 }, (_, index) => {
    const user = users[index];
    const item = products[(index * 3) % products.length];
    const second = products[(index * 3 + 19) % products.length];
    const quantity = index % 3 + 1;
    const subtotal = item.price * quantity + second.price;
    const shipping = subtotal >= 2500 ? 0 : 99;
    return {
      id: `seed-order-${String(index + 1).padStart(3, "0")}`,
      orderNumber: `NC-SEED-${String(index + 1).padStart(4, "0")}`,
      userId: user.id,
      addressId: `seed-address-${String(index + 1).padStart(4, "0")}`,
      status: statuses[index % statuses.length],
      subtotal,
      shipping,
      total: subtotal + shipping,
      shipName: user.name,
      shipPhone: `+91 ${faker.string.numeric(10)}`,
      shipLine1: addressRows[index].line1,
      shipCity: addressRows[index].city,
      shipState: addressRows[index].state,
      shipPostal: addressRows[index].postalCode,
      shipCountry: "India",
      createdAt: faker.date.recent({ days: 160 }),
    };
  });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: "NC-SEED-" } } });
  await prisma.order.createMany({ data: orderRows });
  await prisma.orderItem.createMany({ data: orderRows.flatMap((order, index) => {
    const first = products[(index * 3) % products.length];
    const second = products[(index * 3 + 19) % products.length];
    return [
      { id: `${order.id}-item-1`, orderId: order.id, productId: first.id, productName: first.name, productSku: first.sku, imageUrl: first.image, quantity: index % 3 + 1, priceAtOrder: first.price },
      { id: `${order.id}-item-2`, orderId: order.id, productId: second.id, productName: second.name, productSku: second.sku, imageUrl: second.image, quantity: 1, priceAtOrder: second.price },
    ];
  }) });
  await prisma.orderStatusHistory.createMany({ data: orderRows.map((order) => ({ id: `${order.id}-history-1`, orderId: order.id, status: order.status, note: "Seeded sample order", createdAt: order.createdAt })) });

  const reviewRows = Array.from({ length: 80 }, (_, index) => {
    const product = products[(index * 7) % products.length];
    const user = users[index];
    return {
      id: `seed-review-${String(index + 1).padStart(3, "0")}`,
      userId: user.id,
      productId: product.id,
      rating: faker.number.int({ min: 3, max: 5 }),
      title: faker.helpers.arrayElement(["A lovely everyday upgrade", "Exactly what I wanted", "Thoughtfully made", "Good quality, fair price", "Already part of my routine"]),
      comment: faker.lorem.sentences({ min: 1, max: 3 }),
      status: index % 8 === 0 ? ReviewStatus.PENDING : ReviewStatus.APPROVED,
    };
  });
  await prisma.review.createMany({ data: reviewRows, skipDuplicates: true });

  console.log(`Seeded ${seededCategories.length} categories, ${products.length} products and ${users.length} customers.`);
  console.log("Development accounts: admin@novacart.local and customer001@novacart.local");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());