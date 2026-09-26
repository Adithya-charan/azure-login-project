# NovaCart

NovaCart is a single-app e-commerce storefront for thoughtful everyday products. It includes a catalog, customer accounts, saved addresses, cart, order review and placement, order history, reviews, wishlist, inventory and an admin workspace. Orders are placed without a payment step; the application does not collect payment information or create payment or transaction records.

## Features

- Database-backed product search across name, description, brand and SKU; category, price and stock filters; sorting and pagination.
- Product detail pages with availability, customer reviews and related products.
- Auth.js credentials login, bcrypt password hashing and server-side customer/admin authorization.
- Server-priced cart and checkout, with stock checked and decremented inside the order transaction.
- Customer profile, addresses, orders and wishlist; customers can only access their own orders.
- Admin overview, product/category create and edit, archive, customer list, order status, stock controls and review moderation.
- Responsive storefront and administrative views; INR prices.

## Stack

Next.js App Router, TypeScript, Tailwind CSS 4, Neon PostgreSQL, Prisma, Auth.js, bcryptjs, Zod, React Hook Form, Faker and Lucide React.

## Project structure

```text
src/
	app/                 App Router pages, server actions and Auth.js route
	components/           Shared header, footer and product card
	lib/                  Prisma client
	schemas/              Zod request/form schemas
	types/                Auth.js session augmentation
prisma/
	migrations/            PostgreSQL migrations
	schema.prisma          Database models and relations
	seed.ts                Repeatable demo data
```

## Neon and local setup

Use Node.js 20 or newer. Create a Neon PostgreSQL database and copy its connection URL into a local `.env` file based on `.env.example`. The `.env` file is ignored by Git; do not commit database credentials. Use Neon’s pooled URL for the running application and the Neon direct URL for migration commands if your provider settings require it.

```powershell
npm install
Copy-Item .env.example .env
```

Set these values in `.env`:

```dotenv
DATABASE_URL="your Neon PostgreSQL connection URL"
AUTH_SECRET="a long random secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_BASE_URL=""
```

`NEXT_PUBLIC_API_BASE_URL` is optional. Leave it empty to call this same-origin Next.js app; set it at build time only if the browser should call a separate API origin. Do not include secrets in any `NEXT_PUBLIC_` variable.

Generate the client, apply the initial migration, seed the database, and start the app:

```sh
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seed creates eight categories, 120 products, 1,000 customers, one admin, and sample addresses, inventory, carts, wishlists, orders, reviews and order history. It uses stable identifiers and upserts/duplicate-safe inserts so it can be run again.

## Development accounts

These accounts are created by the seed. Passwords are stored as bcrypt hashes.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@novacart.local` | `Admin@12345` |
| Customer | `customer001@novacart.local` | `Customer@12345` |

Change these credentials before using a shared or production environment.

## Catalog APIs and cache policy

Public catalog endpoints return only public product/category data. Browsers revalidate each request (`max-age=0`), while shared edge caches may retain a response for 60 seconds (`s-maxage=60`):

- `GET /api/products` supports `q`, `category`, `min`, `max`, `availability`, `sort` and `page`. It also serves as the search and category-filter API.
- `GET /api/products/:id` accepts a product ID or slug and returns the current origin product data.
- `GET /api/categories` returns public categories and product counts.
- `GET /api/health` returns `{ "status": "ok" }` with `Cache-Control: private, no-store`.

Public storefront pages are limited to home, product listing/details and categories. Their server-rendered HTML contains no signed-in user, role, cart or address data. The small account/cart controls and review form load identity from `GET /api/account/summary`, which is `private, no-store`. Login, registration, account, cart, checkout, orders, admin, Auth.js and all mutations are also marked `private, no-store`; POST/server-action requests are never publicly cacheable.

## Azure App Service and Front Door

The application does not implement Front Door, WAF, edge caching or fake stale data. These are Azure configuration responsibilities.

1. Deploy this Next.js app to a Node.js 20+ Azure App Service. Set startup to `npm start`; App Service supplies the port. Keep the existing Neon database and set `DATABASE_URL` to its production connection string.
2. Set `AUTH_SECRET`, `AUTH_URL` (the public HTTPS origin), `NEXT_PUBLIC_APP_URL` (the public HTTPS origin), and optionally `NEXT_PUBLIC_API_BASE_URL` in App Service. The app trusts the forwarded host from Azure. `NEXT_PUBLIC_*` values are embedded at build time, so set them in the build environment too when using a separate API origin.
3. Configure Azure Front Door with the App Service as origin. Enable caching only for GET/HEAD requests to `/`, `/products/*`, `/categories/*`, `/api/products*` and `/api/categories*`, honoring the origin's 60-second `s-maxage` TTL. Browser requests revalidate, allowing them to observe an edge purge. For product/search/filter pages, include all query-string parameters in the cache key.
4. Bypass caching for `/login`, `/register`, `/account/*`, `/cart`, `/checkout/*`, `/wishlist`, `/admin/*`, `/api/auth/*`, `/api/account/*`, and every non-GET/HEAD request. Do not cache responses carrying `private` or `no-store` directives.
5. Attach the custom domain and managed TLS certificate to Front Door and enforce HTTPS there. Configure the WAF policy/rules on Front Door; there is no client-side or application WAF implementation.

To demonstrate stale catalog content, request `/api/products/:id` through Front Door, edit that product's name, price or description through the admin product form, then request it again through Front Door. The origin is updated immediately; Front Door may continue serving its cached copy for up to the 60-second TTL. After cache expiration or an Azure Front Door purge, a new origin response contains the updated data. No database reset is required.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma Client and build Next.js |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma validate` | Validate the Prisma schema |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio |

## Vercel deployment

1. Import the repository into Vercel and select the Next.js framework preset.
2. Add `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` to the Production environment. Keep the database URL server-only; do not prefix it with `NEXT_PUBLIC_`.
3. Set the build command to `npm run build`. The build script generates Prisma Client before `next build`.
4. Apply committed migrations to the production Neon database with `npx prisma migrate deploy` as a deployment step. Do not run `migrate dev` against production.
5. Deploy. Vercel runs the Next.js application; no separate Express server is needed.

Use separate Neon branches/databases for development and production. Keep local `.env` and `.env.local` files out of source control. The initial seed is intended for development and should not be run against production without reviewing its demo accounts and sample data.

## Troubleshooting

- **Prisma cannot find `DATABASE_URL`:** confirm `.env` is at the project root and contains a valid Neon URL. Restart the terminal after changing environment configuration.
- **Authentication fails:** check `AUTH_SECRET`, restart the app, and confirm the user was seeded or registered. Credentials are case-insensitive by email; passwords are case-sensitive.
- **Products are missing:** run `npm run db:seed` and confirm the application and Prisma CLI use the same database URL.
- **Migration errors on Neon:** use the direct connection URL for migrations if the pooled URL is not enabled for your Neon configuration.
- **Build reports Prisma Client errors:** run `npx prisma generate`, then retry `npm run build`.
