{
  /*import React, { useState } from "react";
import { Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { PROFILE_ICONS } from "@/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import UserImage from "@/assets/icons/profile/user-image.png";

const Username = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const { checkmark, clock } = PROFILE_ICONS;

  const renderTabContent = () => {
    switch (activeTab) {
      case "reviews":
        return (
          <View className="px-6">
            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row items-start">
                <Image
                  source={UserImage}
                  className="w-10 h-10 rounded-full mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-black font-semibold">
                        Samuel Jide
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Image
                          source={clock}
                          className="w-4 h-4 mr-2"
                          resizeMode="contain"
                        />
                        <Text className="text-[#A1A1A1] text-xs">
                          20 Jan, 2024
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Text className="text-black font-bold mr-1">4.8</Text>
                        <Text className="text-[#A1A1A1] text-sm">rating</Text>
                      </View>
                      <StarRatingDisplay rating={4.8} starSize={16} />
                    </View>
                  </View>
                </View>
              </View>
              <Text className="text-[#8F959E] text-sm mt-3 leading-5">
                My last order was in good condition and arrived on time. He is
                trusted and reliable.
              </Text>
            </View>

            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row items-start">
                <Image
                  source={UserImage}
                  className="w-10 h-10 rounded-full mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-black font-semibold mr-2">
                          Nika Patrick
                        </Text>
                        <Image
                          source={checkmark}
                          className="w-4 h-4"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Image
                          source={clock}
                          className="w-4 h-4 mr-2"
                          resizeMode="contain"
                        />
                        <Text className="text-[#A1A1A1] text-xs">
                          13 Jan, 2024
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Text className="text-black font-bold mr-1">4.8</Text>
                        <Text className="text-[#A1A1A1] text-sm">rating</Text>
                      </View>
                      <StarRatingDisplay rating={4.8} starSize={16} />
                    </View>
                  </View>
                </View>
              </View>
              <Text className="text-[#8F959E] text-sm mt-3 leading-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque malesuada eget vitae amet...
              </Text>
            </View>

            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row items-start">
                <Image
                  source={UserImage}
                  className="w-10 h-10 rounded-full mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-black font-semibold">
                        Ronald Richards
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Image
                          source={clock}
                          className="w-4 h-4 mr-2"
                          resizeMode="contain"
                        />
                        <Text className="text-[#A1A1A1] text-xs">
                          10 Jan, 2024
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Text className="text-black font-bold mr-1">4.8</Text>
                        <Text className="text-[#A1A1A1] text-sm">rating</Text>
                      </View>
                      <StarRatingDisplay rating={4.8} starSize={16} />
                    </View>
                  </View>
                </View>
              </View>
              <Text className="text-[#8F959E] text-sm mt-3 leading-5">
                Great seller with quality products. Fast delivery!
              </Text>
            </View>
          </View>
        );

      case "store":
        return (
          <View className="px-6">
            <View className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-4">
              <Image
                source={UserImage}
                className="w-20 h-20 rounded-lg mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-black text-lg font-bold mb-1">
                  Office Chair
                </Text>
                <Text className="text-[#A1A1A1] text-sm mb-1">Wood Inc</Text>
                <Text className="text-[#A1A1A1] text-sm mb-2">
                  20 Units left
                </Text>
                <Text className="text-black text-xl font-bold">₦42,500.00</Text>
              </View>
            </View>
          </View>
        );

      case "likes":
        return (
          <View className="px-6 py-20 items-center">
            <Text className="text-gray-400 text-center">
              No liked items yet
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

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
          <TouchableOpacity
            onPress={() => router.push("/profile/edit-profile")}
          >
            <Text className="text-green-500 text-base font-medium">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 bg-white mb-16"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center py-6">
            <View className="relative mb-4">
              <Image
                source={UserImage}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center">
                <Image
                  source={checkmark}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text className="text-black text-2xl font-bold mb-2">
              Richard Chike
            </Text>
            <Text className="text-[#A1A1A1] text-base mb-1">chikalittle</Text>
            <Text className="text-[#A1A1A1] text-base mb-1">
              richie24chikie@gmail.com
            </Text>
            <Text className="text-[#A1A1A1] text-base mb-4">
              +2348045684201
            </Text>

            <View className="flex-row items-center mb-6">
              <StarRatingDisplay rating={4} starSize={20} />
              <Text className="text-black text-lg font-bold ml-2">4.0</Text>
            </View>
          </View>

          <View className="px-6 mb-6 bg-[#F5F5F5] py-3 rounded-lg">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-black text-lg font-bold">
                  Verified Shop Owner
                </Text>
                <Text className="text-[#A1A1A1] text-sm">500 abegs</Text>
              </View>
              <Text className="text-gray-400 text-sm">Badge</Text>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-2 bg-green-500 rounded-l-full" />
              <View className="flex-1 h-2 bg-gray-200 rounded-r-full" />
            </View>

            <View className="flex-row">
              <View className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
              <View className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
              <View className="w-6 h-6 bg-gray-300 rounded-full" />
            </View>
          </View>

          <View className="px-6 mb-6">
            <Text className="text-black text-lg font-bold mb-4">About</Text>
            <Text className="text-[#8F959E] text-base leading-6">
              I am street photographer and a data analyst, I am very excited
              been here o helpmee I can't wait to see what the future has to
              bring for us all.
            </Text>
          </View>

          <View className="border-t border-gray-200">
            <View className="flex-row px-6">
              <TouchableOpacity
                onPress={() => setActiveTab("reviews")}
                className={`flex-1 py-4 border-b-2 ${
                  activeTab === "reviews"
                    ? "border-green-500"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    activeTab === "reviews" ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  Reviews
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("store")}
                className={`flex-1 py-4 border-b-2 ${
                  activeTab === "store"
                    ? "border-green-500"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    activeTab === "store" ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  Store
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("likes")}
                className={`flex-1 py-4 border-b-2 ${
                  activeTab === "likes"
                    ? "border-green-500"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    activeTab === "likes" ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  Likes
                </Text>
              </TouchableOpacity>
            </View>

            <View className="py-4">{renderTabContent()}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Username;
*/
}

import { View, Text } from "react-native";
import React from "react";
import { Container } from "@/components/container";

const Profile = () => {
  return (
    <Container>
      <Text>Profile</Text>
    </Container>
  );
};

export default Profile;
