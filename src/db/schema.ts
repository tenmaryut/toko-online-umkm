import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { METODE_PEMBAYARAN, STATUS_PESANAN } from "../lib/order-status";

const sekarangMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

const waktu = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sekarangMs),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sekarangMs)
    .$onUpdate(() => new Date()),
};

// ---------- Tabel Better Auth (nama model: user, session, account, verification) ----------

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  /** "customer" atau "admin". Tidak bisa diisi lewat form pendaftaran (input: false). */
  role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
  /** Akun bawaan data demo (dibuat ulang tiap reset malam). */
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...waktu,
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...waktu,
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    /** Hash scrypt dari Better Auth; kata sandi asli tidak pernah disimpan. */
    password: text("password"),
    ...waktu,
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...waktu,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ---------- Tabel toko ----------

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  ...waktu,
});

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    /** Harga dalam Rupiah (bilangan bulat). */
    price: integer("price").notNull(),
    stock: integer("stock").notNull().default(0),
    weightGrams: integer("weight_grams").notNull().default(100),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    /** "/images/produk/<slug>.svg" (bawaan) atau "/uploads/<id>.webp" (unggahan admin). */
    imagePath: text("image_path").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    soldCount: integer("sold_count").notNull().default(0),
    ...waktu,
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    check("products_price_nonneg", sql`${t.price} >= 0`),
    // Penjaga terakhir: stok tidak bisa negatif walau ada pesanan bersamaan.
    check("products_stock_nonneg", sql`${t.stock} >= 0`),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: STATUS_PESANAN }).notNull().default("menunggu_pembayaran"),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone").notNull(),
    addressLine: text("address_line").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code").notNull(),
    shippingZone: text("shipping_zone").notNull(),
    shippingService: text("shipping_service").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    paymentMethod: text("payment_method", { enum: METODE_PEMBAYARAN }).notNull(),
    note: text("note").notNull().default(""),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    ...waktu,
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    // Salinan data produk saat dibeli, supaya riwayat tetap benar walau produk diubah.
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId), index("order_items_product_idx").on(t.productId)],
);

export const orderStatusHistory = sqliteTable(
  "order_status_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: text("status", { enum: STATUS_PESANAN }).notNull(),
    actor: text("actor", { enum: ["pelanggan", "admin", "sistem"] }).notNull(),
    note: text("note").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sekarangMs),
  },
  (t) => [index("order_history_order_idx").on(t.orderId)],
);

// ---------- Relasi (untuk relational query) ----------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  orders: many(orders),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
  history: many(orderStatusHistory),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const orderHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

export type Produk = typeof products.$inferSelect;
export type Kategori = typeof categories.$inferSelect;
export type Pesanan = typeof orders.$inferSelect;
export type ItemPesanan = typeof orderItems.$inferSelect;
