import { uploadKYC } from "./handlers/upload-kyc";
import { getUserKYC } from "./handlers/get-kyc";

export const kycRouter = {
  uploadKYC,
  getUserKYC,
};
