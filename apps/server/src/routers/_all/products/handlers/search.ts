import { db } from "@/db";
import {
  products as productsTable,
  ratings,
  productImages,
} from "@/db/schema/products";
import {
  store as storeTable,
  storeCategory as storeCategoryTable,
  storeExtraDetails,
} from "@/db/schema/store";
import { protectedProcedure } from "@/lib/orpc";
import { eq, and, or, sql, desc, asc, avg, like, ilike } from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/server";

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).optional().default(20),
  page: z.number().min(1).optional().default(1),
  offset: z.number().min(0).optional(),
  searchIn: z.enum(["all", "products", "stores"]).optional().default("all"),
  sortBy: z
    .enum(["relevance", "price_asc", "price_desc", "rating", "newest"])
    .optional()
    .default("relevance"),
  categoryId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStockOnly: z.boolean().optional().default(true),
});

function normalizeSearchText(text: string): string {
  return (
    text
      // Remove special characters and symbols
      .replace(/[^\w\s]/g, " ")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

function generateSearchTerms(query: string): {
  normalized: string;
  terms: string[];
} {
  const normalized = normalizeSearchText(query);
  const terms = normalized.split(" ").filter((term) => term.length > 0);
  return { normalized, terms };
}

function createProductSearchConditions(searchTerms: string[], filters: any) {
  const { categoryId, minPrice, maxPrice, inStockOnly } = filters;

  const searchConditions = searchTerms.map((term) =>
    or(
      ilike(productsTable.name, `%${term}%`),
      ilike(productsTable.description, `%${term}%`),
      ilike(productsTable.sku, `%${term}%`),
      ilike(productsTable.badge, `%${term}%`),
      ilike(storeTable.name, `%${term}%`),
      ilike(storeTable.description, `%${term}%`),
      ilike(storeCategoryTable.name, `%${term}%`)
    )
  );

  const filterConditions = [
    eq(storeTable.status, "APPROVED"),
    inStockOnly ? eq(productsTable.inStock, true) : undefined,
    categoryId ? eq(storeTable.categoryId, categoryId) : undefined,
    minPrice ? sql`${productsTable.price}::numeric >= ${minPrice}` : undefined,
    maxPrice ? sql`${productsTable.price}::numeric <= ${maxPrice}` : undefined,
  ].filter(Boolean);

  return {
    searchConditions,
    filterConditions,
  };
}

function createStoreSearchConditions(searchTerms: string[], filters: any) {
  const { categoryId } = filters;

  const searchConditions = searchTerms.map((term) =>
    or(
      ilike(storeTable.name, `%${term}%`),
      ilike(storeTable.description, `%${term}%`),
      ilike(storeCategoryTable.name, `%${term}%`)
    )
  );

  const filterConditions = [
    eq(storeTable.status, "APPROVED"),
    categoryId ? eq(storeTable.categoryId, categoryId) : undefined,
  ].filter(Boolean);

  return {
    searchConditions,
    filterConditions,
  };
}

async function searchProducts(
  searchTerms: string[],
  filters: any,
  limit: number,
  offset: number,
  sortBy: string
) {
  const { searchConditions, filterConditions } = createProductSearchConditions(
    searchTerms,
    filters
  );

  const whereConditions = [or(...searchConditions), ...filterConditions].filter(
    Boolean
  );

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
    case "newest":
      orderBy = desc(productsTable.createdAt);
      break;
    case "relevance":
    default:
      // For relevance, use a combination of rating and recency
      orderBy = desc(
        sql`COALESCE(${avg(ratings.rating)}, 0) + (EXTRACT(EPOCH FROM ${productsTable.createdAt}) / 1000000000)`
      );
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
      storeCategory: storeCategoryTable.name,
      averageRating: sql<number>`COALESCE(${avg(ratings.rating)}, 0)`.as(
        "averageRating"
      ),
      ratingCount: sql<number>`COUNT(${ratings.id})`.as("ratingCount"),
      primaryImage: productImages.url,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
      relevanceScore: sql<number>`
        CASE
          WHEN ${productsTable.name} ILIKE ${`%${searchTerms.join("%")}%`} THEN 10
          WHEN ${productsTable.name} ILIKE ${`%${searchTerms[0]}%`} THEN 5
          ELSE 1
        END +
        CASE
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms.join("%")}%`} THEN 8
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms[0]}%`} THEN 4
          ELSE 0
        END
      `.as("relevanceScore"),
    })
    .from(productsTable)
    .innerJoin(storeTable, eq(productsTable.storeId, storeTable.id))
    .innerJoin(
      storeCategoryTable,
      eq(storeTable.categoryId, storeCategoryTable.id)
    )
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
      storeCategoryTable.name,
      productImages.url
    )
    .orderBy(desc(sql`"relevanceScore"`), orderBy)
    .limit(limit)
    .offset(offset);

  return products;
}

async function searchStores(
  searchTerms: string[],
  filters: any,
  limit: number,
  offset: number,
  sortBy: string
) {
  const { searchConditions, filterConditions } = createStoreSearchConditions(
    searchTerms,
    filters
  );

  const whereConditions = [or(...searchConditions), ...filterConditions].filter(
    Boolean
  );

  let orderBy;
  switch (sortBy) {
    case "newest":
      orderBy = desc(storeTable.createdAt);
      break;
    case "relevance":
    default:
      // For relevance, use recency and name matching
      orderBy = desc(sql`
        CASE
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms.join("%")}%`} THEN 10
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms[0]}%`} THEN 5
          ELSE 1
        END +
        (EXTRACT(EPOCH FROM ${storeTable.createdAt}) / 1000000000)
      `);
      break;
  }

  const stores = await db
    .select({
      id: storeTable.id,
      name: storeTable.name,
      slug: storeTable.slug,
      description: storeTable.description,
      ownerName: storeTable.ownerName,
      phoneNumber: storeTable.phoneNumber,
      country: storeTable.country,
      state: storeTable.state,
      city: storeTable.address,
      categoryId: storeTable.categoryId,
      categoryName: storeCategoryTable.name,
      categorySlug: storeCategoryTable.slug,
      status: storeTable.status,
      verificationStatus: storeTable.verificationStatus,
      tierId: storeTable.tierId,
      logo: storeExtraDetails.logo,
      coverImage: storeExtraDetails.coverImage,
      publicDescription: storeExtraDetails.publicDescription,
      createdAt: storeTable.createdAt,
      updatedAt: storeTable.updatedAt,
      relevanceScore: sql<number>`
        CASE
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms.join("%")}%`} THEN 10
          WHEN ${storeTable.name} ILIKE ${`%${searchTerms[0]}%`} THEN 5
          ELSE 1
        END +
        CASE
          WHEN ${storeCategoryTable.name} ILIKE ${`%${searchTerms.join("%")}%`} THEN 8
          WHEN ${storeCategoryTable.name} ILIKE ${`%${searchTerms[0]}%`} THEN 4
          ELSE 0
        END
      `.as("relevanceScore"),
    })
    .from(storeTable)
    .innerJoin(
      storeCategoryTable,
      eq(storeTable.categoryId, storeCategoryTable.id)
    )
    .leftJoin(storeExtraDetails, eq(storeTable.id, storeExtraDetails.storeId))
    .where(and(...whereConditions))
    .orderBy(desc(sql`"relevanceScore"`), orderBy)
    .limit(limit)
    .offset(offset);

  return stores;
}

const search = protectedProcedure
  .input(searchSchema)
  .handler(async ({ context, input }) => {
    try {
      const {
        query,
        limit,
        page,
        offset: inputOffset,
        searchIn,
        sortBy,
        categoryId,
        minPrice,
        maxPrice,
        inStockOnly,
      } = input;

      const calculatedOffset = inputOffset ?? (page - 1) * limit;
      const { terms: searchTerms } = generateSearchTerms(query);

      if (searchTerms.length === 0) {
        return {
          stores: [],
          products: [],
          pagination: {
            page,
            limit,
            offset: calculatedOffset,
            totalStores: 0,
            totalProducts: 0,
          },
        };
      }

      const filters = {
        categoryId,
        minPrice,
        maxPrice,
        inStockOnly,
      };

      const searchPromises = [];

      if (searchIn === "all" || searchIn === "products") {
        searchPromises.push(
          searchProducts(searchTerms, filters, limit, calculatedOffset, sortBy)
        );
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      if (searchIn === "all" || searchIn === "stores") {
        searchPromises.push(
          searchStores(searchTerms, filters, limit, calculatedOffset, sortBy)
        );
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      const [products, stores] = await Promise.all(searchPromises);

      return {
        stores,
        products,
        pagination: {
          page,
          limit,
          offset: calculatedOffset,
          totalStores: stores.length,
          totalProducts: products.length,
        },
      };
    } catch (error) {
      console.error("Search error:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error performing search",
        cause: error,
      });
    }
  });

export { search };
