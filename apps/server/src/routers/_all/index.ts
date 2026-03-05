import { getAllCategories } from "./categories/handlers/get-all-categories";
import { getPreferedCategories } from "./categories/handlers/get-prefered-categories";
import { getCategoryById } from "./categories/handlers/get-category-by-id";
import { getProducts } from "./products/handlers/get-products";
import { getProductById } from "./products/handlers/get-product-by-id";
import { getReviews } from "./products/handlers/get-reviews";
import { search } from "./products/handlers/search";
import { cartHandlers } from "./cart/handlers/index";
import { savedHandlers } from "./products/handlers/saved";

const generalRouter = {
  categories: {
    getAllCategories,
    getPreferedCategories,
    getCategoryById,
  },
  cart: {
    ...cartHandlers,
  },
  products: {
    reviews: {
      getReviews,
    },
    getProducts,
    getProductById,
    search,
    saved: {
      ...savedHandlers,
    },
  },
};

export { generalRouter };
