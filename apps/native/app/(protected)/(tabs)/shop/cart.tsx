import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";

import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;

import CartIconAsset from "@/assets/icons/shop/cart.png";
import HeartIcon from "@/assets/icons/shop/heart.png";
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import MinusIcon from "@/assets/icons/shop/minus.png";
import PlusIcon from "@/assets/icons/shop/plus.png";
import ArrowRightIcon from "@/assets/icons/shop/arrow-right.png";
import CancleIcon from "@/assets/icons/shop/cancle.png";
import formatPrice from "@/utils/price-formatter";
import SavedButton from "@/components/saved-button";

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
});

const Cart = () => {
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState("");

  const {
    data: cartItems,
    isLoading: isCartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useQuery(
    orpc.general.cart.getCart.queryOptions({
      queryKey: ["cart"],
      retry: 1,
    })
  );

  const { data: recommendedProducts, isLoading: isRecommendedLoading } =
    useQuery(
      orpc.general.products.getProducts.queryOptions({
        queryKey: ["products", "recommended"],
        input: {
          limit: 6,
          page: 1,
          offset: 0,
          getRecommended: true,
          sortBy: "newest",
          inStockOnly: true,
        },
        enabled: !!cartItems && cartItems.length > 0,
      })
    );

  const incrementMutation = useMutation(
    orpc.general.cart.incrementCartItemQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-item"] });
        Toast.show({
          type: "success",
          text1: "Quantity updated",
        });
      },
      onError: (error: any) => {
        console.error("Increment error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const decrementMutation = useMutation(
    orpc.general.cart.decrementCartItemQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-item"] });
        Toast.show({
          type: "success",
          text1: "Quantity updated",
        });
      },
      onError: (error: any) => {
        console.error("Decrement error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const removeMutation = useMutation(
    orpc.general.cart.removeFromCart.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-item"] });
        Toast.show({
          type: "success",
          text1: "Item removed from cart",
        });
      },
      onError: (error: any) => {
        console.error("Remove error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to remove item",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const mutationsPending =
    incrementMutation.isPending ||
    decrementMutation.isPending ||
    removeMutation.isPending;

  const handleIncrement = (cartItemId: string) => {
    incrementMutation.mutate({
      cartItemId,
      quantity: 1,
    });
  };

  const handleDecrement = (cartItemId: string) => {
    decrementMutation.mutate({
      cartItemId,
      quantity: 1,
    });
  };

  const handleRemove = (cartItemId: string) => {
    removeMutation.mutate({
      cartItemId,
    });
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Your cart is empty",
        text2: "Add some items before checkout",
      });
      return;
    }
    router.push("/(protected)/(tabs)/shop/checkout");
  };

  const total =
    cartItems?.reduce(
      (sum, item) =>
        sum + parseFloat(item.product.price ?? "0") * item.quantity,
      0
    ) || 0;

  if (isCartLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#19B360" />
          <Text className="mt-4 text-gray-600">Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load cart
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Something went wrong while loading your cart items.
          </Text>
          <TouchableOpacity
            onPress={() => refetchCart()}
            className="bg-[#19B360] px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
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
              <Text className="text-2xl font-bold text-gray-900 ml-2">
                Cart
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
            </View>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={CartIconAsset}
            className="w-24 h-24 mb-6 opacity-50"
            resizeMode="contain"
          />
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Add some products to your cart to see them here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/shop")}
            className="bg-[#19B360] px-8 py-4 rounded-lg"
          >
            <Text className="text-white font-semibold text-lg">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
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
            <Text className="text-2xl font-bold text-gray-900 ml-2">Cart</Text>
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
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 pt-6">
          {cartItems.map((item) => (
            <View
              key={item.id}
              className="flex-row mb-4 rounded-2xl p-4 bg-white"
              style={shadowStyle}
            >
              <View className="w-20 h-20 p-2 bg-gray-50 rounded-xl">
                <Image
                  source={
                    item.product.image
                      ? { uri: item.product.image }
                      : PlaceholderProductImage
                  }
                  className="w-full h-full rounded-xl"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  numberOfLines={2}
                  className="text-base font-semibold text-gray-900 mb-1"
                >
                  {item.product.name}
                </Text>
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  {formatPrice(parseFloat(item.product.price ?? "0"))}
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleDecrement(item.id)}
                    disabled={decrementMutation.isPending}
                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
                  >
                    {decrementMutation.isPending ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : (
                      <Image
                        source={MinusIcon}
                        className="w-4 h-4"
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                  <Text className="mx-4 text-base font-semibold">
                    {item.quantity.toString().padStart(2, "0")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleIncrement(item.id)}
                    disabled={incrementMutation.isPending}
                    className="w-8 h-8 bg-green-500 rounded-full justify-center items-center"
                  >
                    {incrementMutation.isPending ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : (
                      <Image
                        source={PlusIcon}
                        className="w-4 h-4"
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(item.id)}
                disabled={removeMutation.isPending}
                className="ml-2 w-8 h-8 rounded-full justify-center items-center"
              >
                {removeMutation.isPending ? (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                  <Image
                    source={CancleIcon}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-4">
            <TextInput
              placeholder="Enter your promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 mr-2 bg-white"
              style={shadowStyle}
            />
            <TouchableOpacity
              className="bg-[#19B360] rounded-2xl p-3"
              style={shadowStyle}
            >
              <Image
                source={ArrowRightIcon}
                className="w-5 h-5"
                style={{ tintColor: "white" }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-6 mb-6" style={shadowStyle}>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">
                Total:
              </Text>
              <Text className="text-xl font-bold text-gray-900">
                {formatPrice(total)}
              </Text>
            </View>
          </View>

          {recommendedProducts && recommendedProducts.products.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-600">
                  Recommended items
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(protected)/(tabs)/shop")}
                >
                  <Text className="text-[#19B360] font-medium">
                    View All {">"}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recommendedProducts.products.slice(0, 6).map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() =>
                      router.push(
                        `/(protected)/(tabs)/shop/items/${product.id}`
                      )
                    }
                    className="mr-4 w-32"
                  >
                    <View
                      className="relative bg-white rounded-2xl p-2"
                      style={shadowStyle}
                    >
                      <Image
                        source={
                          product.primaryImage
                            ? { uri: product.primaryImage }
                            : PlaceholderProductImage
                        }
                        className="w-28 h-28 rounded-xl"
                        resizeMode="contain"
                      />
                      <SavedButton
                        productId={product.id}
                        storeId={product.storeId}
                        size="small"
                      />
                    </View>
                    <Text className="text-sm font-medium text-gray-900 mt-2">
                      {product.name.length > 15
                        ? product.name.slice(0, 15) + "..."
                        : product.name}
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 mt-1">
                      {formatPrice(parseFloat(product.price))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="p-6 bg-white">
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={
            incrementMutation.isPending ||
            decrementMutation.isPending ||
            removeMutation.isPending
          }
          className="bg-[#19B360] rounded-2xl py-4"
          style={shadowStyle}
        >
          {incrementMutation.isPending ||
          decrementMutation.isPending ||
          removeMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Checkout ({cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Cart;
