import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Share,
} from "react-native";
import React, { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Container } from "@/components/container";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ICONS, LOGO } from "@/constants";
import InlineError from "@/components/inline-error";
import InllineLoader from "@/components/inlline-loader";
import formatPrice from "@/utils/price-formatter";
import * as Clipboard from "expo-clipboard";

const Verify = () => {
  const params = useLocalSearchParams();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const {
    data: statusInfo,
    isPending,
    error,
    refetch,
  } = useQuery(
    orpc.finance.deposit.getPaymentStatusByReference.queryOptions({
      input: { reference: params.reference as string },
      queryKey: [
        "deposit",
        "transaction",
        "status",
        "reference",
        params.reference,
      ],
    })
  );

  console.log(params);
  // TODO: Add details to the transaction and handle other statuses
  // success
  // abandoned
  // failed

  return (
    <View className="flex-1 bg-[#19B360] h-full mb-16">
      <StatusBar style="light" />
      <Container bgColor="#19B360">
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-white/10 bg-[#19B360]">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5"
              resizeMode="contain"
              tintColor="#FFFFFF"
            />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Deposit</Text>
          <TouchableOpacity
            className="bg-white/10 rounded-full p-2 relative"
            onPress={() =>
              router.push("/(protected)/(tabs)/shop/notifications")
            }
          >
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
              tintColor="#FFFFFF"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center">
          <ScrollView
            className="bg-white rounded-t-3xl px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            {isPending ? (
              <View className="w-full h-full flex-1 justify-center items-center mt-10">
                <InllineLoader />
                <Text className="text-gray-500 text-sm font-medium leading-5 mt-2">
                  Loading transaction...
                </Text>
              </View>
            ) : error ? (
              <View className="w-full h-full flex-1 justify-center items-center mt-10">
                <InlineError error={error.message} refetch={refetch} />
              </View>
            ) : (
              <View className="w-full h-full flex-1 justify-center items-center">
                {statusInfo && statusInfo.data === "success" && (
                  <View className="items-center justify-center gap-y-4 py-20">
                    <Image
                      source={ICONS.SuccessGreen}
                      className="w-40 h-40"
                      resizeMode="contain"
                    />
                    <Text className="text-green-500 text-lg font-bold">
                      Success!
                    </Text>
                    <Text className="text-gray-500 text-sm font-medium leading-5 mt-2 text-center">
                      Your funds have been credited to your wallet
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-gray-500 text-sm font-medium leading-5 mt-2 text-center">
                    {statusInfo.data}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        {statusInfo && statusInfo.data === "success" && (
          <View className="bg-white px-6 pb-6">
            <View className="flex-row gap-x-4 w-full">
              <TouchableOpacity
                className="bg-muted rounded-lg px-2 py-4 w-1/2 text-center"
                onPress={() => setShowDetailsModal(true)}
              >
                <Text className="text-green-500 text-sm font-medium leading-5 text-center">
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 rounded-lg px-2 py-4 w-1/2 text-center"
                onPress={() => router.replace("/(protected)/(tabs)/wallet")}
              >
                <Text className="text-white text-sm font-medium leading-5 text-center">
                  Back to Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Container>
      <DetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        reference={params.reference as string}
      />
    </View>
  );
};

export default Verify;

const DetailsModal = ({
  visible,
  onClose,
  reference,
}: {
  visible: boolean;
  onClose: () => void;
  reference: string;
}) => {
  const {
    data: transaction,
    isPending,
    error,
    refetch,
  } = useQuery(
    orpc.finance.transactions.getTransactionByReference.queryOptions({
      input: { reference: reference as string },
      queryKey: ["deposit", "transaction", "details", "reference", reference],
    })
  );

  const statusColor = useMemo(() => {
    const status = (transaction?.data?.status || "pending") as string;
    if (status === "completed" || status === "success") return "#16a34a"; // green-600
    if (status === "failed") return "#dc2626"; // red-600
    return "#ca8a04"; // amber-600
  }, [transaction?.data?.status]);

  const onCopyRef = async () => {
    try {
      await Clipboard.setStringAsync(reference);
      Alert.alert("Copied", "Reference copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy reference");
    }
  };

  const onShareReceipt = async () => {
    try {
      const amountNaira = transaction?.data?.amount
        ? formatPrice(Number(transaction.data.amount) / 100)
        : "";
      const provider =
        (transaction?.data as any)?.metadata?.provider || "Paystack";
      const dateStr =
        (transaction?.data as any)?.updated_at ||
        (transaction?.data as any)?.created_at;
      const when = dateStr
        ? new Date(dateStr as unknown as string).toLocaleString()
        : "";
      const message = `Helpmee Wallet Deposit Receipt\n\nAmount: ${amountNaira}\nStatus: ${transaction?.data?.status}\nProvider: ${provider}\nReference: ${reference}\nDate: ${when}`;
      await Share.share({ message });
    } catch {
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View className="flex-1 bg-white">
        <View className="px-6 py-4 border-b border-black/5 flex-row items-center justify-between">
          <Text className="text-lg font-bold">Transaction details</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-black/5 rounded-lg px-3 py-2"
          >
            <Text className="text-gray-700">Close</Text>
          </TouchableOpacity>
        </View>

        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <InllineLoader />
            <Text className="text-gray-500 text-sm mt-2">Loading details…</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <InlineError error={error.message} refetch={refetch} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6 py-6"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="items-center mb-6">
              <Image source={LOGO} className="h-[33px] w-auto" />
            </View>

            <View className="items-center mb-6">
              <Image
                // TODO: Add error icon
                source={
                  transaction?.data?.status === "completed"
                    ? ICONS.SuccessGreen
                    : ICONS.trash || ICONS.SuccessGreen
                }
                className="w-28 h-28"
                resizeMode="contain"
              />
              <Text className="text-2xl font-extrabold mt-3">
                {formatPrice(Number(transaction?.data?.amount || 0) / 100)}
              </Text>
              <View
                className="mt-2 px-3 py-1 rounded-full"
                style={{ backgroundColor: statusColor + "20" }}
              >
                <Text
                  style={{ color: statusColor }}
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  {String(transaction?.data?.status || "pending")}
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4 gap-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Amount</Text>
                <Text className="font-semibold">
                  {formatPrice(Number(transaction?.data?.amount || 0) / 100)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Provider</Text>
                <Text className="font-semibold">
                  {(transaction?.data as any)?.metadata?.provider || "Paystack"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Currency</Text>
                <Text className="font-semibold">
                  {(transaction?.data as any)?.currency || "NGN"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Type</Text>
                <Text className="font-semibold">
                  {(transaction?.data as any)?.type || "funding"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Reference</Text>
                <View className="flex-row items-center">
                  <Text className="font-semibold mr-2" numberOfLines={1}>
                    {reference}
                  </Text>
                  <TouchableOpacity onPress={onCopyRef} className="p-1">
                    <Image
                      // TODO: Add copy icon
                      source={ICONS.checkMark}
                      className="w-4 h-4"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Date</Text>
                <Text className="font-semibold">
                  {(() => {
                    const dateStr =
                      (transaction?.data as any)?.updated_at ||
                      (transaction?.data as any)?.created_at;
                    if (!dateStr) return "";
                    try {
                      return new Date(
                        dateStr as unknown as string
                      ).toLocaleString();
                    } catch {
                      return String(dateStr);
                    }
                  })()}
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-x-3">
              <TouchableOpacity
                onPress={onShareReceipt}
                className="flex-1 bg-green-500 rounded-xl px-4 py-4"
              >
                <Text className="text-white text-center font-semibold">
                  Share receipt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-black/5 rounded-xl px-4 py-4"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
