import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import CartIcon from "@/assets/icons/shop/cart.png";
import HeartIcon from "@/assets/icons/shop/heart.png";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import Error from "@/components/error";
import { router } from "expo-router";
import SearchBar from "@/components/search-bar";
import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;

const Categories = () => {
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(
    orpc.general.categories.getAllCategories.queryOptions({
      queryKey: ["categories", "all"],
      staleTime: 1000 * 60 * 5,
      retry: 3,
    })
  );
  return (
    <SafeAreaView className="flex-1 bg-white pb-10">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-4 py-2 mt-2">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 rounded-full bg-white justify-center items-center"
            >
              <Image
                source={arrowLeft}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-3xl font-bold ml-2">Categories</Text>
          </View>
          <View className="flex-row items-center gap-x-4">
            <TouchableOpacity>
              <Image
                source={HeartIcon}
                className="w-7 h-7"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={CartIcon}
                className="w-7 h-7"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar showFilter={false} />

        {isCategoriesPending ? (
          <Loader />
        ) : categoriesError ? (
          <Error error={categoriesError.message} refetch={refetchCategories} />
        ) : categoriesData && categoriesData.length > 0 ? (
          <View className="px-4 my-4">
            <View className="flex-row flex-wrap">
              {categoriesData.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="items-center mb-8"
                  style={{ width: "25%" }}
                  onPress={() =>
                    router.push(
                      `/(protected)/(tabs)/shop/categories/${category.id}`
                    )
                  }
                >
                  <View className="bg-gray-100 p-4 rounded-full mb-3 w-16 h-16 items-center justify-center">
                    <Image
                      source={{ uri: category.icon }}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    className="text-xs text-center text-gray-700 px-1"
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-4">
            <Text className="text-gray-500 text-center">
              No categories available
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Categories;
