import { db } from "@/db";
import {
  userLocation as userLocationTable,
  preferedStoreCategories as preferedStoreCategoriesTable,
  user as userTable,
} from "@/db/schema";
import {
  products as productsTable,
  ratings,
  productImages,
} from "@/db/schema/products";
import {
  store as storeTable,
  storeCategory as storeCategoryTable,
} from "@/db/schema/store";
import { protectedProcedure } from "@/lib/orpc";
import {
  eq,
  inArray,
  and,
  or,
  sql,
  avg,
  desc,
  asc,
  not,
  isNull,
  gt,
} from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/server";

const getProductsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  offset: z.number().min(0).optional(),
  getRecommended: z.boolean().optional().default(false),
  sortBy: z
    .enum(["price_asc", "price_desc", "rating", "newest", "random"])
    .optional()
    .default("newest"),
  categoryId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStockOnly: z.boolean().optional().default(true),
});

const getProducts = protectedProcedure
  .input(getProductsSchema)
  .handler(async ({ context, input }) => {
    const {
      limit,
      page,
      offset: inputOffset,
      getRecommended,
      sortBy,
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
    } = input;

    const userId = context.session.user.id;
    const calculatedOffset = inputOffset ?? (page - 1) * limit;

    if (getRecommended) {
      return await getRecommendedProducts({
        userId,
        limit,
        offset: calculatedOffset,
        sortBy,
        categoryId,
        minPrice,
        maxPrice,
        inStockOnly,
      });
    }

    return await getAllProducts({
      userId,
      limit,
      offset: calculatedOffset,
      sortBy,
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
    });
  });

async function getRecommendedProducts(params: {
  userId: string;
  limit: number;
  offset: number;
  sortBy: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
}) {
  const {
    userId,
    limit,
    offset,
    sortBy,
    categoryId,
    minPrice,
    maxPrice,
    inStockOnly,
  } = params;
  try {
    const [userLocationData, preferredCategories] = await Promise.all([
      db
        .select({
          country: userLocationTable.country,
          state: userLocationTable.state,
          city: userLocationTable.city,
        })
        .from(userLocationTable)
        .where(eq(userLocationTable.userId, userId))
        .limit(1),

      db
        .select({
          categoryId: preferedStoreCategoriesTable.categoryId,
        })
        .from(preferedStoreCategoriesTable)
        .where(eq(preferedStoreCategoriesTable.userId, userId)),
    ]);

    const userLocation = userLocationData[0];
    const preferredCategoryIds = preferredCategories.map(
      (cat) => cat.categoryId
    );

    const storeFilters = [
      eq(storeTable.status, "APPROVED"),
      categoryId ? eq(storeTable.categoryId, categoryId) : undefined,
    ].filter(Boolean);

    const productFilters = {
      inStockOnly,
      minPrice,
      maxPrice,
    };

    const priorityProducts: any[] = [];
    const fallbackProducts: any[] = [];
    let remainingLimit = limit;

    if (
      userLocation &&
      (userLocation.country || userLocation.state || userLocation.city)
    ) {
      const locationStores = await getStoresByLocation(
        userLocation,
        preferredCategoryIds,
        storeFilters,
        Math.ceil(limit * 0.6)
      );
      if (locationStores.length > 0) {
        const locationProducts = await getProductsFromStores(
          locationStores,
          remainingLimit,
          sortBy,
          offset,
          productFilters
        );
        priorityProducts.push(...locationProducts);
        remainingLimit = Math.max(0, limit - priorityProducts.length);
      }
    }

    if (remainingLimit > 0 && preferredCategoryIds.length > 0) {
      const categoryStores = await getStoresByCategories(
        preferredCategoryIds,
        userLocation,
        storeFilters,
        Math.ceil(remainingLimit * 0.8)
      );
      if (categoryStores.length > 0) {
        const categoryProducts = await getProductsFromStores(
          categoryStores.filter(
            (store) => !priorityProducts.some((p) => p.storeId === store.id)
          ),
          remainingLimit,
          sortBy,
          Math.max(0, offset - priorityProducts.length),
          productFilters
        );
        priorityProducts.push(...categoryProducts);
        remainingLimit = Math.max(0, limit - priorityProducts.length);
      }
    }

    if (remainingLimit > 0) {
      const otherProducts = await getOtherProducts(
        [...priorityProducts.map((p) => p.storeId)],
        storeFilters,
        remainingLimit,
        sortBy,
        Math.max(0, offset - priorityProducts.length),
        productFilters
      );
      fallbackProducts.push(...otherProducts);
    }

    const allProducts = [...priorityProducts, ...fallbackProducts];
    return distributeProducts(allProducts, limit);
  } catch (error) {
    console.warn("Failed to get recommended products");
    console.error(error);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Error getting products",
      cause: error,
    });
  }
}

async function getAllProducts(params: {
  userId: string;
  limit: number;
  offset: number;
  sortBy: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
}) {
  try {
    const {
      limit,
      offset,
      sortBy,
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
    } = params;

    const whereConditions = [
      eq(storeTable.status, "APPROVED"),
      inStockOnly ? eq(productsTable.inStock, true) : undefined,
      categoryId ? eq(storeTable.categoryId, categoryId) : undefined,
      minPrice
        ? sql`${productsTable.price}::numeric >= ${minPrice}`
        : undefined,
      maxPrice
        ? sql`${productsTable.price}::numeric <= ${maxPrice}`
        : undefined,
    ].filter(Boolean);

    let orderBy;
    switch (sortBy) {
      case "price_asc":
        orderBy = asc(productsTable.price);
        break;
      case "price_desc":
        orderBy = desc(productsTable.price);
        break;
      case "rating":
        orderBy = desc(sql`COALESCE(${avg(ratings.rating)}, 0)`);
        break;
      case "random":
        orderBy = sql`RANDOM()`;
        break;
      case "newest":
      default:
        orderBy = desc(productsTable.createdAt);
        break;
    }

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        quantity: productsTable.quantity,
        unit: productsTable.unit,
        inStock: productsTable.inStock,
        badge: productsTable.badge,
        sku: productsTable.sku,
        weight: productsTable.weight,
        dimensions: productsTable.dimensions,
        storeId: productsTable.storeId,
        storeName: storeTable.name,
        storeSlug: storeTable.slug,
        averageRating: sql<number>`COALESCE(${avg(ratings.rating)}, 0)`.as(
          "averageRating"
        ),
        ratingCount: sql<number>`COUNT(${ratings.id})`.as("ratingCount"),
        primaryImage: productImages.url,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .innerJoin(storeTable, eq(productsTable.storeId, storeTable.id))
      .leftJoin(ratings, eq(productsTable.id, ratings.productId))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, productsTable.id),
          eq(productImages.isPrimary, true)
        )
      )
      .where(and(...whereConditions))
      .groupBy(
        productsTable.id,
        productsTable.name,
        productsTable.slug,
        productsTable.description,
        productsTable.price,
        productsTable.quantity,
        productsTable.unit,
        productsTable.inStock,
        productsTable.badge,
        productsTable.sku,
        productsTable.weight,
        productsTable.dimensions,
        productsTable.storeId,
        productsTable.createdAt,
        productsTable.updatedAt,
        storeTable.name,
        storeTable.slug,
        productImages.url
      )
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      products,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.warn("Failed to get all products");
    console.error(error);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Error getting products",
      cause: error,
    });
  }
}

async function getStoresByLocation(
  userLocation: {
    country?: string | null;
    state?: string | null;
    city?: string | null;
  },
  preferredCategoryIds: string[],
  storeFilters: any[],
  limit: number
) {
  const locationConditions = [
    userLocation.city ? eq(storeTable.address, userLocation.city) : undefined,
    userLocation.state ? eq(storeTable.state, userLocation.state) : undefined,
    userLocation.country
      ? eq(storeTable.country, userLocation.country)
      : undefined,
  ].filter(Boolean);

  if (locationConditions.length === 0) return [];

  const whereConditions = [
    ...storeFilters,
    or(...locationConditions),
    preferredCategoryIds.length > 0
      ? inArray(storeTable.categoryId, preferredCategoryIds)
      : undefined,
  ].filter(Boolean);

  return await db
    .select({
      id: storeTable.id,
      name: storeTable.name,
      slug: storeTable.slug,
      categoryId: storeTable.categoryId,
    })
    .from(storeTable)
    .where(and(...whereConditions))
    .limit(limit);
}

async function getStoresByCategories(
  preferredCategoryIds: string[],
  userLocation:
    | { country?: string | null; state?: string | null; city?: string | null }
    | undefined,
  storeFilters: any[],
  limit: number
) {
  const whereConditions = [
    ...storeFilters,
    inArray(storeTable.categoryId, preferredCategoryIds),
  ].filter(Boolean);

  return await db
    .select({
      id: storeTable.id,
      name: storeTable.name,
      slug: storeTable.slug,
      categoryId: storeTable.categoryId,
    })
    .from(storeTable)
    .where(and(...whereConditions))
    .limit(limit);
}

async function getProductsFromStores(
  stores: any[],
  limit: number,
  sortBy: string,
  offset: number,
  productFilters: {
    inStockOnly: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  if (stores.length === 0) return [];

  const storeIds = stores.map((store) => store.id);

  const whereConditions = [
    inArray(productsTable.storeId, storeIds),
    productFilters.inStockOnly ? eq(productsTable.inStock, true) : undefined,
    productFilters.minPrice
      ? sql`${productsTable.price}::numeric >= ${productFilters.minPrice}`
      : undefined,
    productFilters.maxPrice
      ? sql`${productsTable.price}::numeric <= ${productFilters.maxPrice}`
      : undefined,
  ].filter(Boolean);

  let orderBy;
  switch (sortBy) {
    case "price_asc":
      orderBy = asc(productsTable.price);
      break;
    case "price_desc":
      orderBy = desc(productsTable.price);
      break;
    case "rating":
      orderBy = desc(sql`COALESCE(${avg(ratings.rating)}, 0)`);
      break;
    case "random":
      orderBy = sql`RANDOM()`;
      break;
    case "newest":
    default:
      orderBy = desc(productsTable.createdAt);
      break;
  }

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      price: productsTable.price,
      quantity: productsTable.quantity,
      unit: productsTable.unit,
      inStock: productsTable.inStock,
      badge: productsTable.badge,
      sku: productsTable.sku,
      weight: productsTable.weight,
      dimensions: productsTable.dimensions,
      storeId: productsTable.storeId,
      storeName: storeTable.name,
      storeSlug: storeTable.slug,
      averageRating: sql<number>`COALESCE(${avg(ratings.rating)}, 0)`.as(
        "averageRating"
      ),
      ratingCount: sql<number>`COUNT(${ratings.id})`.as("ratingCount"),
      primaryImage: productImages.url,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .innerJoin(storeTable, eq(productsTable.storeId, storeTable.id))
    .leftJoin(ratings, eq(productsTable.id, ratings.productId))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, productsTable.id),
        eq(productImages.isPrimary, true)
      )
    )
    .where(and(...whereConditions))
    .groupBy(
      productsTable.id,
      productsTable.name,
      productsTable.slug,
      productsTable.description,
      productsTable.price,
      productsTable.quantity,
      productsTable.unit,
      productsTable.inStock,
      productsTable.badge,
      productsTable.sku,
      productsTable.weight,
      productsTable.dimensions,
      productsTable.storeId,
      productsTable.createdAt,
      productsTable.updatedAt,
      storeTable.name,
      storeTable.slug,
      productImages.url
    )
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return products;
}

async function getOtherProducts(
  excludeStoreIds: string[],
  storeFilters: any[],
  limit: number,
  sortBy: string,
  offset: number,
  productFilters: {
    inStockOnly: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  const whereConditions = [
    eq(storeTable.status, "APPROVED"),
    excludeStoreIds.length > 0
      ? not(inArray(storeTable.id, excludeStoreIds))
      : undefined,
    productFilters.inStockOnly ? eq(productsTable.inStock, true) : undefined,
    productFilters.minPrice
      ? sql`${productsTable.price}::numeric >= ${productFilters.minPrice}`
      : undefined,
    productFilters.maxPrice
      ? sql`${productsTable.price}::numeric <= ${productFilters.maxPrice}`
      : undefined,
  ].filter(Boolean);

  let orderBy;
  switch (sortBy) {
    case "price_asc":
      orderBy = asc(productsTable.price);
      break;
    case "price_desc":
      orderBy = desc(productsTable.price);
      break;
    case "rating":
      orderBy = desc(sql`COALESCE(${avg(ratings.rating)}, 0)`);
      break;
    case "random":
      orderBy = sql`RANDOM()`;
      break;
    case "newest":
    default:
      orderBy = desc(productsTable.createdAt);
      break;
  }

  return await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      price: productsTable.price,
      quantity: productsTable.quantity,
      unit: productsTable.unit,
      inStock: productsTable.inStock,
      badge: productsTable.badge,
      sku: productsTable.sku,
      weight: productsTable.weight,
      dimensions: productsTable.dimensions,
      storeId: productsTable.storeId,
      storeName: storeTable.name,
      storeSlug: storeTable.slug,
      averageRating: sql<number>`COALESCE(${avg(ratings.rating)}, 0)`.as(
        "averageRating"
      ),
      ratingCount: sql<number>`COUNT(${ratings.id})`.as("ratingCount"),
      primaryImage: productImages.url,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .innerJoin(storeTable, eq(productsTable.storeId, storeTable.id))
    .leftJoin(ratings, eq(productsTable.id, ratings.productId))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, productsTable.id),
        eq(productImages.isPrimary, true)
      )
    )
    .where(and(...whereConditions))
    .groupBy(
      productsTable.id,
      productsTable.name,
      productsTable.slug,
      productsTable.description,
      productsTable.price,
      productsTable.quantity,
      productsTable.unit,
      productsTable.inStock,
      productsTable.badge,
      productsTable.sku,
      productsTable.weight,
      productsTable.dimensions,
      productsTable.storeId,
      productsTable.createdAt,
      productsTable.updatedAt,
      storeTable.name,
      storeTable.slug,
      productImages.url
    )
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
}

function distributeProducts(products: any[], limit: number) {
  if (products.length <= limit) {
    return {
      products,
      pagination: {
        page: 1,
        limit,
        offset: 0,
        total: products.length,
      },
    };
  }

  const storeProductMap = new Map<string, any[]>();
  products.forEach((product) => {
    if (!storeProductMap.has(product.storeId)) {
      storeProductMap.set(product.storeId, []);
    }
    storeProductMap.get(product.storeId)!.push(product);
  });

  const distributedProducts: any[] = [];
  const stores = Array.from(storeProductMap.keys());
  const maxProductsPerStore = Math.max(1, Math.floor(limit / stores.length));

  stores.forEach((storeId) => {
    const storeProducts = storeProductMap.get(storeId)!;
    const productsToAdd = storeProducts.slice(0, maxProductsPerStore);
    distributedProducts.push(...productsToAdd);
  });

  const remainingSlots = limit - distributedProducts.length;
  if (remainingSlots > 0) {
    const remainingProducts = products.filter(
      (p) => !distributedProducts.some((dp) => dp.id === p.id)
    );
    distributedProducts.push(...remainingProducts.slice(0, remainingSlots));
  }

  return {
    products: distributedProducts.slice(0, limit),
    pagination: {
      page: 1,
      limit,
      offset: 0,
      total: distributedProducts.length,
    },
  };
}

export { getProducts };
