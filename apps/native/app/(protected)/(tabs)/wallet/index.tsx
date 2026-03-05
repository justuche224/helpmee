import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import Wallet from "@/assets/images/wallet/wallet.png";
import formatPrice from "@/utils/price-formatter";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import Error from "@/components/error";
import Toast from "react-native-toast-message";
import transferIcon from "@/assets/icons/wallet/transfer.png";
import withdrawIcon from "@/assets/icons/wallet/withdraw.png";
import emptyTransactionHistory from "@/assets/images/wallet/empty.png";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import InllineLoader from "@/components/inlline-loader";
import InlineError from "@/components/inline-error";

interface TransactionItemType {
  id: number;
  amount: number;
  type: "credit" | "debit" | null;
  metadata: unknown;
  created_at: Date;
  journal_id: number;
}

const { card } = ICONS;

const PinPrompt = ({
  setShowPinPrompt,
}: {
  setShowPinPrompt: (show: boolean) => void;
}) => {
  const navigateToCreatePin = () => {
    setShowPinPrompt(false);
    router.push("/(protected)/(tabs)/profile/bank-account/create-pin");
  };

  return (
    <View className="absolute inset-0 flex-1 justify-center items-center z-50 bg-black/50">
      <View className="bg-white rounded-2xl mx-6 p-6 w-full max-w-sm">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-[#19B360]/10 rounded-full items-center justify-center mb-4">
            <Image
              source={require("@/assets/icons/bank-account/paddlock.png")}
              className="w-8 h-8"
              resizeMode="contain"
              tintColor="#19B360"
            />
          </View>

          <Text className="text-black text-xl font-bold text-center mb-2">
            Create Transaction PIN
          </Text>

          <Text className="text-[#8E9BAE] text-base text-center leading-6">
            You need a transaction PIN to perform wallet operations like
            transfers and withdrawals.
          </Text>
        </View>

        <View className="gap-y-3">
          <TouchableOpacity
            onPress={navigateToCreatePin}
            className="bg-[#19B360] rounded-lg p-4 w-full items-center"
          >
            <Text className="text-white text-base font-semibold">
              Create PIN Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPinPrompt(false)}
            className="bg-gray-100 rounded-lg p-4 w-full items-center"
          >
            <Text className="text-gray-600 text-base font-medium">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const TransactionItem = ({ item }: { item: TransactionItemType }) => {
  const isCredit = item.type === "credit";
  const amountColor = isCredit ? "text-green-600" : "text-red-600";
  const amountPrefix = isCredit ? "+" : "-";
  const iconColor = isCredit ? "bg-green-100" : "bg-red-100";
  // TODO: display date in the history list
  const date = item.created_at.toISOString().split("T")[0];

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className={`w-10 h-10 rounded-full ${iconColor} items-center justify-center`}
        >
          <Image
            source={card}
            className="w-5 h-5"
            resizeMode="contain"
            tintColor={isCredit ? "green" : "red"}
          />
        </View>
        <Text className="text-sm font-medium leading-5">
          {isCredit ? "Credit" : "Debit"}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-base font-semibold ${amountColor}`}>
          {amountPrefix} {formatPrice(item.amount / 100)}
        </Text>
      </View>
    </View>
  );
};

const index = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const { data: hasPin, isPending: isHasPinPending } = useQuery(
    orpc.finance.pin.hasPin.queryOptions({
      queryKey: ["pin", "has-pin"],
    })
  );

  const {
    data: userWallet,
    isPending: isUserWalletPending,
    error: userWalletError,
    refetch: refetchUserWallet,
  } = useQuery(
    orpc.finance.wallet.getUserWallet.queryOptions({
      queryKey: ["wallet", "user-wallet"],
    })
  );

  const {
    data: hasWallet,
    isPending: isHasWalletPending,
    error: hasWalletError,
    refetch: refetchHasWallet,
  } = useQuery(
    orpc.finance.wallet.hasWallet.queryOptions({
      queryKey: ["wallet", "has-wallet"],
    })
  );

  const {
    data: transactionHistory,
    isPending: isTransactionHistoryPending,
    error: transactionHistoryError,
    refetch: refetchTransactionHistory,
  } = useQuery(
    orpc.finance.wallet.getTransactionHistory.queryOptions({
      queryKey: ["wallet", "transaction-history"],
      input: {
        limit: 10,
        offset: 0,
      },
    })
  );

  useEffect(() => {
    if (!isHasPinPending && hasPin !== undefined) {
      setShowPinPrompt(hasPin === false);
    }
  }, [hasPin, isHasPinPending]);

  const createAccountMutation = useMutation(
    orpc.finance.wallet.createAccount.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Wallet created successfully",
        });
        refetchUserWallet();
        refetchHasWallet();
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to create wallet",
          text2: error.message,
        });
      },
    })
  );

  const handleCreateWallet = () => {
    createAccountMutation.mutate({});
  };

  const ListHeaderComponent = () => (
    <View className="mt-5 gap-y-5">
      {!hasWalletError && !isHasWalletPending && hasWallet === false && (
        <View className="w-full h-full flex-1 justify-center items-center gap-y-5">
          <Text className="text-gray-500 text-sm font-medium leading-5">
            You don't have a wallet yet
          </Text>
          <TouchableOpacity
            className="bg-[#19B360] rounded-lg p-4 w-full flex-row items-center gap-4 justify-center disabled:opacity-60"
            onPress={handleCreateWallet}
            disabled={createAccountMutation.isPending}
          >
            <Text className="text-white text-sm font-medium leading-5">
              {createAccountMutation.isPending
                ? "Creating..."
                : "Create Wallet"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <ImageBackground
        source={Wallet}
        className="w-full aspect-[1.847] p-5"
        resizeMode="contain"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text>Wallet Balance</Text>
            <Image
              source={ICONS.eye}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </View>
          <View>
            <Image
              source={ICONS.NigeriaFlag}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </View>
        </View>
        <View className="flex-1 justify-center">
          {isUserWalletPending ? (
            <InllineLoader />
          ) : userWalletError ? (
            <View className="w-full h-full flex-1 justify-center items-center gap-y-2">
              <Text className="text-gray-500 text-sm font-medium leading-5">
                Error fetching balance
              </Text>
              <TouchableOpacity
                className="bg-[#19B360] rounded-lg p-2 w-1/2 flex-row items-center gap-4 justify-center"
                onPress={() => refetchUserWallet()}
              >
                <Text className="text-white text-sm font-medium leading-5">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-3xl font-bold leading-10">
                {formatPrice(
                  userWallet?.available_balance
                    ? userWallet?.available_balance / 100
                    : 0
                )}
              </Text>
              <Text className="text-sm font-medium leading-5">Available</Text>
            </>
          )}
        </View>
        <View className="justify-end">
          <Text className="text-xl font-semibold">{session?.user?.name}</Text>
        </View>
      </ImageBackground>
      <View className="w-full gap-y-2">
        <TouchableOpacity
          disabled={!hasWallet || isHasWalletPending}
          onPress={() => router.push("/(protected)/(tabs)/wallet/deposit")}
          className="bg-black rounded-lg p-4 w-full flex-row items-center gap-4 justify-center disabled:opacity-60"
        >
          <Image source={ICONS.plus} className="w-6 h-6" resizeMode="contain" />
          <Text className="text-white text-lg font-medium leading-5">
            Top Up
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-4 justify-between">
          <TouchableOpacity
            disabled={!hasWallet || isHasWalletPending}
            onPress={() =>
              router.push(
                "/(protected)/(tabs)/wallet/deposit/verify?reference=muy6jv1az5"
              )
            }
            className="bg-[#f5f5f5] w-1/2 p-4 flex-row items-center justify-center gap-4 rounded-lg disabled:opacity-60"
          >
            <Image
              source={transferIcon}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <Text className="text-black text-lg font-medium leading-5">
              Transfer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!hasWallet || isHasWalletPending}
            className="bg-[#f5f5f5] w-1/2 p-4 flex-row items-center justify-center gap-4 rounded-lg disabled:opacity-60"
          >
            <Image
              source={withdrawIcon}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <Text className="text-black text-lg font-medium leading-5">
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text>Transaction History</Text>
        <TouchableOpacity className="flex-row items-center gap-2">
          <Text className="text-primary text-sm font-medium leading-5">
            See All
          </Text>
          <Image
            source={ICONS.rightArrow}
            className="w-3 h-3"
            resizeMode="contain"
            tintColor="green"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error.message} refetch={refetch} />;
  }

  return (
    <Container>
      <View className="flex-row justify-between items-center px-3 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={ICONS.arrowLeft}
            className="w-auto h-5 text-black"
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text className="text-black text-xl font-bold">Helpmee Wallet</Text>
        <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
          <Image
            source={ICONS.notificationBell}
            className="w-6 h-6"
            resizeMode="contain"
          />
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactionHistory?.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 25 }}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          isTransactionHistoryPending ? (
            <View className="w-full h-full flex-1 justify-center items-center mt-10">
              <InllineLoader />
              <Text className="text-gray-500 text-sm font-medium leading-5 mt-2">
                Loading transactions...
              </Text>
            </View>
          ) : transactionHistoryError ? (
            <View className="w-full h-full flex-1 justify-center items-center mt-10 gap-y-2">
              <InlineError
                error={
                  transactionHistoryError?.message ||
                  "Failed to load transactions"
                }
                refetch={refetchTransactionHistory}
              />
            </View>
          ) : (
            <View className="w-full h-full flex-1 justify-center items-center mt-10">
              <Image
                source={emptyTransactionHistory}
                className="aspect-square w-16 h-16"
                width={50}
                height={50}
                resizeMode="contain"
              />
              <Text className="text-gray-500 text-sm font-medium leading-5">
                No transaction history
              </Text>
            </View>
          )
        }
        refreshing={isTransactionHistoryPending}
        onRefresh={refetchTransactionHistory}
      />
      {showPinPrompt && <PinPrompt setShowPinPrompt={setShowPinPrompt} />}
    </Container>
  );
};

export default index;
