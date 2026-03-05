import {
  createAccount,
  getTransactionHistory,
  getUserWallet,
  hasWallet,
} from "./wallet/handlers/wallet";
import { hasPin, setPin, changePin } from "./pin/handlers/pin";
import {
  initiateDeposit,
  getPaymentStatusByReference,
} from "./wallet/deposit/handlers/deposit";
import { getTransactionByReference } from "./wallet/transactions/handlers/transactions";

export const financeRouter = {
  wallet: {
    getUserWallet,
    createAccount,
    getTransactionHistory,
    hasWallet,
  },
  pin: {
    hasPin,
    setPin,
    changePin,
  },
  deposit: {
    initiateDeposit,
    getPaymentStatusByReference,
  },
  transactions: {
    getTransactionByReference,
  },
};
