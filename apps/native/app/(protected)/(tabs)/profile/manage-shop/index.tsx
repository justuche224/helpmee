import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import CreateShop from "@/assets/icons/shop/create-store.png";
import MyOrders from "@/assets/icons/shop/my-orders.png";
import MyReviews from "@/assets/icons/shop/my-reviews.png";
import SavedItems from "@/assets/icons/shop/saved-items.png";
import SelectPlan from "@/assets/icons/shop/select-plans.png";
import UpdateItems from "@/assets/icons/shop/update-items.png";
import arrowRight from "@/assets/icons/cards/arrow-right.png";

const Index = () => {
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
          <Text className="text-black text-xl font-bold">Manage Shop</Text>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 py-4">
          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/create-shop")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={CreateShop}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Create Shop</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/select-plan")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={SelectPlan}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Select Plan</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/my-shop")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={CreateShop}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">My Shop</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/upload-items")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={UpdateItems}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Upload Items</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/my-reviews")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={MyReviews}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">My Reviews</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/saved-items")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={SavedItems}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">Saved Items</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile/manage-shop/my-orders")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-4">
                <Image
                  source={MyOrders}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base">My Orders</Text>
            </View>
            <Image
              source={arrowRight}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Index;
