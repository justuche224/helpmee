import { createStore } from "./handlers/create-store";
import { getUsersStore } from "./handlers/get-users-store";
import { getStoreCategories } from "./handlers/get-categories";
import { getStoreTemplates } from "./handlers/get-templates";
import { getStoreTiers } from "./handlers/get-tiers";
import { createBanner } from "./handlers/create-banner";
import { getStoreBanners } from "./handlers/get-banners";
import { uploadLogo } from "./handlers/logo";
import { updatePublicDescription } from "./handlers/public-description";

export const storeRouter = {
  createStore,
  getUsersStore,
  categories: {
    getStoreCategories,
  },
  templates: {
    getStoreTemplates,
  },
  tiers: {
    getStoreTiers,
  },
  banners: {
    createBanner,
    getStoreBanners,
  },
  logo: {
    uploadLogo,
  },
  publicDescription: {
    updatePublicDescription,
  },
};
