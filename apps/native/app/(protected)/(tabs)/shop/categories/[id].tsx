import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Container } from "@/components/container";
import CartIcon from "@/components/cart-icon";
import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;
import HeartIcon from "@/assets/icons/shop/heart.png";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Error from "@/components/error";
import Loader from "@/components/loader";
import ProductCard from "@/components/product-card";

export default function Category() {
  const { id } = useLocalSearchParams();

  const {
    data: category,
    isLoading,
    error,
    refetch,
  } = useQuery(
    orpc.general.categories.getCategoryById.queryOptions({
      queryKey: ["categories", "by-id", id],
      input: { id: id as string },
      retry: 1,
      staleTime: 1000 * 60 * 5,
    })
  );

  const {
    data: productsData,
    isPending: isProductsPending,
    refetch: refetchProducts,
    error: productsError,
  } = useQuery(
    orpc.general.products.getProducts.queryOptions({
      queryKey: ["products", "category", id],
      input: {
        limit: 20,
        page: 1,
        offset: 0,
        getRecommended: false,
        categoryId: id as string,
        sortBy: "newest",
        inStockOnly: true,
      },
      staleTime: 1000 * 60 * 5,
      retry: 3,
    })
  );

  return (
    <Container>
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
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
            <Text className="text-xl font-bold text-gray-900 ml-2">
              {category && category?.name.length > 20
                ? category?.name.slice(0, 20) + "..."
                : category?.name || ""}
            </Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity
              className="mr-3"
              onPress={() => router.push("/(protected)/(tabs)/shop/saved")}
            >
              <Image
                source={HeartIcon}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <CartIcon />
          </View>
        </View>
      </View>
      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center w-full h-full justify-center mt-20">
            <Loader />
          </View>
        ) : error ? (
          <Error error="Failed to load category" refetch={refetch} />
        ) : category ? (
          <View>
            {isProductsPending ? (
              <View className="flex-1 items-center w-full h-full justify-center mt-20">
                <Loader />
              </View>
            ) : productsError ? (
              <Error
                error="Failed to load products"
                refetch={refetchProducts}
              />
            ) : productsData && productsData.products.length > 0 ? (
              <View className="px-4 py-4">
                <Text className="text-lg text-center font-semibold mb-4">
                  {productsData.products.length} Product
                  {productsData.products.length !== 1 ? "s" : ""}
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {productsData.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="w-[48%] mb-4"
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-12 px-4">
                <Text className="text-gray-500 text-center text-lg mb-2">
                  No products found
                </Text>
                <Text className="text-gray-400 text-center">
                  There are no products in this category yet.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text>Category not found</Text>
        )}
      </ScrollView>
    </Container>
  );
}
