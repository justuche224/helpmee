import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { ICONS } from "@/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const Deals = () => {
  return (
    <SafeAreaView className="flex-1 bg-white mb-10">
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity
          className="bg-white/20 rounded-lg p-2"
          onPress={() => router.back()}
        >
          <Image
            source={ICONS.arrowLeft}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text className="text-black text-xl font-bold">Suggested Deals</Text>
        <TouchableOpacity className="bg-white/20 rounded-lg p-2">
          <Image
            source={ICONS.notificationBell}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 text-center text-base mt-6 mb-8 leading-6">
          Check out the best deals and ideals to boost your helpmee account.
        </Text>

        <TouchableOpacity className="mb-6">
          <View className="bg-orange-500 rounded-2xl p-6 relative overflow-hidden">
            <Text className="text-white text-2xl font-bold mb-3">
              Create your Dream Store
            </Text>
            <Text className="text-white/90 text-base mb-6 leading-6">
              Be the boss of your own business, create an online store with us
              and experience breakthroughs
            </Text>
            <TouchableOpacity>
              <Text className="text-white font-semibold text-base">
                Create Store Now &gt;
              </Text>
            </TouchableOpacity>

            <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute right-4 top-12 w-20 h-20 bg-white/10 rounded-full" />
            <View className="absolute -right-4 bottom-8 w-24 h-24 bg-white/10 rounded-full" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="mb-6">
          <View className="bg-green-500 rounded-2xl p-6 relative overflow-hidden">
            <Text className="text-white text-2xl font-bold mb-3">
              Shop like a Boss
            </Text>
            <Text className="text-white/90 text-base mb-6 leading-6">
              Check out exciting daily needs products with a secure and seamless
              process.
            </Text>
            <TouchableOpacity>
              <Text className="text-white font-semibold text-base">
                Create Store Now &gt;
              </Text>
            </TouchableOpacity>

            <View className="absolute -left-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
            <View className="absolute right-8 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute left-16 bottom-4 w-16 h-16 bg-white/10 rounded-full" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="mb-6">
          <View className="bg-teal-500 rounded-2xl p-6 relative overflow-hidden">
            <Text className="text-white text-2xl font-bold mb-3">
              Let's Level Up
            </Text>
            <Text className="text-white/90 text-base mb-6 leading-6">
              Don't let your business have a low number of items, upgrade your
              account to premium and get unlimited access.
            </Text>
            <TouchableOpacity>
              <Text className="text-white font-semibold text-base">
                Create Store Now &gt;
              </Text>
            </TouchableOpacity>

            <View className="absolute -right-10 top-8 w-36 h-36 bg-white/10 rounded-full" />
            <View className="absolute left-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
            <View className="absolute right-4 bottom-12 w-20 h-20 bg-white/10 rounded-full" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="mb-8">
          <View className="bg-green-600 rounded-2xl p-6 relative overflow-hidden">
            <Text className="text-yellow-400 text-sm font-semibold mb-2">
              From Jan 25 - Mar 1
            </Text>
            <Text className="text-white text-3xl font-bold mb-3">
              Black Friday
            </Text>
            <Text className="text-white/90 text-base mb-6 leading-6">
              Get amazing discounts on all our premium features and boost your
              business growth.
            </Text>
            <TouchableOpacity>
              <Text className="text-white font-semibold text-base">
                Shop Now &gt;
              </Text>
            </TouchableOpacity>

            <View className="absolute -left-8 top-4 w-24 h-24 bg-yellow-400/20 rounded-full" />
            <View className="absolute right-4 -top-4 w-32 h-32 bg-yellow-400/20 rounded-full" />
            <View className="absolute -right-6 bottom-4 w-28 h-28 bg-yellow-400/20 rounded-full" />
            <View className="absolute left-12 -bottom-4 w-20 h-20 bg-yellow-400/20 rounded-full" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Deals;
