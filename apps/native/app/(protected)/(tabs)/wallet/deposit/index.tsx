import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Container } from "@/components/container";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import InlineError from "@/components/inline-error";
import InlineLoader from "@/components/inlline-loader";
import formatPrice from "@/utils/price-formatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [reference, setReference] = useState("");
  const queryClient = useQueryClient();
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
    refetch: refetchUser,
  } = authClient.useSession();

  useEffect(() => {
    if (user) {
      setEmail(user.user.email);
    }
  }, [user]);

  const getAmountMagnitude = (value: string) => {
    const num = parseFloat(value);
    if (!num || isNaN(num)) return "";

    if (num >= 1000000) return "millions";
    if (num >= 100000) return "hundred thousands";
    if (num >= 10000) return "tens of thousands";
    if (num >= 1000) return "thousands";
    if (num >= 100) return "hundreds";
    if (num >= 10) return "tens";
    return "units";
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setAmount(numericValue);

    if (numericValue) {
      const numValue = parseFloat(numericValue);
      setFormattedAmount(formatPrice(numValue));
    } else {
      setFormattedAmount("");
    }
  };

  const quickAmounts = [
    { id: 1, amount: 1000 },
    { id: 2, amount: 2000 },
    { id: 3, amount: 5000 },
    { id: 4, amount: 10000 },
    { id: 5, amount: 20000 },
    { id: 6, amount: 50000 },
  ];

  const initiateDepositMutation = useMutation(
    orpc.finance.deposit.initiateDeposit.mutationOptions({
      onSuccess: (data) => {
        setPaymentUrl(data.data.authorization_url);
        setReference(data.data.reference);
        setShowWebView(true);
        Toast.show({
          type: "success",
          text1: "Deposit Initiated",
          text2: "Proceeding to payment...",
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to initiate deposit",
          text2: error.message,
        });
        console.log(error);
      },
    })
  );

  return (
    <View className="flex-1 bg-[#19B360] h-full">
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
        {isUserPending ? (
          <ScrollView className="flex-1 bg-white rounded-t-3xl">
            <InlineLoader />
          </ScrollView>
        ) : userError ? (
          <ScrollView className="flex-1 bg-white rounded-t-3xl">
            <InlineError
              error={userError?.message || "An unexpected error occurred."}
              refetch={() => refetchUser()}
            />
          </ScrollView>
        ) : (
          <ScrollView className="flex-1 bg-white rounded-t-3xl">
            <View className="px-6 py-8">
              <View className="w-full bg-[#19B360] px-4 py-6 rounded-2xl gap-y-4 shadow-lg">
                <Text className="text-white text-lg font-semibold">
                  How much do you want to fund your wallet with?
                </Text>
                <TextInput
                  className="w-full h-14 px-5 bg-white rounded-xl border border-[#19B360]/50 text-gray-900 text-base shadow-sm disabled:opacity-50"
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="Amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={10}
                  autoCapitalize="none"
                  autoComplete="off"
                  editable={!initiateDepositMutation.isPending}
                  autoCorrect={false}
                />
                {formattedAmount && (
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-white text-sm font-medium opacity-90">
                      {formattedAmount}
                    </Text>
                    <Text className="text-white text-sm font-medium opacity-90 capitalize">
                      {getAmountMagnitude(amount)}
                    </Text>
                  </View>
                )}
                <View className="flex-row flex-wrap justify-center items-center gap-3">
                  {quickAmounts.map((item) => (
                    <TouchableOpacity
                      onPress={() => handleAmountChange(item.amount.toString())}
                      key={item.id}
                      className="bg-[#19B360]/10 border border-white/50 px-4 py-2 rounded-lg flex-1 min-w-[30%] max-w-[32%] shadow-sm"
                    >
                      <Text className="text-white text-sm font-medium text-center">
                        {formatPrice(item.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-white text-lg font-semibold mt-4">
                  Your email address
                </Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(e) => setEmail(e)}
                  placeholder="Email"
                  placeholderTextColor="#8E9BAE"
                  autoComplete="email"
                  className="w-full h-14 px-5 bg-white rounded-xl border border-[#19B360]/50 text-gray-900 text-base shadow-sm disabled:opacity-50"
                  textContentType="emailAddress"
                  editable={!initiateDepositMutation.isPending}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address"
                />
              </View>
            </View>
            <View className="px-6 py-4">
              <TouchableOpacity
                className="bg-[#19B360] rounded-xl px-4 text-center py-4 disabled:opacity-50"
                onPress={() =>
                  initiateDepositMutation.mutate({
                    amount: parseFloat(amount),
                    email,
                    providerName: "Paystack",
                  })
                }
                disabled={
                  initiateDepositMutation.isPending || !amount || !email
                }
              >
                <Text className="text-white text-xl font-bold text-center">
                  Deposit
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Container>

      <Modal
        visible={showWebView}
        onRequestClose={() => {
          setShowWebView(false);
          queryClient.invalidateQueries({ queryKey: ["userWallet"] });
          queryClient.invalidateQueries({ queryKey: ["userWalletBalances"] });
          queryClient.invalidateQueries({ queryKey: ["pin", "has-pin"] });
          queryClient.invalidateQueries({
            queryKey: ["wallet", "user-wallet"],
          });
          queryClient.invalidateQueries({ queryKey: ["wallet", "has-wallet"] });
          queryClient.invalidateQueries({
            queryKey: ["wallet", "transaction-history"],
          });
          router.replace(
            `/(protected)/(tabs)/wallet/deposit/verify?reference=${reference}`
          );
        }}
        animationType="slide"
      >
        <View className="flex-1">
          <WebView
            source={{ uri: paymentUrl }}
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
              // Optionally handle navigation changes here later for payment confirmation
              console.log(navState.url);
            }}
          />
          <TouchableOpacity
            className="absolute top-10 right-4 bg-white/80 rounded-full p-2"
            onPress={() => {
              setShowWebView(false);
              queryClient.invalidateQueries({ queryKey: ["userWallet"] });
              queryClient.invalidateQueries({
                queryKey: ["userWalletBalances"],
              });
              queryClient.invalidateQueries({ queryKey: ["pin", "has-pin"] });
              queryClient.invalidateQueries({
                queryKey: ["wallet", "user-wallet"],
              });
              queryClient.invalidateQueries({
                queryKey: ["wallet", "has-wallet"],
              });
              queryClient.invalidateQueries({
                queryKey: ["wallet", "transaction-history"],
              });
              router.replace(
                `/(protected)/(tabs)/wallet/deposit/verify?reference=${reference}`
              );
            }}
          >
            <Text className="text-black font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Index;
