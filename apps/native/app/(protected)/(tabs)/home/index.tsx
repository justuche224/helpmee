import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BG from "@/assets/images/home/BG.png";
import { ICONS } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import contentCopy from "@/assets/icons/content-copy.png";
import * as Clipboard from "expo-clipboard";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import formatPrice from "@/utils/price-formatter";
import InllineLoader from "@/components/inlline-loader";

const HomeIndex = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("Services");
  const [isTopUpModalVisible, setTopUpModalVisible] = useState(false);

  const quickAccessItems = [
    { id: 1, name: "Bills", icon: ICONS.toBank, link: "/home/bills" },
    { id: 2, name: "Airtime", icon: ICONS.airtime, link: "/home/airtime" },
    {
      id: 3,
      name: "Store",
      icon: ICONS.store,
      link: "/profile/manage-shop/my-shop",
    },
    {
      id: 4,
      name: "Create Shop",
      icon: ICONS.createShop,
      link: "/profile/manage-shop/create-shop",
    },
  ];

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

  return (
    <View className="flex-1 bg-[#19B360] h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-[#19B360] mb-10">
        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={BG}
            className="px-6 pt-4 pb-8"
            resizeMode="cover"
          >
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity className="bg-white/20 rounded-lg p-2">
                <Image source={ICONS.chat} className="w-6 h-6" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Helpmee</Text>
              <TouchableOpacity
                onPress={() => router.push("/shop/notifications")}
                className="bg-white/20 rounded-lg p-2"
              >
                <Image source={ICONS.notificationBell} className="w-6 h-6" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
              <Text className="text-white/80 text-sm mb-2 tracking-wider">
                YOUR WALLET BALANCE
              </Text>
              {isUserWalletPending ? (
                <InllineLoader />
              ) : userWalletError ? (
                <View className="flex-1 items-center justify-center mb-6 gap-y-2">
                  <Text className="text-white text-sm text-center">
                    {userWalletError?.message || "Failed to load wallet"}
                  </Text>
                  <TouchableOpacity
                    className="bg-white/50 rounded-lg p-2 disabled:opacity-60"
                    onPress={() => refetchUserWallet()}
                  >
                    <Text className="text-white text-sm text-center">
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-center mb-6">
                  <Text className="text-white text-4xl font-bold mr-3">
                    {showBalance
                      ? `${formatPrice(
                          userWallet?.available_balance
                            ? userWallet?.available_balance / 100
                            : 0
                        )}`
                      : "₦***,***.00"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
                  >
                    <Image
                      source={showBalance ? ICONS.eye : ICONS.eyeHide}
                      className="w-6 h-6"
                    />
                  </TouchableOpacity>
                </View>
              )}
              {!hasWalletError &&
                !isHasWalletPending &&
                hasWallet === false && (
                  <View className="flex-1 items-center justify-center mb-6 gap-y-2">
                    <Text className="text-white text-sm text-center">
                      You don't have a wallet yet
                    </Text>
                    <TouchableOpacity
                      className="bg-white/50 rounded-lg p-2 disabled:opacity-60"
                      onPress={() => router.push("/wallet")}
                    >
                      <Text className="text-white text-sm text-center">
                        Create Wallet Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              <View className="flex-row">
                <TouchableOpacity
                  className="bg-white/50 rounded-xl px-10 py-4 flex-1 mr-3 disabled:opacity-60"
                  onPress={() =>
                    router.push("/(protected)/(tabs)/wallet/deposit")
                  }
                  disabled={!hasWallet || isHasWalletPending}
                >
                  <Text className="text-white font-semibold text-center">
                    Top-up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white/50 rounded-xl px-10 py-4 flex-1 disabled:opacity-60"
                  onPress={() => router.push("/home/transfer")}
                  disabled={!hasWallet || isHasWalletPending}
                >
                  <Text className="text-white font-semibold text-center">
                    Transfer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>

          <View className="px-6 pt-4">
            <View className="flex-row justify-center mb-6">
              <TouchableOpacity
                className={`mr-8 pb-2 ${
                  activeTab === "Services" ? "border-b-2 border-green-500" : ""
                }`}
                onPress={() => setActiveTab("Services")}
              >
                <Text
                  className={`font-semibold text-lg ${
                    activeTab === "Services" ? "text-black" : "text-gray-400"
                  }`}
                >
                  Services
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`pb-2 ${
                  activeTab === "Transactions"
                    ? "border-b-2 border-green-500"
                    : ""
                }`}
                onPress={() => setActiveTab("Transactions")}
              >
                <Text
                  className={`font-semibold text-lg ${
                    activeTab === "Transactions"
                      ? "text-black"
                      : "text-gray-400"
                  }`}
                >
                  Transactions
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "Services" ? (
              <>
                <Text className="text-black text-base font-bold mb-4">
                  Quick Access
                </Text>

                <View className="flex-row justify-between mb-8">
                  {quickAccessItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="items-center"
                      onPress={() => router.push(item.link as any)}
                    >
                      <View className="w-14 h-14 items-center justify-center mb-2">
                        <Image source={item.icon} className="w-14 h-14" />
                      </View>
                      <Text className="text-black text-xs font-medium">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* <View className="bg-gray-50 rounded-xl p-4 mb-6">
					<View className="flex-row justify-between items-center mb-3">
					  <Text className="text-black text-base font-bold">
						Verified Shop Owner
					  </Text>
					  <View className="bg-gray-200 rounded-full px-3 py-1">
						<Text className="text-gray-600 text-sm">Badge</Text>
					  </View>
					</View>
					<Text className="text-gray-500 mb-3">500 abegs</Text>
					<View className="bg-gray-200 rounded-full h-2 mb-3">
					  <View
						className="bg-green-500 h-2 rounded-full"
						style={{ width: "25%" }}
					  />
					</View>
					<View className="flex-row justify-between">
					  <View className="flex-row space-x-1">
						<View className="w-8 h-8 bg-gray-300 rounded-full" />
						<View className="w-8 h-8 bg-gray-300 rounded-full" />
						<View className="w-8 h-8 bg-gray-300 rounded-full" />
					  </View>
					  <Image source={ICONS.rightArrow} className="w-5 h-5" />
					</View>
				  </View> */}
                <TouchableOpacity
                  onPress={() => router.push("/profile/kyc")}
                  className="bg-green-50 rounded-xl flex-row items-center mb-6"
                >
                  <View className="bg-green-50 rounded-xl p-4 flex-row items-center">
                    <Image
                      source={ICONS.verifyAccount}
                      className="w-10 h-10 mr-3"
                      resizeMode="contain"
                    />
                    <View className="flex-1">
                      <Text className="text-black font-semibold mb-1">
                        Verify Account
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        Perform a few verification steps to become a
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        verified user.{" "}
                        <Text className="text-green-600 font-semibold">
                          Tap to verify now.
                        </Text>
                      </Text>
                    </View>
                    <TouchableOpacity>
                      <Text className="text-gray-400 text-xl">×</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-black text-base font-bold">
                    Suggested Deals
                  </Text>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-orange-500 font-semibold mr-1">
                      <Link href="/home/deals">See All</Link>
                    </Text>
                    <Image source={ICONS.rightArrow} className="w-4 h-4" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-8"
                >
                  <TouchableOpacity className="mr-4">
                    <View className="bg-orange-500 rounded-2xl p-5 w-80 relative overflow-hidden">
                      <Text className="text-white text-xl font-bold mb-2">
                        Create your Dream Store
                      </Text>
                      <Text className="text-white/90 text-sm mb-4 leading-5">
                        Be the boss of your own business, create an online store
                        with us and experience breakthrough.
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-white font-semibold">
                          Create Store Now &gt;
                        </Text>
                      </TouchableOpacity>
                      <View className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                      <View className="absolute right-8 bottom-8 w-16 h-16 bg-white/10 rounded-full" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <View className="bg-green-500 rounded-2xl p-5 w-72 relative overflow-hidden">
                      <Text className="text-white text-xl font-bold mb-2">
                        Shop like a Boss
                      </Text>
                      <Text className="text-white/90 text-sm mb-4 leading-5">
                        Check out exciting daily needs products with a secure
                        and seamless process.
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-white font-semibold">
                          Create Store Now &gt;
                        </Text>
                      </TouchableOpacity>
                      <View className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full" />
                      <View className="absolute right-4 bottom-4 w-12 h-12 bg-white/10 rounded-full" />
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </>
            ) : (
              <View className="mb-8">
                <Text className="text-gray-500 text-sm font-semibold mb-4">
                  Today
                </Text>

                <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-3">
                      <Image
                        source={ICONS.card}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Transfer to Eliot
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        For banana pie
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-black font-bold text-base">
                      - ₦2,050.00
                    </Text>
                    <Text className="text-gray-400 text-xs">₦50.00</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-3">
                      <Image
                        source={ICONS.card}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Transfer to Mide
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        No description
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-black font-bold text-base">
                      - ₦1,500.00
                    </Text>
                    <Text className="text-gray-400 text-xs">₦50.00</Text>
                  </View>
                </TouchableOpacity>

                <Text className="text-gray-500 text-sm font-semibold mb-4 mt-6">
                  Yesterday
                </Text>

                <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-3">
                      <Image
                        source={ICONS.card}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Fund wallet
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        For Helpmee wallet
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-black font-bold text-base">
                      + ₦5,000.00
                    </Text>
                    <Text className="text-gray-400 text-xs">₦0.00</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-3">
                      <Image
                        source={ICONS.card}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Glo Data Purchase
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        For Helpmee wallet
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-black font-bold text-base">
                      - ₦500.00
                    </Text>
                    <Text className="text-gray-400 text-xs">₦0.00</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between py-4">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-3">
                      <Image
                        source={ICONS.card}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Transfer to Blessing
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        No description
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-black font-bold text-base">
                      - ₦1,550.00
                    </Text>
                    <Text className="text-gray-400 text-xs">₦0.00</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTopUpModalVisible}
        // navigationBarTranslucent
        onRequestClose={() => {
          setTopUpModalVisible(!isTopUpModalVisible);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 items-center gap-6">
            <Text className="text-xl font-bold text-center">Top - up</Text>

            <View className="bg-gray-100 rounded-xl p-4 w-full">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-500 text-sm">Access Bank PLC</Text>
                  <Text className="text-black font-bold text-lg">
                    6132406178
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setStringAsync("6132406178");
                  }}
                >
                  <Image source={contentCopy} className="w-6 h-6" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="flex-row items-center justify-center">
              <Text className="text-green-500 font-semibold text-lg">+</Text>
              <Text className="text-green-500 font-semibold text-base ml-2">
                Add new bank account
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-center text-sm">
              Transfer to the account number above to receive your money
            </Text>

            <TouchableOpacity
              className="bg-[#19B360] rounded-xl py-4 w-full"
              onPress={() => setTopUpModalVisible(false)}
            >
              <Text className="text-white text-lg font-bold text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeIndex;
