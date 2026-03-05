import {
  getStorePreference,
  updatePreferedStoreCategories,
  updateUserLocation,
  deleteUserLocation,
} from "./handlers/store-preference";
import { getUserGender, updateUserGender } from "./handlers/gender";
import { shippingAddress } from "./handlers/shipping-address";

const userRouter = {
  storePreference: {
    getStorePreference,
    updatePreferedStoreCategories,
    updateUserLocation,
    deleteUserLocation,
  },
  info: {
    gender: {
      getUserGender,
      updateUserGender,
    },
  },
  shippingAddress,
};

export { userRouter };
