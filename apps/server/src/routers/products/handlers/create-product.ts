import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { productImages, productUnits, products } from "@/db/schema/products";
import { store as storeTable } from "@/db/schema/store";
import { slugify } from "@/lib/slugify";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { uploadFile } from "@/lib/uploadthing/upload-file";

const createProductSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100, "Item name must be less than 100 characters"),
  description: z
    .string()
    .min(10)
    .max(2000, "Item description must be less than 2000 characters"),
  price: z.number().min(0, "Item price must be greater than 0"),
  quantity: z.number().min(0, "Item quantity must be greater than 0"),
  unit: z.enum(productUnits.enumValues, "Item unit is required"),
  inStock: z.boolean().default(true),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  badge: z.string().optional(),
  images: z
    .array(z.string())
    .min(1)
    .max(10, "Item images must be less than 10"),
  storeId: z.string().min(1, "Store ID is required"),
});

const createProduct = protectedProcedure
  .input(createProductSchema)
  .handler(async ({ context, input }) => {
    const {
      name,
      description,
      price,
      quantity,
      unit,
      inStock,
      weight,
      dimensions,
      badge,
      images,
      storeId,
    } = input;

    const slug = slugify(name);
    console.log("product slug is: ", slug);

    try {
      const store = await db
        .select()
        .from(storeTable)
        .where(
          and(
            eq(storeTable.id, storeId),
            eq(storeTable.userId, context.session.user.id)
          )
        );

      if (!store) {
        throw new ORPCError("NOT_FOUND", {
          message: "Store not found",
        });
      }

      let storeSlug: string;

      const slugExists = await db
        .select()
        .from(products)
        .where(and(eq(products.slug, slug), eq(products.storeId, storeId)));

      if (slugExists.length > 0) {
        storeSlug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
      } else {
        storeSlug = slug;
      }

      const sku = `${storeSlug.slice(0, 5)}-${crypto.randomUUID().slice(0, 4)}`;

      let imageUrls: string[] = [];

      for (const image of images) {
        const base64Data = image.replace(/^data:.*?;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const fileName = `product-image-${Date.now()}.png`;
        const file = new File([buffer], fileName, {
          type: "image/png",
        });

        const imageUrl = await uploadFile(file, "productImages", store[0].id);
        imageUrls.push(imageUrl);
      }

      const product = await db.transaction(async (tx) => {
        const [newProduct] = await tx
          .insert(products)
          .values({
            name,
            slug: storeSlug,
            description,
            price: price.toString(),
            quantity: Math.floor(quantity),
            unit,
            inStock,
            weight,
            dimensions,
            badge,
            storeId,
            sku,
          })
          .returning();

        await tx.insert(productImages).values(
          imageUrls.map((url, index) => ({
            productId: newProduct.id,
            url,
            alt: name,
            isPrimary: index === 0,
          }))
        );

        return newProduct;
      });

      return product;
    } catch (error) {
      console.warn("error in create store oRPC handler");
      console.error(error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create store",
      });
    }
  });

export { createProduct };
