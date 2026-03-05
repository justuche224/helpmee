const productionSeed = {
  platformParentId: 6,
  platformIncomingId: 7,
  pendingPayoutsId: 8,
  platformOperationalId: 9,
  feesAccountId: 10,
  providerFloatId: 11,
};

const developmentSeed = {
  platformParentId: 1,
  platformIncomingId: 2,
  pendingPayoutsId: 3,
  platformOperationalId: 4,
  feesAccountId: 5,
  providerFloatId: 6,
};

export const SEED =
  process.env.NODE_ENV === "production" ? productionSeed : developmentSeed;
