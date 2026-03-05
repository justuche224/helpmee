import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CartIcon from "@/components/cart-icon";
import CartButton from "@/components/cart-button";
import SavedButton from "@/components/saved-button";

import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import Error from "@/components/error";
import formatPrice from "@/utils/price-formatter";

export default function Saved() {
  const {
    data: savedItems,
    isLoading,
    error,
    refetch,
  } = useQuery(
    orpc.general.products.saved.getSavedItems.queryOptions({
      queryKey: ["saved"],
      retry: 1,
    })
  );
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error error="Failed to load saved items" refetch={refetch} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
      <View className="px-4 pt-2">
        <View className="flex-row items-center justify-between">
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
          <Text className="text-2xl font-bold">Saved</Text>
          <CartIcon />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pt-4">
          {!savedItems || savedItems.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No saved items
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Items you save will appear here for easy access.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(protected)/(tabs)/shop")}
                className="bg-[#19B360] px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">
                  Browse Products
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            savedItems
              .map((item) => {
                const productId = item.product.id;
                const storeId = item.product.store?.id;

                if (!productId || !storeId) {
                  return null; // Skip items with missing required data
                }

                return (
                  <View
                    key={item.id}
                    className="flex-row mb-4 rounded-lg p-3 border-b border-gray-200"
                  >
                    <TouchableOpacity
                      className="flex-row flex-1"
                      onPress={() =>
                        router.push(
                          `/(protected)/(tabs)/shop/items/${productId}`
                        )
                      }
                    >
                      <View className="w-24 h-24 p-2 bg-gray-50 rounded-md">
                        <Image
                          source={
                            item.product.image
                              ? { uri: item.product.image }
                              : PlaceholderProductImage
                          }
                          className="w-full h-full rounded-md"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text
                          className="text-base font-semibold text-gray-900 mb-1"
                          numberOfLines={1}
                        >
                          {item.product.name}
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">
                          {formatPrice(parseFloat(item.product.price ?? "0"))}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View className="flex-col items-center justify-center ml-2 gap-2">
                      {/* @ts-ignore - API guarantees these are non-null based on schema */}
                      <SavedButton
                        productId={productId}
                        storeId={storeId}
                        size="small"
                      />
                      {/* @ts-ignore - API guarantees these are non-null based on schema */}
                      <CartButton
                        productId={productId}
                        storeId={storeId}
                        size="small"
                      />
                    </View>
                  </View>
                );
              })
              .filter(Boolean)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
