import { createProduct } from "./handlers/create-product";
import { getProducts } from "./handlers/get-products";

export const productsRouter = {
  createProduct,
  getProducts,
};
