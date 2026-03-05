import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS, PROFILE_ICONS } from "@/constants";
import UserImage from "@/assets/icons/profile/user-image.png";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { STORAGE_KEYS } from "@/constants";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type MenuItem = {
  icon: any;
  title: string;
  subtitle: string;
  iconBg: string;
  link?: string;
  function?: () => Promise<any>;
};

const index = () => {
  const {
    account,
    cards,
    logoutProfile,
    security,
    help,
    shop,
    arrowRight,
    verify,
  } = PROFILE_ICONS;

  const [showVerifyBanner, setShowVerifyBanner] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: session, refetch: refreshUserData } = authClient.useSession();
  const queryClient = useQueryClient();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refreshUserData();
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      Toast.show({
        type: "error",
        text1: "Failed to refresh user data",
        text2: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setRefreshing(false);
    }
  };


  const menuItems: MenuItem[] = [
    {
      icon: account,
      title: "Bank Account",
      subtitle: "Set up your account",
      iconBg: "bg-green-100",
      link: "/profile/bank-account",
    },
    {
      icon: shop,
      title: "Manage Shop",
      subtitle: "Set up your shop",
      iconBg: "bg-yellow-100",
      link: "/profile/manage-shop",
    },
    {
      icon: cards,
      title: "Cards",
      subtitle: "Manage your cards",
      iconBg: "bg-orange-100",
      link: "/profile/cards",
    },
    {
      icon: security,
      title: "Security",
      subtitle: "Protect your account from villains",
      iconBg: "bg-green-100",
      link: "/profile/security",
    },
    {
      icon: help,
      title: "Help Center",
      subtitle: "Get support and feedback",
      iconBg: "bg-yellow-100",
    },
    {
      icon: logoutProfile,
      title: "Logout",
      subtitle: "You can head out here",
      iconBg: "bg-red-100",
      function: async () => {
        queryClient.resetQueries();
        queryClient.removeQueries();
        queryClient.clear();
        await SecureStore.setItemAsync(
          STORAGE_KEYS.SHOP_ONBOARDING_COMPLETED,
          "false"
        );
        await authClient.signOut();
      },
    },
  ];

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">Profile</Text>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 bg-white mb-16"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="px-6 py-6">
            <TouchableOpacity
              onPress={() => router.push("/profile/richie24chikie")}
              className="flex-row items-center mb-8"
            >
              <Image
                source={UserImage}
                className="w-16 h-16 rounded-full mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-black text-lg font-bold mb-1">
                  {session?.user?.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {session?.user?.email}
                </Text>
              </View>
              <Image
                source={arrowRight}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-black text-lg font-bold mb-6">
                Account Settings
              </Text>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center py-4"
                  onPress={async () => {
                    if (item.link) {
                      router.push(item.link as any);
                    }
                    if (item.function) {
                      await item.function();
                    }
                  }}
                >
                  <View
                    className={`w-12 h-12 rounded-xl ${item.iconBg} items-center justify-center mr-4`}
                  >
                    <Image
                      source={item.icon}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black text-base font-semibold mb-1">
                      {item.title}
                    </Text>
                    <Text className="text-[#A1A1A1] text-sm">
                      {item.subtitle}
                    </Text>
                  </View>
                  <Image
                    source={arrowRight}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="px-6 pb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-400 text-sm">App Version 1.02</Text>
              <Text className="text-gray-400 text-sm">1.0.0</Text>
            </View>

            {showVerifyBanner && (
              <TouchableOpacity
                onPress={() => router.push("/profile/kyc")}
                className="bg-green-500 rounded-2xl p-4 flex-row items-center"
              >
                <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                  <Image
                    source={verify}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">
                    Verify Account
                  </Text>
                  <Text className="text-white text-sm">
                    Perform a few verification steps to become a verified user.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowVerifyBanner(false)}
                  className="w-8 h-8 bg-white/20 rounded-full items-center justify-center ml-2"
                >
                  <Text className="text-white text-lg font-bold">×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default index;
